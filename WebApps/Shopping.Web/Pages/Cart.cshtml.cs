using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Basket;
using Shopping.Web.Services;

namespace Shopping.Web.Pages
{
    public class CartModel(IBasketService basketService, ILogger<CartModel> logger) : PageModel
    {
        public ShoppingCartModel Cart { get; set; } = new ShoppingCartModel { UserName = "swn" };

        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                var response = await basketService.GetBasket("swn");
                Cart = response.Cart;
            }
            catch (ApiException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                Cart = new ShoppingCartModel { UserName = "swn" };
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error fetching basket.");
            }
            return Page();
        }

        public async Task<IActionResult> OnPostRemoveFromCartAsync(Guid productId)
        {
            try
            {
                var response = await basketService.GetBasket("swn");
                Cart = response.Cart;
                var item = Cart.Items.FirstOrDefault(x => x.ProductId == productId);
                if (item != null)
                {
                    Cart.Items.Remove(item);
                    await basketService.StoreBasket(new StoreBasketRequest(Cart));
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error removing item from basket.");
            }
            return RedirectToPage();
        }
    }
}
