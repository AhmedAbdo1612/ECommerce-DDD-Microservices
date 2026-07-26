using BuildingBlocks.Messaging.Events;
using MassTransit;

namespace Baket.API.Basket.CheckoutBasket;

public record CheckoutBasketCommand(BasketCheckoutDto BasketCheckoutDto) : ICommand<CheckoutBasketResult>;
public record CheckoutBasketResult(bool IsSuccess);
public class CheckoutHandler(IBasketRespository repo, IPublishEndpoint publish) : ICommandHandler<CheckoutBasketCommand, CheckoutBasketResult>
{
    public async Task<CheckoutBasketResult> Handle(CheckoutBasketCommand command, CancellationToken cancellationToken)
    {
        var basket = await repo.GetBasket(command.BasketCheckoutDto.UserName, cancellationToken);
        if (basket == null) return new CheckoutBasketResult(false);
        var eventMessage = command.BasketCheckoutDto.Adapt<BasketCheckoutEvent>();
        eventMessage.TotalPrice = (decimal)basket.TotalPrice;
        eventMessage.OrderItems = basket.Items.Select(x=>new CartOrderItem(x.ProductId,x.ProductName,x.Quantity,x.Price)).ToList();
        Console.WriteLine($"\nfrom the basket service========================>  ");
        foreach(var item in eventMessage.OrderItems)
        {
            Console.WriteLine(item.ProductName);
        }
        await publish.Publish(eventMessage, cancellationToken);
        await repo.DeleteBasket(command.BasketCheckoutDto.UserName, cancellationToken);
        return new CheckoutBasketResult(true);
    }
}

public class CheckoutBasketCommandValidatior : AbstractValidator<CheckoutBasketCommand>
{
    public CheckoutBasketCommandValidatior()
    {
        RuleFor(x => x.BasketCheckoutDto).NotNull().WithMessage("BasketCheckoutDto cannot be null");
        RuleFor(x => x.BasketCheckoutDto.UserName).NotEmpty().WithMessage("UserName is required for checkout");
        RuleFor(x => x.BasketCheckoutDto.ZipCode).NotNull().WithMessage("ZipCode is required").MaximumLength(20).WithMessage("Please enter a valid zip code");
        RuleFor(x => x.BasketCheckoutDto.CVV).NotEmpty().WithMessage("CVV is required")
            .MaximumLength(4)
            .WithMessage("CVV can not be more than 4 digits")
            .MinimumLength(3).WithMessage("CVV can not be less than 3 digits");
    }
}