namespace Ordering.Application.Orders.Commands.UpdateOrder;

public record UpdateOrderResult(bool IsSuccess);
public record UpdateOrderCommand(OrderDto Order) : ICommand<UpdateOrderResult>;

public class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
{
    public UpdateOrderCommandValidator()
    {
        RuleFor(o => o.Order.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(o => o.Order.OrderName).NotEmpty().WithMessage("Name is required");
        RuleFor(o => o.Order.CustomerId).NotEmpty().WithMessage("CustomerId is required");
    }
}