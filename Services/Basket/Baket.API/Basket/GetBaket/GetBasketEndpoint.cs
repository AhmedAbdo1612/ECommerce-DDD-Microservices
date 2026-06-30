
namespace Baket.API.Basket.GetBaket
{
    public record GetBasketReponse(ShoppingCart Cart);
    public class GetBasketEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/basket/{userName}", async (string userName, ISender sender) =>
            {
                var result = await sender.Send(new GetBasketQuery(userName));
                var response = result.Adapt<GetBasketReponse>();
                return response;
            }).WithName("GetBasket");
        }
    }
}
