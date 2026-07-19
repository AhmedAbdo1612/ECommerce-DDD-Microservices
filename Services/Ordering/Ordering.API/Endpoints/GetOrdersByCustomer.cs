using Carter;
using Mapster;
using MediatR;
using Ordering.Application.Dtos;
using Ordering.Application.Orders.Queries.GetOrdersByCustomer;

namespace Ordering.API.Endpoints;

public record GetOrdersByCustomerResponse(IEnumerable<OrderDto> Orders);

public class GetOrdersByCustomer : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders/customer/{customerId}", async (Guid customerId, ISender sender, Microsoft.AspNetCore.Http.HttpContext context) =>
        {
            if (!context.User.IsInRole("Admin") && !context.User.IsInRole("Manager") && 
                context.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value != customerId.ToString())
            {
                return Microsoft.AspNetCore.Http.Results.Forbid();
            }

            var result = await sender.Send(new GetOrdersByCustomerQuery(customerId));
            return Results.Ok(result.Adapt<GetOrdersByCustomerResponse>());
        });
    }
}
