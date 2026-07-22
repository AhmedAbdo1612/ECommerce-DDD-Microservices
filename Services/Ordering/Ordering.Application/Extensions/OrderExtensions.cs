namespace Ordering.Application.Extensions;

public static class OrderExtensions
{
    // ── helpers ──────────────────────────────────────────────────────────────

    private static OrderItemDto ToOrderItemDto(
        this OrderItem i,
        Guid orderId,
        IReadOnlyDictionary<Guid, string> productNames)
    {
        var name = productNames.TryGetValue(i.ProductId.Value, out var n) ? n : i.ProductId.Value.ToString();
        return new OrderItemDto(orderId, i.ProductId.Value, name, i.Quantity, i.Price);
    }

    private static OrderDto ToOrderDto(
        this Order x,
        IReadOnlyDictionary<Guid, string> productNames)
    {
        return new OrderDto(
            Id:              x.Id.Value,
            CustomerId:      x.CustomerId.Value,
            OrderName:       x.OrderName.Value,
            ShippingAddress: new AddressDto(x.ShippingAddress.FirstName, x.ShippingAddress.LastName, x.ShippingAddress.EmailAddress!, x.ShippingAddress.AddressLine, x.ShippingAddress.Country, x.ShippingAddress.State, x.ShippingAddress.ZipCode),
            BillingAddress:  new AddressDto(x.BillingAddress.FirstName, x.BillingAddress.LastName, x.BillingAddress.EmailAddress!, x.BillingAddress.AddressLine, x.BillingAddress.Country, x.BillingAddress.State, x.BillingAddress.ZipCode),
            Payment:         new PaymentDto(x.Payment.CardName!, x.Payment.CardNumber, x.Payment.Expiration, x.Payment.CVV, x.Payment.PaymentMethod),
            Status:          x.Status,
            OrderItems:      x.OrderItems?
                              .Select(i => i.ToOrderItemDto(x.Id.Value, productNames))
                              .ToList()
                             ?? new List<OrderItemDto>()
        );
    }

    // ── public API ───────────────────────────────────────────────────────────

    /// <summary>
    /// Maps a list of <see cref="Order"/> entities to DTOs.
    /// <paramref name="productNames"/> is a Guid→Name lookup built in the handler
    /// so that product names can be embedded in every OrderItemDto.
    /// </summary>
    public static IEnumerable<OrderDto> ToOrderDtoList(
        this IEnumerable<Order> orders,
        IReadOnlyDictionary<Guid, string>? productNames = null)
    {
        var names = productNames ?? new Dictionary<Guid, string>();
        return orders.Select(x => x.ToOrderDto(names));
    }

    /// <summary>Single-order convenience overload.</summary>
    public static OrderDto ToSingleOrderDto(
        this Order x,
        IReadOnlyDictionary<Guid, string>? productNames = null)
    {
        return x.ToOrderDto(productNames ?? new Dictionary<Guid, string>());
    }
}
