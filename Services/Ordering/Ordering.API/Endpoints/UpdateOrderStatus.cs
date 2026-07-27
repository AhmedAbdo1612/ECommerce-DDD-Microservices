using Carter;
using Mapster;
using MediatR;
using Ordering.Application.Orders.Commands.UpdateOrderStatus;
using OrderingDomain.Enums;

namespace Ordering.API.Endpoints;

public record UpdateOrderStatusRequest(Guid OrderId, OrderStatus State);
public record UpdateOrderStatusResponse(bool IsSuccess);
public class UpdateOrderStatus : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/orders/order-status", async (UpdateOrderStatusRequest request, ISender sender) =>
        {
            var command = request.Adapt<UpdateOrderStatusCommand>();
            var result = await sender.Send(command);
            return Results.Ok(result.Adapt<UpdateOrderResponse>());
        }).RequireAuthorization("ManagerOrAdmin");
    }
}
