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
        var eventMessage = command.Adapt<BasketCheckoutEvent>();
        eventMessage.TotalPrice = (decimal)basket.TotalPrice;
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
    }
}