namespace Baket.API.Basket.DeleteBasket;

public record DeleteBasketResult(bool IsSuccess);
public record DeleteBasketCommand(string UserName) : ICommand<DeleteBasketResult>;

public class DeleteBasketCommandValidator : AbstractValidator<DeleteBasketCommand>
{
    public DeleteBasketCommandValidator()
    {
        RuleFor(x => x.UserName).NotEmpty().WithMessage("Username is required");
    }
}
public class DeleteBasketHandler(IBasketRespository repo) : ICommandHandler<DeleteBasketCommand, DeleteBasketResult>
{
    public async Task<DeleteBasketResult> Handle(DeleteBasketCommand command, CancellationToken cancellationToken)
    {
        var result =await repo.DeleteBasket(command.UserName, cancellationToken);
        return new DeleteBasketResult(result);
    }
}

