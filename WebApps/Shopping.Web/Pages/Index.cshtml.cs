using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Models.Basket;
using Shopping.Web.Models.Catalog;
using Shopping.Web.Services;

namespace Shopping.Web.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ICatalogService _catalogService;
        private readonly IBasketService _basketService;
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ICatalogService catalogService, IBasketService basketService, ILogger<IndexModel> logger)
        {
            _catalogService = catalogService;
            _basketService = basketService;
            _logger = logger;
        }

        [BindProperty(SupportsGet = true)]
        public int PageNumber { get; set; } = 1;

        [BindProperty(SupportsGet = true)]
        public string? SearchQuery { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Category { get; set; }

        [BindProperty(SupportsGet = true)]
        public string? Status { get; set; } // We bind it to keep UI state, but won't pass to backend for now

        public bool HasNextPage { get; set; }

        public IEnumerable<ProductModel> ProductList { get; set; } = new List<ProductModel>();

        [TempData]
        public string ErrorMessage { get; set; } = string.Empty;

        public async Task<IActionResult> OnGetAsync()
        {
            if (PageNumber < 1)
            {
                PageNumber = 1;
            }

            try
            {
                int pageSize = 8; // Adjust to 8 for a nice 4-column grid (2 rows)
                var response = await _catalogService.GetProducts(PageNumber, pageSize, SearchQuery, Category);
                ProductList = response?.Products ?? new List<ProductModel>();
                HasNextPage = ProductList.Count() == pageSize;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching products from Catalog.API via Refit.");
                ErrorMessage = "We are currently experiencing technical difficulties fetching our product catalog. Please try again later.";
                ProductList = new List<ProductModel>();
                HasNextPage = false;
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAddToBasketAsync(Guid productId)
        {
            if (User.Identity?.IsAuthenticated != true)
                return RedirectToPage("/Login");

            var userName = User.Identity?.Name;
            try
            {
                var productResponse = await _catalogService.GetProductById(productId);
                if (productResponse?.Product != null)
                {
                    var item = new ShoppingCartItemModel
                    {
                        ProductId = productResponse.Product.Id,
                        ProductName = productResponse.Product.Name,
                        Price = (float)productResponse.Product.Price,
                        Quantity = 1,
                        Color = "Black" // default color
                    };

                    await _basketService.AddBasketItem(userName!, new AddItemRequest(item));
                    TempData["CartMessage"] = "Item added to cart successfully!";
                    return RedirectToPage();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding to cart");
                ErrorMessage = "Failed to add item to cart.";
            }

            return RedirectToPage();
        }

        public async Task<IActionResult> OnPostDeleteProductAsync(Guid productId)
        {
            try
            {
                await _catalogService.DeleteProductAsync(productId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting product {ProductId}.", productId);
                ErrorMessage = "Failed to delete the product.";
            }

            return RedirectToPage();
        }
    }
}
