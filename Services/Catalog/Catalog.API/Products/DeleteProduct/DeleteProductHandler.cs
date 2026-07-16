using Catalog.API.Common;

namespace Catalog.API.Products.DeleteProduct
{
    public record DeleteProductCommand(Guid Id) : ICommand<DeleteProductResult>;
    public record DeleteProductResult(bool IsSuccess);
    
    public class DeleteProductCommandvalidator : AbstractValidator<DeleteProductCommand>
    {
        public DeleteProductCommandvalidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Product id is required.");
        }
    }

    internal class DeleteProductCommandHandler(
        IDocumentSession session, 
        ILogger<DeleteProductCommandHandler> logger,
        IStorageService storageService) 
        : ICommandHandler<DeleteProductCommand, DeleteProductResult>
    {
        public async Task<DeleteProductResult> Handle(DeleteProductCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("DeleteProductCommandHandler.Handle is called {@command}", command);
            var product = await session.LoadAsync<Product>(command.Id, cancellationToken);
            if (product == null) throw new ProductNotFoundException(command.Id);

            if (product.Images != null && product.Images.Any())
            {
                foreach (var image in product.Images)
                {
                    storageService.DeleteFile(image.Url);
                }
            }

            session.Delete(product);
            await session.SaveChangesAsync(cancellationToken);
            return new DeleteProductResult(true);
        }
    }
}
