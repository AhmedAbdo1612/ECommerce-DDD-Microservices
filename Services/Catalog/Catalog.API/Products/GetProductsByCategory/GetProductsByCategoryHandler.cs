namespace Catalog.API.Products.GetProductsByCategory
{
    public record GetProductByCategoryQuery(string Category) : IRequest<IEnumerable<Product>>;
    public class GetProductsByCategoryHandler(IDocumentSession session, ILogger<GetProductsByCategoryHandler> logger) : IRequestHandler<GetProductByCategoryQuery, IEnumerable<Product>>
    {
        public async Task<IEnumerable<Product>> Handle(GetProductByCategoryQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("GetProductsByCategoryHandler is called{@query}", query);
            var products = await session.Query<Product>().Where(p => p.Category.Contains(query.Category)).ToListAsync();
            return products;
        }
    }
}
