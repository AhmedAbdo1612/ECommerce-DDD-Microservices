namespace Ordering.Application.Orders.Queries.GetOrdersByCustomer;

public record GetOrderByCustomerResult(IEnumerable<OrderDto> Orders);
public record GetOrdersByCustomerQuery(Guid CustomerId) : IQuery<GetOrderByCustomerResult>;

