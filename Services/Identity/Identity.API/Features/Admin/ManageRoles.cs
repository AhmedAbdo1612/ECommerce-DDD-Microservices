using BuildingBlocks.CQRS;
using Carter;
using FluentValidation;
using Identity.API.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Identity.API.Features.Admin;

public record ChangeRoleCommand(string UserId, string NewRole) : ICommand<bool>;

public class ChangeRoleCommandValidator : AbstractValidator<ChangeRoleCommand>
{
    public ChangeRoleCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.NewRole).NotEmpty();
    }
}

public class ChangeRoleHandler : ICommandHandler<ChangeRoleCommand, bool>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public ChangeRoleHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(ChangeRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user == null)
            throw new Exception("User not found");

        var currentRoles = await _userManager.GetRolesAsync(user);
        await _userManager.RemoveFromRolesAsync(user, currentRoles);
        var result = await _userManager.AddToRoleAsync(user, request.NewRole);

        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        return true;
    }
}

public record ChangeRoleRequest(string NewRole);

public class AdminEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/auth/users/{id}/roles", async (string id, ChangeRoleRequest req, ISender sender) =>
        {
            var result = await sender.Send(new ChangeRoleCommand(id, req.NewRole));
            return Results.Ok(result);
        })
        .RequireAuthorization(policy => policy.RequireRole("Admin"))
        .WithName("ChangeRole")
        .Produces<bool>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Change User Role")
        .WithDescription("Change User Role");
    }
}
