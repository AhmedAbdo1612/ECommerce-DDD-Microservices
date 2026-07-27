namespace Ordering.Application.Orders.Queries.GetOrdersByCustomer;

internal class GetOrdersByCustomerHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrdersByCustomerQuery, GetOrderByCustomerResult>
{
    public async Task<GetOrderByCustomerResult> Handle(GetOrdersByCustomerQuery query, CancellationToken cancellationToken)
    {
        var orders = await dbContext.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking()
            .Where(o => o.CustomerId == CustomerId.Of(query.CustomerId))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(cancellationToken);

        //var productIds = orders
        //    .SelectMany(o => o.OrderItems.Select(i => i.ProductId.Value))
        //    .Distinct()
        //    .ToList();

        //var productNames = await dbContext.Products
        //    .Where(p => productIds.Contains(p.Id.Value))
        //    .AsNoTracking()
        //    .ToDictionaryAsync(p => p.Id.Value, p => p.Name, cancellationToken);

        return new GetOrderByCustomerResult(orders.ToOrderDtoList());
    }
}
