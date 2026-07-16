using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Catalog;
using Shopping.Web.Services;

namespace Shopping.Web.Pages
{
    public class ProductDetailModel(ICatalogService catalogService, ILogger<ProductDetailModel> logger) : PageModel
    {
        public ProductModel? Product { get; set; }

        public string? ErrorMessage { get; set; }

        [BindProperty]
        public int Quantity { get; set; } = 1;

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            try
            {
                var response = await catalogService.GetProductById(id);
                if (response?.Product == null)
                {
                    return RedirectToPage("/Index");
                }

                Product = response.Product;
                return Page();
            }
            catch (ApiException ex)
            {
                logger.LogError(ex, "API Error fetching product {Id}.", id);
                return RedirectToPage("/Index");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching product.");
                return RedirectToPage("/Index");
            }
        }

        public IActionResult OnPostAddToBasket(Guid productId)
        {
            // Placeholder for Add to Basket logic.
            // Normally this would call an IBasketService and update the cart.
            // For now, we will set a TempData message to simulate success.
            TempData["CartMessage"] = $"Successfully added {Quantity} item(s) to your basket!";
            return RedirectToPage(new { id = productId });
        }
    }
}
