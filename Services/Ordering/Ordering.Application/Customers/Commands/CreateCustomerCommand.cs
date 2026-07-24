
namespace Ordering.Application.Customers.Commands;

public record CreateCustomerResult(bool IsSuccess);
public record CreateCustomerCommand(CustomerDto Customer) : ICommand<CreateCustomerResult>;
