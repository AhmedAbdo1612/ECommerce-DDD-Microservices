namespace Ordering.Application.Orders.Commands.CreateOrder;

public class CreateOrderHandler(IApplicationDbContext dbContext) : ICommandHandler<CreateOrderCommand, CreateOrderResult>
{
    public async Task<CreateOrderResult> Handle(CreateOrderCommand command, CancellationToken cancellationToken)
    {
        var order = CreateNewOrder(command.Order);
       

        List<ProductId> orderProductsId = command.Order.OrderItems
            .Select(x => ProductId.Of(x.ProductId))
            .ToList();

        var productsIdInDb = await dbContext.Products
            .Where(p => orderProductsId.Contains(p.Id))
            .Select(x => x.Id).ToHashSetAsync();
       
        var missingPoructIds = orderProductsId
            .Where(x => !productsIdInDb.Contains(x))
            .Select(x => x.Value).ToList();
        if(missingPoructIds.Any())
        {
            List<Product> newProductsToAdd = command.Order.OrderItems
            .Where(x => missingPoructIds.Contains(x.ProductId))
            .Select(x => Product.Create(ProductId.Of(x.ProductId), x.ProductName, x.Price))
            .ToList();

            await dbContext.Products.AddRangeAsync(newProductsToAdd);
            
        }
        await dbContext.Orders.AddAsync(order);
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
            newOrder.Add(ProductId.Of(item.ProductId), item.Quantity, item.Price);
        }
        return newOrder;
    }
}
