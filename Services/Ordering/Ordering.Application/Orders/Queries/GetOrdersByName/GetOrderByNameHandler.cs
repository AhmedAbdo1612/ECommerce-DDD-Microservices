namespace Ordering.Application.Orders.Queries.GetOrdersByName;

public class GetOrderByNameHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrdersByNameQuery, GetOrdersByNameResult>
{
    public async Task<GetOrdersByNameResult> Handle(GetOrdersByNameQuery query, CancellationToken cancellationToken)
    {
        var orders = await dbContext.Orders
            .Include(o => o.OrderItems)
            .AsNoTracking()
            .Where(x => x.OrderName.Value.Contains(query.Name))
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

        var productIds = orders
            .SelectMany(o => o.OrderItems.Select(i => i.ProductId.Value))
            .Distinct()
            .ToList();

        var productNames = await dbContext.Products
            .Where(p => productIds.Contains(p.Id.Value))
            .AsNoTracking()
            .ToDictionaryAsync(p => p.Id.Value, p => p.Name, cancellationToken);

        return new GetOrdersByNameResult(orders.ToOrderDtoList(productNames));
    }
}