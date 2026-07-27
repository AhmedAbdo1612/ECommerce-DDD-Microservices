

namespace Ordering.Application.Orders.Commands.UpdateOrderStatus;

public class UpdateOrderStatusHandler(IApplicationDbContext dbContext) : ICommandHandler<UpdateOrderStatusCommand, UpdateOrderStatusResult>
{
    public async Task<UpdateOrderStatusResult> Handle(UpdateOrderStatusCommand command, CancellationToken cancellationToken)
    {
        var orderId = OrderId.Of(command.OrderId);
        var order = await dbContext.Orders.FirstOrDefaultAsync(x => x.Id == orderId);
        if (order == null) throw new NotFoundException(nameof(Order), command.OrderId);
        order.UpdateOrderStatus(command.State);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new UpdateOrderStatusResult(true);
    }
}
