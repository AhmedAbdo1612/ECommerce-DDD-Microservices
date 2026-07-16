

namespace Shopping.Web.Services
{
    public interface ICatalogService
    {
        [Get("/products?pageNumber={pageNumber}&pageSize={pageSize}&searchQuery={searchQuery}&category={category}")]
        Task<GetProductResponse> GetProducts(int? pageNumber = 1, int? pageSize = 10, string? searchQuery = null, string? category = null);
        [Get("/products/category/{category}")]
        Task<GetProductByCategoryResponse> GetProductsByCategory(string category);
        
        [Get("/products/{id}")]
        Task<GetProductByIdResponse> GetProductById(Guid id);

        [Multipart]
        [Post("/products")]
        Task<CreateProductResponse> CreateProductAsync(
            [AliasAs("name")] string name, 
            [AliasAs("category")] IEnumerable<string> category, 
            [AliasAs("description")] string description, 
            [AliasAs("price")] decimal price, 
            [AliasAs("files")] IEnumerable<StreamPart> files, 
            [AliasAs("primaryImageIndex")] int primaryImageIndex);

        [Multipart]
        [Put("/products")]
        Task<UpdateProductResponse> UpdateProductAsync(
            [AliasAs("id")] Guid id,
            [AliasAs("name")] string name, 
            [AliasAs("category")] IEnumerable<string> category, 
            [AliasAs("description")] string description, 
            [AliasAs("price")] decimal price, 
            [AliasAs("newFiles")] IEnumerable<StreamPart>? newFiles, 
            [AliasAs("imagesToDelete")] IEnumerable<string>? imagesToDelete,
            [AliasAs("primaryImageUrl")] string? primaryImageUrl);

        [Delete("/products/{id}")]
        Task<DeleteProductResponse> DeleteProductAsync(Guid id);
    }
}
