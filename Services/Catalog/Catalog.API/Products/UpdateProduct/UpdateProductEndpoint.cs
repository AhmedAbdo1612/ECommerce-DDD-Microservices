using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Products.UpdateProduct
{
    public record UpdateProductResponse(bool IsSuccess);
    
    public class UpdateProductRequest
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public List<string> Category { get; set; } = new();
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public IFormFileCollection? NewFiles { get; set; }
        public List<string>? ImagesToDelete { get; set; } = new();
        public string? PrimaryImageUrl { get; set; }
    }

    public class UpdateProductEndpoint : ICarterModule
    {
        public void AddRoutes(IEndpointRouteBuilder app)
        {
            app.MapPut("/products", async ([FromForm] UpdateProductRequest request, ISender sender) =>
            {
                var command = new UpdateProductCommand(request.Id, request.Name, request.Category, request.Description, request.Price, request.NewFiles, request.ImagesToDelete, request.PrimaryImageUrl);
                var result = await sender.Send(command);
                var response = result.Adapt<UpdateProductResponse>();
                return Results.Ok(response);
            }).WithName("UpdateProduct")
            .DisableAntiforgery();
        }
    }
}
