using BuildingBlocks.CQRS;
using Carter;
using FluentValidation;
using Identity.API.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Identity.API.Features.Logout;

public record LogoutUserCommand(string Email) : ICommand<bool>;

public class LogoutUserCommandValidator : AbstractValidator<LogoutUserCommand>
{
    public LogoutUserCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class LogoutUserHandler : ICommandHandler<LogoutUserCommand, bool>
{
    private readonly UserManager<ApplicationUser> _userManager;

    public LogoutUserHandler(UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<bool> Handle(LogoutUserCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new Exception("User not found");

        foreach (var rt in user.RefreshTokens.Where(t => t.IsActive))
        {
            rt.Revoked = DateTime.UtcNow;
        }
        await _userManager.UpdateAsync(user);

        return true;
    }
}

public class LogoutEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/logout", async (LogoutUserCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Ok(result);
        })
        .RequireAuthorization()
        .WithName("LogoutUser")
        .Produces<bool>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Logout User")
        .WithDescription("Logout User");
    }
}
