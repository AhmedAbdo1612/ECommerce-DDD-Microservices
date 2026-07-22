using Carter;
using Mapster;
using MediatR;
using Ordering.Application.Dtos;
using Ordering.Application.Orders.Queries.GetOrderById;

namespace Ordering.API.Endpoints;

public record GetOrderByIdResult(OrderDto Order);
public class GetOrderById : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/orders/{id:guid}", async (Guid id ,ISender sender) =>
        {
            var result = await sender.Send(new GetOrderByIdQuery(id));
            return Results.Ok(result.Adapt<GetOrderByIdResult>());
        });
    }
}
