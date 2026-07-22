using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Ordering.Infrastructure.Data.Interceptors;

/// <summary>
/// EF Core interceptor that stamps <c>CreatedAt</c> / <c>LastModified</c>
/// timestamps (and the acting user) on every <see cref="IEntity"/> before
/// changes are committed.
/// </summary>
public class AuditableEntityInterceptor(IHttpContextAccessor httpContextAccessor)
    : SaveChangesInterceptor
{
    // ── Synchronous path ────────────────────────────────────────────────────
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    // ── Asynchronous path ───────────────────────────────────────────────────
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    // ── Core logic ──────────────────────────────────────────────────────────
    private void UpdateEntities(DbContext? context)
    {
        if (context is null) return;

        // Resolve the current user from the HTTP context (falls back to "system").
        var currentUser = httpContextAccessor.HttpContext?.User
            .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? "system";

        foreach (var entry in context.ChangeTracker.Entries<IEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedBy = currentUser;
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }

            // BUG-FIX: Original code had operator-precedence issue —
            //   "a && b && c == X || d == Y"  was parsed as
            //   "(a && b && c == X) || (d == Y)"  which evaluates the last
            //   condition independently and can throw NullReferenceException.
            // Fixed by grouping the OR inside parentheses.
            if (entry.State is EntityState.Added or EntityState.Modified
                || entry.HasChangedOwnedEntities())
            {
                entry.Entity.LastModifiedBy = currentUser;
                entry.Entity.LastModified   = DateTime.UtcNow;
            }
        }
    }
}

public static class EntityEntryExtensions
{
    /// <summary>
    /// Returns <c>true</c> if any owned (complex-property / shadow-owned)
    /// entity referenced by this entry has been added or modified.
    /// </summary>
    public static bool HasChangedOwnedEntities(this EntityEntry entry) =>
        entry.References.Any(r =>
            r.TargetEntry is not null
            && r.TargetEntry.Metadata.IsOwned()
            && r.TargetEntry.State is EntityState.Added or EntityState.Modified);
}
