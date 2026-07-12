namespace Ordering.Application.Orders.EventHandlers.Domain;

public class OrderUpdatedEventHandler(ILogger<OrderUpdatedEventHandler> logger) : INotificationHandler<OrderUpdateEvent>
{
    public Task Handle(OrderUpdateEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation($"The notification Received for orderupdatedevet {notification}");
        return Task.CompletedTask;
    }
}
