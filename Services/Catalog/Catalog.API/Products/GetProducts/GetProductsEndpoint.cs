

using Catalog.API.Models;

namespace Catalog.API.Products.GetProducts;

public record GetProductsResponse(IEnumerable<ProductDto> Products);
public record GetProductsRequest(int? PageNumber = 1, int? PageSize = 10, string? SearchQuery = null, string? Category = null);
public class GetProductsEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/products", async ([AsParameters] GetProductsRequest request,ISender sender) =>
        {
            var query = request.Adapt<GetProuctsQuery>();
            var result = await sender.Send(query);
            var response = result.Adapt<GetProductsResponse>();
            return Results.Ok(response);
        })
            .WithName("GetProducts");
    }
}
