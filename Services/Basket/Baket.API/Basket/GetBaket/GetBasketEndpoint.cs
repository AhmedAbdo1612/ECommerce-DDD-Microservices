
namespace Baket.API.Basket.GetBaket
{
    public record GetBasketReponse(ShoppingCart Cart);
    public class GetBasketEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/basket/{userName}", async (string userName, ISender sender, Microsoft.AspNetCore.Http.HttpContext context) =>
            {
                if (!context.User.IsInRole("Admin") && context.User.Identity?.Name != userName)
                {
                    return Microsoft.AspNetCore.Http.Results.Forbid();
                }

                var result = await sender.Send(new GetBasketQuery(userName));
                var response = result.Adapt<GetBasketReponse>();
                return Microsoft.AspNetCore.Http.Results.Ok(response);
            }).WithName("GetBasket");
        }
    }
}
