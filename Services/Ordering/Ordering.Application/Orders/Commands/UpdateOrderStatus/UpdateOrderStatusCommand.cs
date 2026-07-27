using ImTools;
using OrderingDomain.Enums;

namespace Ordering.Application.Orders.Commands.UpdateOrderStatus;

public record UpdateOrderStatusResult(bool IsSuccess);
public record UpdateOrderStatusCommand(Guid OrderId, OrderStatus State) : ICommand<UpdateOrderStatusResult>;
public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId)
            .NotEmpty()
            .WithMessage("OrderId is required.");

        RuleFor(x => x.State)
            .IsInEnum()
            .WithMessage("Invalid order status value.");
    }
}