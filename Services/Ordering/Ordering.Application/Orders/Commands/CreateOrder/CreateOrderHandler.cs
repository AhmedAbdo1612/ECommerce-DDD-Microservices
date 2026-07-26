namespace Ordering.Application.Orders.Commands.CreateOrder;

public class CreateOrderHandler(IApplicationDbContext dbContext) : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = CreateNewOrder(command.Order);
        await dbContext.Orders.AddAsync(order);

        await dbContext.SaveChangesAsync(cancellationToken);
        Console.WriteLine($"\n the order id ==={order.Id.Value}");
        Console.WriteLine($"the length of order items {command.Order.OrderItems.Count()}");
        var orderItems = new List<OrderItem>();

        foreach (var item in command.Order.OrderItems)
        {
            orderItems.Add(OrderItem.Create(order.Id, ProductId.Of(item.ProductId), item.Quantity, item.Price));
            Console.WriteLine($"the order id from item ====={item.OrderId}");
            Console.WriteLine($"the orderitem id from item ====={item.ProductName}");
        }
        await dbContext.OrderItems.AddRangeAsync(orderItems);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new CreateOrderResult(order.Id.Value);
    }

    private Order CreateNewOrder(OrderDto orderDto)
    {
        var shippingAddress = Address.Of(
            orderDto.ShippingAddress.FirstName,
            orderDto.ShippingAddress.LastName,
            orderDto.ShippingAddress.EmailAddress,
            orderDto.ShippingAddress.AddressLine,
            orderDto.ShippingAddress.Country,
            orderDto.ShippingAddress.State,
            orderDto.ShippingAddress.ZipCode
            );

        var billingAddress = Address.Of(
            orderDto.BillingAddress.FirstName,
            orderDto.BillingAddress.LastName,
            orderDto.BillingAddress.EmailAddress,
            orderDto.BillingAddress.AddressLine,
            orderDto.BillingAddress.Country,
            orderDto.BillingAddress.State,
            orderDto.BillingAddress.ZipCode
            );
        var newOrder = Order.Create(
            id: OrderId.Of(Guid.NewGuid()),
            customerId: CustomerId.Of(orderDto.CustomerId),
            orderName: OrderName.Of(orderDto.OrderName),
            shippingAddress: shippingAddress,
            billingAddress: billingAddress,
            payment: Payment.Of(
                orderDto.Payment.CardName,
                orderDto.Payment.CardNumber,
                orderDto.Payment.Expiration,
                orderDto.Payment.Cvv,
                orderDto.Payment.PaymentMethod
                )
            );
        foreach (var item in orderDto.OrderItems)
        {
            //newOrder.Add(ProductId.Of(item.ProductId), item.Quantity, item.Price);
        }
        return newOrder;
    }
}
