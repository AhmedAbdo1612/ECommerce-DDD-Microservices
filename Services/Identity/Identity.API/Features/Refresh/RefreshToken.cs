using BuildingBlocks.CQRS;
using Carter;
using FluentValidation;
using Identity.API.Models;
using Identity.API.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Identity.API.Features.Refresh;

public record RefreshTokenCommand(string AccessToken, string RefreshToken) : ICommand<RefreshTokenResult>;

public record RefreshTokenResult(string AccessToken, string RefreshToken);

public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenCommandValidator()
    {
        RuleFor(x => x.AccessToken).NotEmpty();
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public class RefreshTokenHandler : ICommandHandler<RefreshTokenCommand, RefreshTokenResult>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _config;

    public RefreshTokenHandler(UserManager<ApplicationUser> userManager, TokenService tokenService, IConfiguration config)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _config = config;
    }

    public async Task<RefreshTokenResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(request.AccessToken);
        if (principal == null)
            throw new Exception("Invalid access token or refresh token");

        var email = principal.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Email)?.Value;
        if (email == null)
            throw new Exception("Invalid access token or refresh token");

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            throw new Exception("Invalid access token or refresh token");

        var existingToken = user.RefreshTokens.FirstOrDefault(x => x.Token == request.RefreshToken);

        if (existingToken == null || !existingToken.IsActive)
        {
            throw new Exception("Invalid access token or refresh token");
        }

        existingToken.Revoked = DateTime.UtcNow;

        var newAccessToken = await _tokenService.GenerateAccessTokenAsync(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshTokens.Add(newRefreshToken);
        await _userManager.UpdateAsync(user);

        return new RefreshTokenResult(newAccessToken, newRefreshToken.Token);
    }
}

public class RefreshEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/refresh", async (RefreshTokenCommand command, ISender sender) =>
        {
            var result = await sender.Send(command);
            return Results.Ok(result);
        })
        .WithName("RefreshToken")
        .Produces<RefreshTokenResult>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .WithSummary("Refresh Token")
        .WithDescription("Refresh Token");
    }
}
