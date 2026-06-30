namespace Ordering.Application.Orders.EventHandlers;

public class OrderCreatedEventHandler(ILogger<OrderCreatedEvent> logger) : INotificationHandler<OrderCreatedEvent>

{
    public async Task Handle(OrderCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation($"The notification received for order create event {notification}");
    }
}
