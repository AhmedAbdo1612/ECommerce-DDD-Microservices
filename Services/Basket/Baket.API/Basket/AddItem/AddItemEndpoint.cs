using System.Security.Claims;

namespace Baket.API.Basket.AddItem
{
    public record AddItemRequest(ShoppingCartItem Item);
    public record AddItemResponse(ShoppingCart Cart);
    
    public class AddItemEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPost("/basket/{userName}/items", async (string userName, AddItemRequest request, ISender sender,HttpContext context) =>
            {
                if (!context.User.IsInRole("Admin") && context.User.FindFirstValue("username") != userName)
                {
                  return Results.Forbid();
                }

                var command = new AddItemCommand(userName, request.Item);
                var result = await sender.Send(command);
                var response = result.Adapt<AddItemResponse>();
                return Results.Ok(response);
            }).WithName("AddBasketItem");
        }
    }
}
