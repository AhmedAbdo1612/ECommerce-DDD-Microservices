

using Ordering.Application.Orders.Commands.CreateOrder;
using OrderingDomain.Enums;

namespace Ordering.Application.Orders.EventHandlers.Integration;

public class BasketCheckoutEventHandler(ISender sender, ILogger<BasketCheckoutEventHandler> logger) : IConsumer<BasketCheckoutEvent>
{
    public async Task Consume(ConsumeContext<BasketCheckoutEvent> context)
    {
        logger.LogInformation($"Integration Event handled {context.Message.GetType().Name}");
        var command = MapToCreateOrderCommand(context.Message);
        await sender.Send(command);
    }

    private CreateOrderCommand MapToCreateOrderCommand(BasketCheckoutEvent message)
    {
        var addressDto = new AddressDto(
            message.FirstName,
            message.LastName,
            message.EmailAddress,
            message.AddressLine,
            message.Country,
            message.State,
            message.ZipCode
            );
        var paymentDto = new PaymentDto(message.CardName, message.CardNumber, message.Expiration, message.CVV, message.PaymentMethod);
        var orderId = Guid.NewGuid();
        var orderDto = new OrderDto(
            Id: orderId,
          CreatedAt: DateTime.UtcNow,
            CustomerId: message.CustomerId,
            OrderName: null!,
            ShippingAddress: addressDto,
            BillingAddress: addressDto,
            Payment: paymentDto,
            Status: OrderStatus.Pending,
            OrderItems: message.OrderItems.Select(x=>new OrderItemDto(orderId,x.ProductId,x.ProductName,x.Quantity,x.Price)).ToList()
            );
        return new CreateOrderCommand(orderDto);

    }
}
