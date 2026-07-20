using Discount.Grpc.Protos;

namespace Baket.API.Basket.AddItem
{
    public record AddItemCommand(string UserName, ShoppingCartItem Item) : ICommand<AddItemResult>;
    public record AddItemResult(ShoppingCart Cart);
    
    public class AddItemCommandValidator : AbstractValidator<AddItemCommand>
    {
        public AddItemCommandValidator()
        {
            RuleFor(x => x.UserName).NotEmpty().WithMessage("Username is required");
            RuleFor(x => x.Item).NotNull().WithMessage("Item cannot be null");
        }
    }

    public class AddItemCommandHandler(IBasketRespository repo, DiscountProtoService.DiscountProtoServiceClient discountProto) : ICommandHandler<AddItemCommand, AddItemResult>
    {
        public async Task<AddItemResult> Handle(AddItemCommand command, CancellationToken cancellationToken)
        {
            var basket = await repo.GetBasket(command.UserName, cancellationToken);

            if (basket==null)
            {
                 basket = new ShoppingCart(command.UserName);
                await repo.StoreBasket(basket);
            }
            try
            {
                var coupon = await discountProto.GetDescountAsync(new GetDescountRequest { ProductName = command.Item.ProductName }, cancellationToken: cancellationToken);
                command.Item.Price -= coupon.Amount;
            }
            catch (Exception)
            {
                // Discount not found or service unavailable
            }

            var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == command.Item.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += command.Item.Quantity;
                existingItem.Price = command.Item.Price;
                existingItem.Color = command.Item.Color;
                existingItem.ProductName = command.Item.ProductName;
            }
            else
            {
                basket.Items.Add(command.Item);
            }
            
            await repo.StoreBasket(basket, cancellationToken);
            return new AddItemResult(basket);
        }
    }
}
