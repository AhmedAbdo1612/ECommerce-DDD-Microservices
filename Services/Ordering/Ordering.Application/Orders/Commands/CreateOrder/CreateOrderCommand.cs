namespace Ordering.Application.Orders.Commands.CreateOrder;

public record CreateOrderResult(Guid Id);
public record CreateOrderCommand(OrderDto Order) : ICommand<CreateOrderResult>;
public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(c => c.Order.OrderName).NotEmpty().WithMessage("Name is Required");
        RuleFor(x => x.Order.CustomerId).NotNull().WithMessage("CustomerId is required");
        RuleFor(c => c.Order.OrderItems).NotEmpty().WithMessage("OrderItems should not be null");
    }
}