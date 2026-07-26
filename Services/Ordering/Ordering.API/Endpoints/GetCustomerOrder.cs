using Carter;
using Mapster;
using MediatR;
using Ordering.Application.Orders.Queries.GetOrdersByCustomer;
using OrderingDomain.ValueObjects;
using System.Security.Claims;

namespace Ordering.API.Endpoints;

public class GetCustomerOrder : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders/my-orders", async (ISender sender, HttpContext context) =>
        {
            var userId = context.User.FindFirstValue("sub") ?? context.User.FindFirstValue("id");
            if (userId is null) return Results.Forbid();
            var result = await sender.Send(new GetOrdersByCustomerQuery(Guid.Parse(userId)));
            return Results.Ok(result.Adapt<GetOrdersByCustomerResponse>());

        });
    }
}
