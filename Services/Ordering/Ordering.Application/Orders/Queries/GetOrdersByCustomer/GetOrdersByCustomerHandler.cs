namespace Ordering.Application.Orders.Queries.GetOrdersByCustomer;

internal class GetOrdersByCustomerHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrdersByCustomerQuery, GetOrderByCustomerResult>
{
    public async Task<GetOrderByCustomerResult> Handle(GetOrdersByCustomerQuery query, CancellationToken cancellationToken)
    {

        var orders = await dbContext.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking()
            .Where(o => o.CustomerId == CustomerId.Of(query.CustomerId))
            .OrderBy(o => o.CreatedAt).ToListAsync(cancellationToken);

        //var orders = await dbContext.Orders
        //    .Include(o=>o.OrderItems)
        //    .Where(o => o.CustomerId == CustomerId.Of(query.CustomerId))
        //    .OrderBy(o => o.CreatedAt)
        //    .Select(o => o.ToOrderDto()).ToListAsync(cancellationToken);
        return new GetOrderByCustomerResult(orders.ToOrderDtoList());
    }
}
