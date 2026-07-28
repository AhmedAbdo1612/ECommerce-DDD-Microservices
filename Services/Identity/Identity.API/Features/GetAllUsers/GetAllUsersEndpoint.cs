using Carter;
using MediatR;

namespace Identity.API.Features.GetAllUsers
{
    public class GetAllUsersEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/auth/all-users", async (ISender sender) =>
            {
                var query = new GetAllUsersQuery();
                var result = await sender.Send(query);
                return Results.Ok(result);
            }).RequireAuthorization("Admin");
        }
    }
}
