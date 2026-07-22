using BuildingBlocks.Exceptions;

namespace Ordering.Application.Orders.Commands.UpdateOrder;

public record UpdateOrderResult(bool IsSuccess);
public record UpdateOrderCommand(OrderDto Order) : ICommand<UpdateOrderResult>;

public class UpdateOrderCommandValidator : AbstractValidator<UpdateOrderCommand>
{
    public UpdateOrderCommandValidator()
    {
        // ── Identity ──────────────────────────────────────────────────────────
        RuleFor(o => o.Order.Id)
            .NotEmpty()
            .WithMessage("Order ID is required.");

        RuleFor(o => o.Order.CustomerId)
            .NotEmpty()
            .WithMessage("Customer ID is required.");

        // ── Order name ────────────────────────────────────────────────────────
        RuleFor(o => o.Order.OrderName)
            .NotEmpty()
            .WithMessage("Order name is required.")
            .MaximumLength(100)
            .WithMessage("Order name must not exceed 100 characters.");

        // ── Status ────────────────────────────────────────────────────────────
        RuleFor(o => o.Order.Status)
            .IsInEnum()
            .WithMessage("Invalid order status value.");

        // ── Shipping address ──────────────────────────────────────────────────
        RuleFor(o => o.Order.ShippingAddress)
            .NotNull()
            .WithMessage("Shipping address is required.")
            .When(o => o.Order.ShippingAddress is not null, ApplyConditionTo.CurrentValidator);

        When(o => o.Order.ShippingAddress is not null, () =>
        {
            RuleFor(o => o.Order.ShippingAddress!.EmailAddress)
                .NotEmpty().EmailAddress()
                .WithMessage("Shipping address must have a valid email.");

            RuleFor(o => o.Order.ShippingAddress!.AddressLine)
                .NotEmpty()
                .WithMessage("Shipping address line is required.")
                .MaximumLength(180);

            RuleFor(o => o.Order.ShippingAddress!.ZipCode)
                .MaximumLength(20)
                .WithMessage("Zip code must not exceed 20 characters.");
        });

        // ── Billing address ───────────────────────────────────────────────────
        When(o => o.Order.BillingAddress is not null, () =>
        {
            RuleFor(o => o.Order.BillingAddress!.EmailAddress)
                .NotEmpty().EmailAddress()
                .WithMessage("Billing address must have a valid email.");

            RuleFor(o => o.Order.BillingAddress!.AddressLine)
                .NotEmpty()
                .WithMessage("Billing address line is required.")
                .MaximumLength(180);
        });

        // ── Payment ───────────────────────────────────────────────────────────
        When(o => o.Order.Payment is not null, () =>
        {
            RuleFor(o => o.Order.Payment!.CardNumber)
                .NotEmpty()
                .WithMessage("Card number is required.")
                .MaximumLength(24);

            RuleFor(o => o.Order.Payment!.Cvv)
                .NotEmpty()
                .WithMessage("CVV is required.")
                .MaximumLength(3)
                .WithMessage("CVV must be at most 3 characters.");

            RuleFor(o => o.Order.Payment!.Expiration)
                .NotEmpty()
                .WithMessage("Card expiration is required.");
        });
    }
}