namespace Catalog.API.Models
{
    public class ProductDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public List<string> Category { get; set; } = new();
        public string Description { get; set; } = default!;
     
        public decimal Price { get; set; }
        public List<ProductImage> Images { get; set; } = new();
    }
}
