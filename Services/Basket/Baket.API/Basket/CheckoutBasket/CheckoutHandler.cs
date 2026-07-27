using BuildingBlocks.Messaging.Events;
using MassTransit;
using System.Globalization;

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
        RuleFor(x => x.BasketCheckoutDto)
            .NotNull().WithMessage("BasketCheckoutDto cannot be null");

        // 1. Identifiers Validation
        RuleFor(x => x.BasketCheckoutDto.UserName)
            .NotEmpty().WithMessage("UserName is required for checkout.");

        RuleFor(x => x.BasketCheckoutDto.CustomerId)
            .NotEmpty().WithMessage("CustomerId is required.");

        // 2. Shipping / Billing Info Validation
        RuleFor(x => x.BasketCheckoutDto.FirstName)
            .NotEmpty().WithMessage("FirstName is required.")
            .MaximumLength(50).WithMessage("FirstName cannot exceed 50 characters.");

        RuleFor(x => x.BasketCheckoutDto.LastName)
            .NotEmpty().WithMessage("LastName is required.")
            .MaximumLength(50).WithMessage("LastName cannot exceed 50 characters.");

        RuleFor(x => x.BasketCheckoutDto.EmailAddress)
            .NotEmpty().WithMessage("EmailAddress is required.")
            .EmailAddress().WithMessage("Please enter a valid email address.")
            .MaximumLength(50).WithMessage("EmailAddress cannot exceed 50 characters.");

        RuleFor(x => x.BasketCheckoutDto.AddressLine)
            .NotEmpty().WithMessage("AddressLine is required.")
            .MaximumLength(180).WithMessage("AddressLine cannot exceed 180 characters.");

        RuleFor(x => x.BasketCheckoutDto.Country)
            .MaximumLength(50).WithMessage("Country cannot exceed 50 characters.");

        RuleFor(x => x.BasketCheckoutDto.State)
            .MaximumLength(50).WithMessage("State cannot exceed 50 characters.");

        RuleFor(x => x.BasketCheckoutDto.ZipCode)
            .MaximumLength(20).WithMessage("ZipCode cannot exceed 20 characters.");

        // 3. Payment Details Validation
        RuleFor(x => x.BasketCheckoutDto.CardName)
            .MaximumLength(50).WithMessage("CardName cannot exceed 50 characters.");

        RuleFor(x => x.BasketCheckoutDto.CardNumber)
            .NotEmpty().WithMessage("CardNumber is required.")
            .CreditCard().WithMessage("Please enter a valid credit card number.");

        RuleFor(x => x.BasketCheckoutDto.Expiration)
            .NotEmpty().WithMessage("Expiration is required.")
            .MaximumLength(10).WithMessage("Expiration cannot exceed 10 characters.");

        RuleFor(x => x.BasketCheckoutDto.CVV)
             .NotEmpty().WithMessage("CVV is required.")
             .Matches(@"^[0-9]{3,4}$").WithMessage("CVV must be 3 or 4 digits.");
        RuleFor(x => x.BasketCheckoutDto.Expiration)
            .NotEmpty().WithMessage("Expiration is required.")
            .Must(BeAValidExpirationDate).WithMessage("Expiration date must be in MM/YY or MM/YYYY format and not expired.");
    }
    private bool BeAValidExpirationDate(string expiration)
    {
        if (string.IsNullOrWhiteSpace(expiration)) return false;

        string[] formats = { "MM/yy", "MM/yyyy", "MM-yy", "MM-yyyy" };

        if (!DateTime.TryParseExact(
                expiration,
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out DateTime parsedDate))
        {
            return false; // الصيغة غير صحيحة
        }

        var lastDayOfMonth = new DateTime(parsedDate.Year, parsedDate.Month, DateTime.DaysInMonth(parsedDate.Year, parsedDate.Month));

        return lastDayOfMonth >= DateTime.UtcNow.Date;
    }
}