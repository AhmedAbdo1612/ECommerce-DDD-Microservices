
namespace Ordering.Application.Dtos;

public record OrderItemDto(Guid OrderId, Guid ProductId, string ProductName, int Quantity, float Price);
