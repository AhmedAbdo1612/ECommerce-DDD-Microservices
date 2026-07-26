
using System.Security.Claims;

namespace Baket.API.Basket.GetBaket
{
    public record GetBasketReponse(ShoppingCart Cart);
    public class GetBasketEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/basket/{userName}", async (string userName, ISender sender, HttpContext context) =>
            {
                if (!context.User.IsInRole("Admin") && context.User.FindFirstValue("username") != userName)
                {
                    return Results.Forbid();
                }

                var result = await sender.Send(new GetBasketQuery(userName));
                var response = result.Adapt<GetBasketReponse>();
                return Results.Ok(response);
            }).WithName("GetBasket");
        }
    }
}
