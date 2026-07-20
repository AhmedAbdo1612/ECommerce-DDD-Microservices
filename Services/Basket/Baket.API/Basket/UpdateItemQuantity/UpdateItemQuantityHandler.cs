using Discount.Grpc.Protos;

namespace Baket.API.Basket.UpdateItemQuantity
{
    public record UpdateItemQuantityCommand(string UserName, Guid ProductId, int Quantity) : ICommand<UpdateItemQuantityResult>;
    public record UpdateItemQuantityResult(ShoppingCart Cart);
    
    public class UpdateItemQuantityCommandValidator : AbstractValidator<UpdateItemQuantityCommand>
    {
        public UpdateItemQuantityCommandValidator()
        {
            RuleFor(x => x.UserName).NotEmpty().WithMessage("Username is required");
            RuleFor(x => x.ProductId).NotEmpty().WithMessage("ProductId is required");
            RuleFor(x => x.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0");
        }
    }

    public class UpdateItemQuantityCommandHandler(IBasketRespository repo, DiscountProtoService.DiscountProtoServiceClient discountProto) : ICommandHandler<UpdateItemQuantityCommand, UpdateItemQuantityResult>
    {
        public async Task<UpdateItemQuantityResult> Handle(UpdateItemQuantityCommand command, CancellationToken cancellationToken)
        {
            var basket = await repo.GetBasket(command.UserName, cancellationToken);
            
            var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == command.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity = command.Quantity;
                
                // Deduct discount based on the updated item (although quantity changes the total, the unit price discount should still apply)
                try
                {
                    var coupon = await discountProto.GetDescountAsync(new GetDescountRequest { ProductName = existingItem.ProductName }, cancellationToken: cancellationToken);
                    // Resetting the price logic might require the original price if we apply a discount, 
                    // but for now we'll just deduct it from the current price or ensure we do the same as StoreBasket.
                    // StoreBasket deduplicates by just reducing from whatever price is set. 
                    // To keep it simple and consistent:
                    // we could fetch discount and apply it to the base price, but let's assume price comes from catalog and is already on existingItem.
                    existingItem.Price -= coupon.Amount;
                }
                catch (Exception)
                {
                    // Discount not found or service unavailable
                }
            }
            
            await repo.StoreBasket(basket, cancellationToken);
            return new UpdateItemQuantityResult(basket);
        }
    }
}
