using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Services;
using System.ComponentModel.DataAnnotations;

namespace Shopping.Web.Pages
{
    public class CreateProductModel(ICatalogService catalogService, ILogger<CreateProductModel> logger) : PageModel
    {
        [BindProperty]
        public CreateProductViewModel Product { get; set; } = new();

        [BindProperty]
        [Required(ErrorMessage = "At least one image is required.")]
        public IFormFileCollection? Files { get; set; }

        public string? ErrorMessage { get; set; }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var categories = string.IsNullOrWhiteSpace(Product.Category) 
                    ? new List<string>() 
                    : Product.Category.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();

                var streamParts = new List<StreamPart>();
                if (Files != null && Files.Any())
                {
                    foreach (var file in Files)
                    {
                        var stream = file.OpenReadStream();
                        streamParts.Add(new StreamPart(stream, file.FileName, file.ContentType));
                    }
                }
                else
                {
                    ErrorMessage = "Please upload at least one image.";
                    return Page();
                }

                var response = await catalogService.CreateProductAsync(
                    name: Product.Name,
                    category: categories,
                    description: Product.Description,
                    price: Product.Price,
                    files: streamParts,
                    primaryImageIndex: 0
                );

                return RedirectToPage("/Index");
            }
            catch (ApiException ex)
            {
                logger.LogError(ex, "API Error creating product.");
                ErrorMessage = $"Failed to create product. API returned status code {ex.StatusCode}.";
                return Page();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error creating product.");
                ErrorMessage = "An unexpected error occurred while creating the product.";
                return Page();
            }
        }
    }

    public class CreateProductViewModel
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }
    }
}
