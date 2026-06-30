namespace Catalog.API.Products.GetProductsByCategory
{


    public class GetProductsByCategoryEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapGet("/products/category/{category}", async (string category, ISender sender) =>
            {
                var result = await sender.Send(new GetProductByCategoryQuery(category));
                return Results.Ok(result);
            }).WithName("GetProductByCategory");
        }
    }
}
