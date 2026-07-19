using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Basket;
using Shopping.Web.Services;
using Shopping.Web.Models.Catalog;
using Microsoft.AspNetCore.Authorization;

namespace Shopping.Web.Pages
{
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class CartModel(IBasketService basketService, ICatalogService catalogService, ILogger<CartModel> logger) : PageModel
    {
        public ShoppingCartModel Cart { get; set; } = new ShoppingCartModel();
        public Dictionary<Guid, ProductModel> ProductDetails { get; set; } = new();

        public async Task<IActionResult> OnGetAsync()
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToPage("/Login");
            Cart.UserName = userName;

            try
            {
                var response = await basketService.GetBasket(userName);
                if (response?.Cart != null)
                {
                    Cart = response.Cart;
                    
                    if (Cart.Items != null && Cart.Items.Any())
                    {
                        foreach (var item in Cart.Items)
                        {
                            try
                            {
                                var productResponse = await catalogService.GetProductById(item.ProductId);
                                if (productResponse?.Product != null)
                                {
                                    ProductDetails[item.ProductId] = productResponse.Product;
                                }
                            }
                            catch (Exception ex)
                            {
                                logger.LogWarning(ex, "Failed to fetch product details for product {ProductId}", item.ProductId);
                            }
                        }
                    }
                }
            }
            catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                logger.LogInformation("Basket not found for user {UserName}", userName);
                Cart = new ShoppingCartModel { UserName = userName };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error getting basket");
                ModelState.AddModelError("", "Error getting basket.");
                Cart = new ShoppingCartModel { UserName = userName };
            }

            return Page();
        }

        public async Task<IActionResult> OnPostRemoveFromCartAsync(Guid productId)
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToPage("/Login");

            try
            {
                var response = await basketService.GetBasket(userName);
                if (response?.Cart != null)
                {
                    var item = response.Cart.Items.FirstOrDefault(x => x.ProductId == productId);
                    if (item != null)
                    {
                        response.Cart.Items.Remove(item);
                        await basketService.StoreBasket(new StoreBasketRequest(response.Cart));
                        logger.LogInformation("Item {ProductId} removed from basket.", productId);
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error removing item from basket");
                ModelState.AddModelError("", "Error removing item.");
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostUpdateQuantityAsync(Guid productId, int quantity)
        {
            var userName = User.Identity?.Name;
            if (string.IsNullOrEmpty(userName)) return RedirectToPage("/Login");

            try
            {
                var response = await basketService.GetBasket(userName);
                if (response?.Cart != null)
                {
                    var item = response.Cart.Items.FirstOrDefault(x => x.ProductId == productId);
                    if (item != null)
                    {
                        if (quantity > 0)
                        {
                            item.Quantity = quantity;
                        }
                        else
                        {
                            response.Cart.Items.Remove(item);
                        }
                        await basketService.StoreBasket(new StoreBasketRequest(response.Cart));
                    }
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating item quantity");
                ModelState.AddModelError("", "Error updating quantity.");
            }

            return RedirectToPage();
        }
    }
}
