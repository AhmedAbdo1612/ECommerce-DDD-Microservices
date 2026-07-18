
using Catalog.API.Models;
using Microsoft.AspNetCore.Http;

namespace Catalog.API.Products.UpdateProduct
{
    public record UpdateProductCommand(Guid Id, string Name, List<string> Category, string Description, decimal Price, IFormFileCollection? NewFiles, List<string>? ImagesToDelete, string? PrimaryImageUrl)
       : ICommand<UpdateProductResult>;
    public record UpdateProductResult(bool IsSuccess);

    public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
    {
        public UpdateProductCommandValidator()
        {
            RuleFor(c => c.Id).NotEmpty().WithMessage("Product id is required.");
            RuleFor(c => c.Name)
                .NotEmpty().WithMessage("Name is required")
                .Length(2, 150).WithMessage("Name must be between 2 and 150 characters.");
            RuleFor(c => c.Price).GreaterThan(0).WithMessage("Price must  be greater than 0");
        }
    }

    internal class UpdateProductCommandHandler(
        IDocumentSession session,
        ILogger<UpdateProductCommandHandler> logger,
        Catalog.API.Clients.MediaClient mediaClient)
        : ICommandHandler<UpdateProductCommand, UpdateProductResult>
    {
        public async Task<UpdateProductResult> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("UpdateProductCommandHandler.Handle {@command}", command);
            var product = await session.LoadAsync<Product>(command.Id, cancellationToken);
            if (product is null) throw new ProductNotFoundException(command.Id);

            product.Name = command.Name;
            product.Category = command.Category;
            product.Description = command.Description;
            product.Price = command.Price;

            if (command.ImagesToDelete != null && command.ImagesToDelete.Any())
            {
                foreach (var url in command.ImagesToDelete)
                {
                    await mediaClient.DeleteFileAsync(url);
                    product.Images.RemoveAll(i => i.Url == url);
                }
            }

            if (command.NewFiles != null && command.NewFiles.Any())
            {
                foreach (var file in command.NewFiles)
                {
                    var fileUrl = await mediaClient.UploadFileAsync(file);
                    Console.WriteLine($"the image url===================>\n{fileUrl}");
                    if (!string.IsNullOrEmpty(fileUrl))
                    {
                        product.Images.Add(new ProductImage(fileUrl, false));
                    }
                }
            }

            if (!string.IsNullOrEmpty(command.PrimaryImageUrl))
            {
                for (int i = 0; i < product.Images.Count; i++)
                    product.Images[i] = product.Images[i] with { IsPrimary = false };

                var primaryImageIndex = product.Images.FindIndex(i => i.Url == command.PrimaryImageUrl);
                if (primaryImageIndex >= 0)
                {
                    product.Images[primaryImageIndex] = product.Images[primaryImageIndex] with { IsPrimary = true };
                }
            }

            if (product.Images.Any() && !product.Images.Any(i => i.IsPrimary))
            {
                product.Images[0] = product.Images[0] with { IsPrimary = true };
            }
            session.Update(product);
            await session.SaveChangesAsync(cancellationToken);
            return new UpdateProductResult(true);
        }
    }
}
