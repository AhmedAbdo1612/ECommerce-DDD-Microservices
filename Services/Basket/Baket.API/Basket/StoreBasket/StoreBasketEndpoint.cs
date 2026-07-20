using Baket.API.Basket.StoreBasket;

public record StoreBasketRequest(ShoppingCart Cart);
public record StoreBasketResponse(string UserName);
public class StoreBasketEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/basket", async (StoreBasketRequest request, ISender sender, HttpContext context) =>
        {
            if (!context.User.IsInRole("Admin") && context.User.Identity?.Name != request.Cart.UserName)
            {
                return Results.Forbid();
            }

            var command = request.Adapt<StoreBasketCommand>();
            var result = await sender.Send(command);
            var response = result.Adapt<StoreBasketResponse>();
            return Results.Created($"/basket/{response.UserName}", response);
        }).WithName("StoreBasket");
    }
}

