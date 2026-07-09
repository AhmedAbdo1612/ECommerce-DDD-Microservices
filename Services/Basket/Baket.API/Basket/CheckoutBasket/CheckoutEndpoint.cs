

namespace Baket.API.Basket.CheckoutBasket;

public record ChechoutBasketRequest(BasketCheckoutDto BasketCheckoutDto);
public record ChechoutBasketResponse(bool IsSuccess);
public class CheckoutEndpoint : ICarterModule
{
    void ICarterModule.AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/basket/Checkout", async (ChechoutBasketRequest request, ISender sender) =>
        {
            var command = request.Adapt<CheckoutBasketCommand>();
            var result = await sender.Send(command);
            var response = result.Adapt<ChechoutBasketResponse>();
            return Results.Ok(response);
        });
    }
}
