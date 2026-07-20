using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Catalog;
using Shopping.Web.Services;

namespace Shopping.Web.Pages
{
    public class ProductDetailModel(ICatalogService catalogService, IBasketService basketService, ILogger<ProductDetailModel> logger) : PageModel
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

        public async Task<IActionResult> OnPostAddToCartAsync(Guid productId)
        {
        
            if (User.Identity?.IsAuthenticated != true)
                return RedirectToPage("/Login");

            var userName = User.Identity?.Name;
            try
            { 
                var productResponse = await catalogService.GetProductById(productId);
                
                if (productResponse?.Product != null)
                {
                    var item = new ShoppingCartItemModel
                    {
                        ProductId = productResponse.Product.Id,
                        ProductName = productResponse.Product.Name,
                        Price = (float)productResponse.Product.Price,
                        Quantity = Quantity,
                        Color = "Black" 
                    };

                    Console.WriteLine("\n\nbegin of the request=========================================>");
                    var res = await basketService.AddBasketItem(userName!, new AddItemRequest(item));
                    Console.WriteLine(res);
                    Console.WriteLine("\n\n=========================================>");
                    return RedirectToPage("/Cart");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error adding to cart");
            }

            return RedirectToPage(new { productId });
        }
    }
}
