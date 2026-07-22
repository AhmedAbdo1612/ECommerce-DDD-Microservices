using BuildingBlocks.Pagination;

namespace Ordering.Application.Orders.Queries.GetOrders;

public class GetOrdersHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrdersQuery, GetOrdersResult>
{
    public async Task<GetOrdersResult> Handle(GetOrdersQuery query, CancellationToken cancellationToken)
    {
        var orders = await dbContext.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking()
            .Skip(query.PaginationRequest.PageSize * query.PaginationRequest.PageIndex)
            .Take(query.PaginationRequest.PageSize)
            .ToListAsync(cancellationToken);

        //// Collect all unique product IDs referenced by these orders
        //var productIds = orders
        //    .SelectMany(o => o.OrderItems.Select(i => i.ProductId.Value))
        //    .Distinct()
        //    .ToList();

        //// Single extra query to fetch product names
        //var productNames = await dbContext.Products
        //    .Where(p => productIds.Contains(p.Id.Value))
        //    .AsNoTracking()
        //    .ToDictionaryAsync(p => p.Id.Value, p => p.Name, cancellationToken);

        return new GetOrdersResult(orders.ToOrderDtoList());
    }
}
