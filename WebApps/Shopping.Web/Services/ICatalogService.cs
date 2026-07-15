

namespace Shopping.Web.Services
{
    public interface ICatalogService
    {
        [Get("/products?pageNumber={pageNumber}&pageSize={pageSize}")]
        Task<GetProductResponse> GetProducts(int? pageNumber = 1, int? pageSize = 10);
        [Get("/products/category/{category}")]
        Task<GetProductByCategoryResponse> GetProductsByCategory(string category);
        
        [Get("/products/{id}")]
        Task<GetProductByIdResponse> GetProductById(Guid id);
    }
}
