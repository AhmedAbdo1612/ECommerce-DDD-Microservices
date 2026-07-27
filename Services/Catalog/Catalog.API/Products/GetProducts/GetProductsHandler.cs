

namespace Catalog.API.Products.GetProducts
{
    public record GetProuctsQuery(int? PageNumber = 1, int? PageSize = 10, string? SearchQuery = null, string? Category = null) : IQuery<GetProductsResult>;
    public record GetProductsResult(IEnumerable<Product> Products);
    internal class GetProductsQueryHandler(IDocumentSession session, ILogger<GetProductsQueryHandler> logger) : IQueryHandler<GetProuctsQuery, GetProductsResult>

    {
        public async Task<GetProductsResult> Handle(GetProuctsQuery query, CancellationToken cancellationToken)
        {
            var queryable = session.Query<Product>().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.SearchQuery))
            {
                // Note: Marten supports basic Contains for string filtering.
                queryable = queryable.Where(p => p.Name.Contains(query.SearchQuery, StringComparison.OrdinalIgnoreCase) || p.Description.Contains(query.SearchQuery, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(query.Category))
            {
                queryable = queryable.Where(p => p.Category.Contains(query.Category));
            }

            var products = await queryable.OrderByDescending(x=>x.Id).ToPagedListAsync(query.PageNumber ?? 1, query.PageSize ?? 10, cancellationToken);
            return new GetProductsResult(products);
        }
    }
}
