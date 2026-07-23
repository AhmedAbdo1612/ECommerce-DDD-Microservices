using Carter;
using MediatR;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Identity.API.Models;
using Mapster;
using MassTransit;
using BuildingBlocks.Messaging.Events;

namespace Identity.API.Features.Register;

public class RegisterEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/register", async (RegisterCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Ok(result);
        });
    }
}

public record RegisterCommand(string Email, string Username, string Password, string FirstName, string LastName) : IRequest<RegisterResponse>;

public record RegisterResponse(bool Success, string Message);

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
    }
}

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IPublishEndpoint _publisher;
    public RegisterCommandHandler(UserManager<ApplicationUser> userManager, IPublishEndpoint publisher)
    {
        _userManager = userManager;
        _publisher = publisher;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var user = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Username,
            FirstName = request.FirstName,
            LastName = request.LastName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return new RegisterResponse(false, errors);
        }
        await _publisher.Publish(new CustomerCreatedEvent(Guid.Parse(user.Id), $"{user.FirstName} {user.LastName}", user.Email));
        await _userManager.AddToRoleAsync(user, "Customer");

        return new RegisterResponse(true, "User registered successfully");
    }
}
