

namespace Ordering.Application.Orders.EventHandlers.Domain;

public class OrderCreatedEventHandler(
    ILogger<OrderCreatedEvent> logger,
    IPublishEndpoint publish,
    IFeatureManager featureManager
    ) : INotificationHandler<OrderCreatedEvent>

{
    public async Task Handle(OrderCreatedEvent notification, CancellationToken cancellationToken)
    {
        logger.LogInformation($"The notification received for order create event {notification}");
        if (await featureManager.IsEnabledAsync("OrderFullfilment"))
        {
            var orderCreatedEvent = notification.order.ToSingleOrderDto();
            await publish.Publish(orderCreatedEvent, cancellationToken);
        }
    }


}
