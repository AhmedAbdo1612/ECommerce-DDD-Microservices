

namespace Ordering.Infrastructure.Data.Interceptors;

public class AuditableEntityInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public void UpdateEntities(DbContext? context)
    {
        if (context == null) return;
        foreach (var entry in context.ChangeTracker.Entries<IEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedBy = "Ahmed123";
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }

            if (entry.State == EntityState.Added || entry.State == EntityState.Modified || entry.HasChangedOwnedEntites())
            {
                entry.Entity.LastModifiedBy = "Ahmed123";
                entry.Entity.LastModified = DateTime.UtcNow;
            }
        }
    }

}

public static class Extensions
{
    public static bool HasChangedOwnedEntites(this EntityEntry entry)
    {
        return entry.References.Any(
            x => x.TargetEntry != null &&
            x.TargetEntry.Metadata.IsOwned() &&
            x.TargetEntry.State == EntityState.Added || x.TargetEntry.State == EntityState.Modified
            );
    }
}
