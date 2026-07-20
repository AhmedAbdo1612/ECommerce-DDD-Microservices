namespace Baket.API.Basket.RemoveItem
{
    public record RemoveItemCommand(string UserName, Guid ProductId) : ICommand<RemoveItemResult>;
    public record RemoveItemResult(ShoppingCart Cart);
    
    public class RemoveItemCommandValidator : AbstractValidator<RemoveItemCommand>
    {
        public RemoveItemCommandValidator()
        {
            RuleFor(x => x.UserName).NotEmpty().WithMessage("Username is required");
            RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
        }
    }

    public class RemoveItemCommandHandler(IBasketRespository repo) : ICommandHandler<RemoveItemCommand, RemoveItemResult>
    {
        public async Task<RemoveItemResult> Handle(RemoveItemCommand command, CancellationToken cancellationToken)
        {
            var basket = await repo.GetBasket(command.UserName, cancellationToken);
            
            var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == command.ProductId);
            if (existingItem != null)
            {
                basket.Items.Remove(existingItem);
            }
            
            await repo.StoreBasket(basket, cancellationToken);
            return new RemoveItemResult(basket);
        }
    }
}
