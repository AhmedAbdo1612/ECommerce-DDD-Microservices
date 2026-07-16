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

        public async Task<IActionResult> OnPostAddToBasketAsync(Guid productId)
        {
            try
            {
                var productResponse = await catalogService.GetProductById(productId);
                if (productResponse?.Product == null)
                {
                    return RedirectToPage("/Index");
                }

                var userName = "swn"; // default user for now
                ShoppingCartModel basket;
                try
                {
                    var basketResponse = await basketService.GetBasket(userName);
                    basket = basketResponse.Cart;
                }
                catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    basket = new ShoppingCartModel { UserName = userName };
                }

                if (basket == null)
                {
                    basket = new ShoppingCartModel { UserName = userName };
                }

                var existingItem = basket.Items.FirstOrDefault(i => i.ProductId == productId);
                if (existingItem != null)
                {
                    existingItem.Quantity += Quantity;
                }
                else
                {
                    basket.Items.Add(new ShoppingCartItemModel
                    {
                        ProductId = productId,
                        ProductName = productResponse.Product.Name,
                        Price = (float)productResponse.Product.Price,
                        Quantity = Quantity,
                        Color = "Black" // default color
                    });
                }

                await basketService.StoreBasket(new StoreBasketRequest(basket));

                TempData["CartMessage"] = $"Successfully added {Quantity} item(s) to your basket!";
                return RedirectToPage(new { id = productId });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error adding product to basket.");
                TempData["CartMessage"] = "Failed to add item to basket.";
                return RedirectToPage(new { id = productId });
            }
        }
    }
}
