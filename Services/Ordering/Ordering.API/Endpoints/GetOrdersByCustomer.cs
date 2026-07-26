using Carter;
using Mapster;
using MediatR;
using Ordering.Application.Dtos;
using Ordering.Application.Orders.Queries.GetOrdersByCustomer;
using System.Security.Claims;

namespace Ordering.API.Endpoints;

public record GetOrdersByCustomerResponse(IEnumerable<OrderDto> Orders);

public class GetOrdersByCustomer : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders/customer/{customerId}", async (Guid customerId, ISender sender, HttpContext context) =>
        {
            if (!context.User.IsInRole("Admin") && !context.User.IsInRole("Manager"))

            {
                return Results.Forbid();
            }

            var result = await sender.Send(new GetOrdersByCustomerQuery(customerId));
            return Results.Ok(result.Adapt<GetOrdersByCustomerResponse>());
        });
    }
}
