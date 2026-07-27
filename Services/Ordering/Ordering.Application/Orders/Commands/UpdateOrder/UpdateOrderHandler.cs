namespace Ordering.Application.Orders.Commands.UpdateOrder;

public class UpdateOrderHandler(IApplicationDbContext dbContext) : ICommandHandler<UpdateOrderCommand, UpdateOrderResult>
{
    public async Task<UpdateOrderResult> Handle(UpdateOrderCommand command, CancellationToken cancellationToken)
    {
        var orderId = OrderId.Of(command.Order.Id);
        var order   = await dbContext.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId, cancellationToken);

        if (order is null)
            throw new NotFoundException(nameof(Order), command.Order.Id);

        UpdateOrderFields(order, command.Order);
        ReconcileOrderItems(order, command.Order.OrderItems);

        dbContext.Orders.Update(order);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new UpdateOrderResult(true);
    }

  

    private static void UpdateOrderFields(Order order, OrderDto orderDto)
    {
        var shippingAddress = orderDto.ShippingAddress is not null
            ? Address.Of(
                orderDto.ShippingAddress.FirstName,
                orderDto.ShippingAddress.LastName,
                orderDto.ShippingAddress.EmailAddress,
                orderDto.ShippingAddress.AddressLine,
                orderDto.ShippingAddress.Country,
                orderDto.ShippingAddress.State,
                orderDto.ShippingAddress.ZipCode)
            : order.ShippingAddress;

        var billingAddress = orderDto.BillingAddress is not null
            ? Address.Of(
                orderDto.BillingAddress.FirstName,
                orderDto.BillingAddress.LastName,
                orderDto.BillingAddress.EmailAddress,
                orderDto.BillingAddress.AddressLine,
                orderDto.BillingAddress.Country,
                orderDto.BillingAddress.State,
                orderDto.BillingAddress.ZipCode)
            : order.BillingAddress;

        var payment = orderDto.Payment is not null
            ? Payment.Of(
                orderDto.Payment.CardName,
                orderDto.Payment.CardNumber,
                orderDto.Payment.Expiration,
                orderDto.Payment.Cvv,
                orderDto.Payment.PaymentMethod)
            : order.Payment;

        order.Update(
            OrderName.Of(orderDto.OrderName),
            shippingAddress,
            billingAddress,
            payment,
            orderDto.Status);
    }

    // ── item reconciliation ───────────────────────────────────────────────────

    private static void ReconcileOrderItems(Order order, List<OrderItemDto>? dtoItems)
    {
        if (dtoItems is null) return;   // no items payload → leave items unchanged

        var incomingByProduct = dtoItems
            .ToDictionary(i => i.ProductId);

        var existingByProduct = order.OrderItems
            .ToDictionary(i => i.ProductId.Value);

        // 1. Remove items that are no longer in the incoming list
        foreach (var existingProductId in existingByProduct.Keys)
        {
            if (!incomingByProduct.ContainsKey(existingProductId))
                order.Remove(ProductId.Of(existingProductId));
        }

        // 2. Update quantity/price for items that already exist
        foreach (var dto in dtoItems)
        {
            if (existingByProduct.ContainsKey(dto.ProductId))
            {
                order.UpdateItem(ProductId.Of(dto.ProductId), dto.Quantity, dto.Price);
            }
            else
            {
                // 3. Add brand-new items (product was not in the order before)
                order.Add(ProductId.Of(dto.ProductId), dto.ProductName, dto.Quantity, dto.Price);
            }
        }
    }
}
