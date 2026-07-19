using BuildingBlocks.CQRS;
using Carter;
using Identity.API.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;

namespace Identity.API.Features.Users;

public record GetMeQuery(string UserId) : IQuery<GetMeResult>;

public record GetMeResult(string Id, string Email, string Username, string FirstName, string LastName, IList<string> Roles);

public class GetMeHandler : IQueryHandler<GetMeQuery, GetMeResult>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public GetMeHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<GetMeResult> Handle(GetMeQuery request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
            throw new Exception("User not found");

        var roles = await _userManager.GetRolesAsync(user);
        return new GetMeResult(user.Id, user.Email!, user.UserName!, user.FirstName ?? "", user.LastName ?? "", roles);
    }
}

public class GetMeEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/me", async (ClaimsPrincipal user, ISender sender) =>
        {
            var userId = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? user.FindFirstValue("sub");
            if (userId == null) return Results.Unauthorized();
            
            var result = await sender.Send(new GetMeQuery(userId));
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithName("GetMe")
        .Produces<GetMeResult>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status401Unauthorized)
        .WithSummary("Get Current User")
        .WithDescription("Get Current User");
    }
}
