using BuildingBlocks.Pagination;

namespace Ordering.Application.Orders.Queries.GetOrders;

public class GetOrdersHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> Handle(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        var totalOrdersCount = await dbContext.Orders.LongCountAsync();

        var orders = await dbContext.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking()
            .Skip(query.PaginationRequest.PageSize * query.PaginationRequest.PageIndex)
            .Take(query.PaginationRequest.PageSize)
            .ToListAsync(cancellationToken);

        return new GetOrdersResult(new PaginationResult<OrderDto>(query.PaginationRequest.PageIndex,
            query.PaginationRequest.PageSize,
            totalOrdersCount,
            orders.ToOrderDtoList()
            ));
    }
}
