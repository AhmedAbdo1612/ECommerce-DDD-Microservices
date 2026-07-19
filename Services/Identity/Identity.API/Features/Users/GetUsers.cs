using BuildingBlocks.CQRS;
using Carter;
using Identity.API.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Features.Users;

public record GetUsersQuery() : IQuery<GetUsersResult>;

public record UserDto(string Id, string Email, string Username, string FirstName, string LastName);
public record GetUsersResult(IEnumerable<UserDto> Users);

public class GetUsersHandler : IQueryHandler<GetUsersQuery, GetUsersResult>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public GetUsersHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<GetUsersResult> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userManager.Users.ToListAsync(cancellationToken);
        var dtos = users.Select(u => new UserDto(u.Id, u.Email!, u.UserName!, u.FirstName ?? "", u.LastName ?? ""));
        return new GetUsersResult(dtos);
    }
}

public class GetUsersEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/auth/users", async (ISender sender) =>
        {
            var result = await sender.Send(new GetUsersQuery());
            return Results.Ok(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Admin"))
        .WithName("GetUsers")
        .Produces<GetUsersResult>(StatusCodes.Status200OK)
        .WithSummary("Get All Users")
        .WithDescription("Get All Users (Admin only)");
    }
}
