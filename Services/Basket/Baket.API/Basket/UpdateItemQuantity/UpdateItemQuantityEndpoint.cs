namespace Baket.API.Basket.UpdateItemQuantity
{
    public record UpdateItemQuantityRequest(int Quantity);
    public record UpdateItemQuantityResponse(ShoppingCart Cart);
    
    public class UpdateItemQuantityEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/basket/{userName}/items/{productId:guid}", async (string userName, Guid productId, UpdateItemQuantityRequest request, ISender sender, Microsoft.AspNetCore.Http.HttpContext context) =>
            {
                if (!context.User.IsInRole("Admin") && context.User.Identity?.Name != userName)
                {
                    return Microsoft.AspNetCore.Http.Results.Forbid();
                }

                var command = new UpdateItemQuantityCommand(userName, productId, request.Quantity);
                var result = await sender.Send(command);
                var response = result.Adapt<UpdateItemQuantityResponse>();
                return Results.Ok(response);
            }).WithName("UpdateBasketItemQuantity");
        }
    }
}
