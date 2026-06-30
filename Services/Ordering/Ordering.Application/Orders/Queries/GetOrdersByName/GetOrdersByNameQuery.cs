
namespace Ordering.Application.Orders.Queries.GetOrdersByName;

public record GetOrdersByNameResult(IEnumerable<OrderDto> orders);
public record GetOrdersByNameQuery(string Name) : IQuery<GetOrdersByNameResult>
{
}
