using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Basket;
using Shopping.Web.Services;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace Shopping.Web.Pages
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class CheckoutModel(IBasketService basketService, ILogger<CheckoutModel> logger) : PageModel
    {
        [BindProperty]
        public BasketCheckoutModel Checkout { get; set; } = default!;

        public ShoppingCartModel Cart { get; set; } = default!;

        public async Task<IActionResult> OnGetAsync()
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToPage("/Login");

            try
            {
                var response = await basketService.GetBasket(userName);
                if (response?.Cart != null)
                {
                    Cart = response.Cart;
                }
            }
            catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                logger.LogInformation("Basket not found for user {UserName} on checkout.", userName);
                return RedirectToPage("/Cart");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching basket on checkout");
                ModelState.AddModelError("", "Could not load your cart for checkout.");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToPage("/Login");

            try
            {
                var response = await basketService.GetBasket(userName);
                if (response?.Cart != null)
                {
                    Cart = response.Cart;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error reloading basket on post checkout");
            }

            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                Checkout.UserName = userName;
                var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
                if (Guid.TryParse(userIdStr, out var cId))
                    Checkout.CustomerId = cId;
                else
                    Checkout.CustomerId = Guid.NewGuid();

                var request = new CheckoutBasketRequest(Checkout);
                await basketService.CheckoutBasket(request);
                
                return RedirectToPage("Confirmation", "OrderSubmitted");
            }
            catch (ApiException ex)
            {
                logger.LogError(ex, "API Error checking out basket. Status code: {StatusCode}", ex.StatusCode);
                logger.LogError("API Error Response Content: {Content}", ex.Content);
                
                ModelState.AddModelError("", $"Failed to checkout: {ex.Content}");
                return Page();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error checking out basket");
                ModelState.AddModelError("", "An unexpected error occurred during checkout.");
                return Page();
            }
        }
    }
}
