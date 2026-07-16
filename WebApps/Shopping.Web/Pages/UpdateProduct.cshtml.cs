using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Refit;
using Shopping.Web.Services;
using System.ComponentModel.DataAnnotations;

namespace Shopping.Web.Pages
{
    public class UpdateProductModel(ICatalogService catalogService, ILogger<UpdateProductModel> logger) : PageModel
    {
        [BindProperty]
        public UpdateProductViewModel Product { get; set; } = new();

        [BindProperty]
        public IFormFileCollection? NewFiles { get; set; }

        [BindProperty]
        public List<string> ImagesToDelete { get; set; } = new();

        [BindProperty]
        public string? PrimaryImageUrl { get; set; }

        public string? ErrorMessage { get; set; }

        public async Task<IActionResult> OnGetAsync(Guid id)
        {
            try
            {
                var response = await catalogService.GetProductById(id);
                if (response?.Product == null)
                {
                    return RedirectToPage("/Index");
                }

                Product = new UpdateProductViewModel
                {
                    Id = response.Product.Id,
                    Name = response.Product.Name,
                    Category = string.Join(", ", response.Product.Category),
                    Description = response.Product.Description,
                    Price = response.Product.Price,
                    ExistingImages = response.Product.Images
                };

                return Page();
            }
            catch (ApiException ex)
            {
                logger.LogError(ex, "API Error fetching product {Id}.", id);
                return RedirectToPage("/Index");
            }
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
                if (NewFiles != null && NewFiles.Any())
                {
                    foreach (var file in NewFiles)
                    {
                        var stream = file.OpenReadStream();
                        streamParts.Add(new StreamPart(stream, file.FileName, file.ContentType));
                    }
                }

                var response = await catalogService.UpdateProductAsync(
                    id: Product.Id,
                    name: Product.Name,
                    category: categories,
                    description: Product.Description,
                    price: Product.Price,
                    newFiles: streamParts.Any() ? streamParts : null,
                    imagesToDelete: ImagesToDelete.Any() ? ImagesToDelete : null,
                    primaryImageUrl: PrimaryImageUrl
                );

                return RedirectToPage("/Index");
            }
            catch (ApiException ex)
            {
                logger.LogError(ex, "API Error updating product.");
                ErrorMessage = $"Failed to update product. API returned status code {ex.StatusCode}.";
                return Page();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error updating product.");
                ErrorMessage = "An unexpected error occurred while updating the product.";
                return Page();
            }
        }
    }

    public class UpdateProductViewModel
    {
        public Guid Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        public List<Models.Catalog.ProductImage> ExistingImages { get; set; } = new();
    }
}
