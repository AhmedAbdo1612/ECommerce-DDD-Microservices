namespace Shopping.Web.Models.Auth;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string AccessToken, string RefreshToken);

public record RegisterRequest(string FirstName, string LastName, string Email, string UserName, string Password, string ConfirmPassword);
public record RegisterResponse(string UserId);
