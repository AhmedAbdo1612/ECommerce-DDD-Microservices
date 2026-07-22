using BuildingBlocks.Pagination;

namespace Ordering.Application.Orders.Queries.GetOrders;

public record GetOrdersResult(IEnumerable<OrderDto> Orders);
public record GetOrdersQuery(PaginationRequest PaginationRequest) : IQuery<GetOrdersResult>;
