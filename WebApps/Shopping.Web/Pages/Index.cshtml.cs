using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Shopping.Web.Models.Catalog;
using Shopping.Web.Services;

namespace Shopping.Web.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ICatalogService _catalogService;
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ICatalogService catalogService, ILogger<IndexModel> logger)
        {
            _catalogService = catalogService;
            _logger = logger;
        }

        public IEnumerable<ProductModel> ProductList { get; set; } = new List<ProductModel>();
        
        [TempData]
        public string ErrorMessage { get; set; } = string.Empty;

        public async Task<IActionResult> OnGetAsync()
        {
            try
            {
                var response = await _catalogService.GetProducts(1, 10); // Fetch 12 items for a nice 4-column grid
                Console.WriteLine(response.Products);
                ProductList = response?.Products ?? new List<ProductModel>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching products from Catalog.API via Refit.");
                ErrorMessage = "We are currently experiencing technical difficulties fetching our product catalog. Please try again later.";
                ProductList = new List<ProductModel>();
            }

            return Page();
        }

        public IActionResult OnPostAddToBasket(Guid productId)
        {
            // Placeholder for Add to Basket functionality
            // Usually you'd call an IBasketService here
            
            return RedirectToPage();
        }
    }
}
