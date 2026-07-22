
namespace Ordering.Application.Orders.Queries.GetOrderById;

public class GetOrderByIdHandler(IApplicationDbContext dbContext) : IQueryHandler<GetOrderByIdQuery, GetOrderByIdResult>
{
    public async Task<GetOrderByIdResult> Handle(GetOrderByIdQuery query, CancellationToken cancellationToken)
    {
        var order = await dbContext.Orders.AsNoTracking().Include(x => x.OrderItems).FirstOrDefaultAsync(x => x.Id == OrderId.Of(query.Id));
        return new GetOrderByIdResult(order?.ToSingleOrderDto());
    }
}
