namespace Shopping.Web.Models.Catalog;

public class ProductModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public List<string> Category { get; set; } = new();
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public List<ProductImage> Images { get; set; } = new();
}
public record GetProductResponse(List<ProductModel> Products);
public record GetProductByCategoryResponse(IEnumerable<ProductModel> Products);
public record GetProductByIdResponse(ProductModel Product);

public record CreateProductResponse(Guid Id);
public record UpdateProductResponse(bool IsSuccess);
public record DeleteProductResponse(bool IsSuccess);

public record ProductImage(string Url,  bool IsPrimary);
