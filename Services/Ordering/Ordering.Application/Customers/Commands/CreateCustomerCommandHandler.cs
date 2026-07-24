namespace Ordering.Application.Customers.Commands;

public class CreateCustomerCommandHandler(IApplicationDbContext dbContext) : ICommandHandler<CreateCustomerCommand, CreateCustomerResult>
{
    public async Task<CreateCustomerResult> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = Customer.Create(CustomerId.Of(request.Customer.Id), request.Customer.Name, request.Customer.Email);
        await dbContext.Customers.AddAsync(customer);
        await dbContext.SaveChangesAsync(cancellationToken);
        return new CreateCustomerResult(true);
    }
}
