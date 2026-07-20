namespace Baket.API.Basket.RemoveItem
{
    public record RemoveItemResponse(ShoppingCart Cart);
    
    public class RemoveItemEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapDelete("/basket/{userName}/items/{productId:guid}", async (string userName, Guid productId, ISender sender,HttpContext context) =>
            {
                if (!context.User.IsInRole("Admin") && context.User.Identity?.Name != userName)
                {
                    return Results.Forbid();
                }

                var command = new RemoveItemCommand(userName, productId);
                var result = await sender.Send(command);
                var response = result.Adapt<RemoveItemResponse>();
                return Results.Ok(response);
            }).WithName("RemoveBasketItem");
        }
    }
}
