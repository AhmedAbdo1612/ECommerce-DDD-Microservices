namespace Baket.API.Basket.DeleteBasket;

public record DeleteBasketResponse(bool IsSuccess);
public class DeleteBasketEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/basket/{userName}", async (string userName, ISender sender, Microsoft.AspNetCore.Http.HttpContext context) =>
        {
            if (!context.User.IsInRole("Admin") && context.User.Identity?.Name != userName)
            {
                return Microsoft.AspNetCore.Http.Results.Forbid();
            }

            var result = await sender.Send(new DeleteBasketCommand(userName));
            var response = result.Adapt<DeleteBasketResponse>();
            return Results.Ok(response);
        }).WithName("DeleteBasket");
    }
}

