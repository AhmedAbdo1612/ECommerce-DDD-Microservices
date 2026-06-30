namespace Ordering.Application.Extensions;

public static class OrderExtensions
{
    public static IEnumerable<OrderDto> ToOrderDtoList(this IEnumerable<Order> orders)
    {
        return orders.Select(x => new OrderDto(

            Id: x.Id.Value,
            CustomerId: x.CustomerId.Value,
            OrderName: x.OrderName.Value,
            ShippingAddress: new AddressDto(x.ShippingAddress.FirstName, x.ShippingAddress.LastName, x.ShippingAddress.EmailAddress!, x.ShippingAddress.AddressLine, x.ShippingAddress.Country, x.ShippingAddress.State, x.ShippingAddress.ZipCode),
            BillingAddress: new AddressDto(x.BillingAddress.FirstName, x.BillingAddress.LastName, x.BillingAddress.EmailAddress!, x.BillingAddress.AddressLine, x.BillingAddress.Country, x.BillingAddress.State, x.BillingAddress.ZipCode),
            Payment: new PaymentDto(x.Payment.CardName!, x.Payment.CardNumber, x.Payment.Expiration, x.Payment.CVV, x.Payment.PaymentMethod),
            Status: x.Status,
            OrderItems: x.OrderItems?.Select(i => new OrderItemDto(x.Id?.Value ??Guid.Empty, i.ProductId.Value , i.Quantity, i.Price)).ToList()
            ?? new List<OrderItemDto>()
            ));
    }
    public static OrderDto ToOrderDto(this Order x)
    {
        return new OrderDto(

              Id: x.Id.Value,
              CustomerId: x.CustomerId.Value,
              OrderName: x.OrderName.Value,
              ShippingAddress: new AddressDto(x.ShippingAddress.FirstName, x.ShippingAddress.LastName, x.ShippingAddress.EmailAddress!, x.ShippingAddress.AddressLine, x.ShippingAddress.Country, x.ShippingAddress.State, x.ShippingAddress.ZipCode),
              BillingAddress: new AddressDto(x.BillingAddress.FirstName, x.BillingAddress.LastName, x.BillingAddress.EmailAddress!, x.BillingAddress.AddressLine, x.BillingAddress.Country, x.BillingAddress.State, x.BillingAddress.ZipCode),
              Payment: new PaymentDto(x.Payment.CardName!, x.Payment.CardNumber, x.Payment.Expiration, x.Payment.CVV, x.Payment.PaymentMethod),
              Status: x.Status,
              OrderItems: x.OrderItems.Select(i => new OrderItemDto(x.Id.Value, i.ProductId.Value, i.Quantity, i.Price)).ToList()
              );
    }
}
