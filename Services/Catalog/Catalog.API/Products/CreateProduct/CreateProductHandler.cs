
using Catalog.API.Common;


namespace Catalog.API.Products.CreateProduct;

public record CreateProductCommand(string Name, List<string> Category, string Description, decimal Price, IFormFileCollection Files, int PrimaryImageIndex = 0)
    : ICommand<CreateProductResult>;
public record CreateProductResult(Guid Id);

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().WithMessage("Name is required");
        RuleFor(x => x.Category).NotEmpty().WithMessage("Category is required.");
        RuleFor(x => x.Price).GreaterThan(0).WithMessage("Price must be greater than 0.");
        RuleFor(x => x.Files)
            .NotNull().WithMessage("At least one image is required.")
            .Must(files => files != null && files.Count > 0).WithMessage("At least one image is required.");
        RuleFor(x => x.PrimaryImageIndex)
            .GreaterThanOrEqualTo(0)
            .Must((command, index) => command.Files != null && index < command.Files.Count)
            .WithMessage("Valid primary image index is required.");
    }
}

internal class CreateProductHandler(
    IDocumentSession session,
    IStorageService storageService
    )
    : ICommandHandler<CreateProductCommand, CreateProductResult>
{
    public async Task<CreateProductResult> Handle(CreateProductCommand command, CancellationToken cancellationToken)
    {
        var productImages = new List<ProductImage>();

        if (command.Files != null && command.Files.Any())
        {
            for (int i = 0; i < command.Files.Count; i++)
            {
                var file = command.Files[i];
                var fileUrl = await storageService.UploadFileAsync(file);
                if (!string.IsNullOrEmpty(fileUrl))
                {
                    bool isPrimary = (i == command.PrimaryImageIndex);
                    productImages.Add(new ProductImage(fileUrl,  isPrimary));
                }
            }
        }

        var primaryImage = productImages.FirstOrDefault(i => i.IsPrimary) ?? productImages.FirstOrDefault();

        var product = new Product
        {
            Name = command.Name,
            Category = command.Category,
            Description = command.Description,
            Price = command.Price,
            Images = productImages
        };

        session.Store(product);
        await session.SaveChangesAsync(cancellationToken);
        return new CreateProductResult(product.Id);
    }
}
