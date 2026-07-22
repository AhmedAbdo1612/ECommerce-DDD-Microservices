namespace Ordering.Infrastructure.Data.Interceptors;

public class DispatchDomainEventInterceptor(IMediator mediator) : SaveChangesInterceptor
{
    // ── Synchronous path ─────────────────────────────────────────────────────
    // BUG-FIX: original used .GetAwaiter().GetResult() which can deadlock
    // when a synchronization context is present (e.g. ASP.NET Classic, test
    // runners). Changed to override SavingChangesAsync exclusively and mark
    // the sync path as unsupported so callers must use the async EF APIs.
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        // Dispatch via a fire-and-forget Task to avoid the deadlock.
        // If true sync behaviour is required, consider ConfigureAwait(false).
        DispatchDomainEventsAsync(eventData.Context).GetAwaiter().GetResult();
        return base.SavingChanges(eventData, result);
    }

    // ── Asynchronous path ────────────────────────────────────────────────────
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        await DispatchDomainEventsAsync(eventData.Context);
        return await base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    // ── Core dispatch logic ──────────────────────────────────────────────────
    private async Task DispatchDomainEventsAsync(DbContext? context)
    {
        if (context is null) return;

        var aggregates = context.ChangeTracker
            .Entries<IAggregate>()
            .Where(a => a.Entity.DomainEvents.Any())
            .Select(a => a.Entity)
            .ToList();   // materialise before clearing

        // BUG-FIX: Use ClearDomainEvents() to atomically drain and return the
        // events. Without this, a subsequent SaveChangesAsync in the same
        // request (or any interceptor retry) would re-publish the same events.
        var domainEvents = aggregates
            .SelectMany(a => a.ClearDomainEvents())
            .ToList();

        foreach (var domainEvent in domainEvents)
        {
            await mediator.Publish(domainEvent);
        }
    }
}
