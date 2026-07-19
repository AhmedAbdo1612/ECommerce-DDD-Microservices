using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Shopping.Web.Models.Auth;
using Shopping.Web.Services;

namespace Shopping.Web.Pages;

public class RegisterModel : PageModel
{
    private readonly IIdentityService _identityService;

    public RegisterModel(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    [BindProperty]
    public RegisterRequest Input { get; set; } = default!;

    public void OnGet()
    {
    }

    public async Task<IActionResult> OnPostAsync()
    {
        if (!ModelState.IsValid)
            return Page();

        try
        {
            await _identityService.RegisterAsync(Input);
            return RedirectToPage("/Login");
        }
        catch (Exception)
        {
            ModelState.AddModelError(string.Empty, "Registration failed. Please check your details and try again.");
            return Page();
        }
    }
}
