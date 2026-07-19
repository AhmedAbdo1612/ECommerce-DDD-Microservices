using Refit;
using Shopping.Web.Models.Auth;

namespace Shopping.Web.Services;

public interface IIdentityService
{
    [Post("/api/auth/login")]
    Task<LoginResponse> LoginAsync(LoginRequest request);

    [Post("/api/auth/register")]
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
}
