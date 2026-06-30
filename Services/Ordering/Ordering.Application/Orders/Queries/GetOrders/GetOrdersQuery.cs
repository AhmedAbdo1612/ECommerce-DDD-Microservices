using BuildingBlocks.Pagination;

namespace Ordering.Application.Orders.Queries.GetOrders;

public record GetOrdersResult(PaginationResult<OrderDto> Orders);
public record GetOrdersQuery(PaginationRequest PaginationRequest) : IQuery<GetOrdersResult>;
