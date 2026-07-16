using Microsoft.AspNetCore.Mvc;

namespace Catalog.API.Products.CreateProduct;

public record CreateProductResponse(Guid id);
public class CreateProductRequest
{
    public string Name { get; set; } = default!;
    public List<string> Category { get; set; } = new();
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public IFormFileCollection Files { get; set; } 
    public int PrimaryImageIndex { get; set; } = 0;
}

public class CreateProductEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/products", async ([FromForm] CreateProductRequest request, ISender sender) =>
        {
            request.Category = request.Category[0].Split(',').ToList();
            
            var command = new CreateProductCommand(request.Name, request.Category, request.Description, request.Price, request.Files , request.PrimaryImageIndex);
            var result = await sender.Send(command);
            var response = result.Adapt<CreateProductResponse>();
            return Results.Created($"/products/{response.id}", response);
        }).WithName("CreateProduct")
        .DisableAntiforgery();
    }
}
