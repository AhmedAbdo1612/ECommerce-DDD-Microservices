using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Shopping.Web.Models.Auth;
using Shopping.Web.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Shopping.Web.Pages;

public class LoginModel : PageModel
{
    private readonly IIdentityService _identityService;

    public LoginModel(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [BindProperty]
    public string Email { get; set; } = default!;

    [BindProperty]
    public string Password { get; set; } = default!;

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        try
        {
            var response = await _identityService.LoginAsync(new LoginRequest(Email, Password));
            
            // Decode JWT to get claims
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(response.AccessToken);

            var claimsIdentity = new ClaimsIdentity(jwtToken.Claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = jwtToken.ValidTo
            };

            // Store the token in the auth properties
            authProperties.StoreTokens(new[]
            {
                new AuthenticationToken { Name = "access_token", Value = response.AccessToken }
            });

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme, 
                new ClaimsPrincipal(claimsIdentity), 
                authProperties);

            return RedirectToPage("/Index");
        }
        catch (Exception)
        {
            ModelState.AddModelError(string.Empty, "Invalid login attempt.");
            return Page();
        }
    }
}
