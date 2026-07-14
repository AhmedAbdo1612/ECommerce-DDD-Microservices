using Shopping.Web.Models.Catalog;

namespace Shopping.Web.Services
{
    public interface ICatalogService
    {
        Task<GetProductResponse> GetProducts(int? pageNumber = 1, int? pageSize = 10);
        Task<GetProductByCategoryResponse> GetProductsByCategory(string category);
        Task<GetProductByIdResponse> GetProductById(Guid id);
    }
}
