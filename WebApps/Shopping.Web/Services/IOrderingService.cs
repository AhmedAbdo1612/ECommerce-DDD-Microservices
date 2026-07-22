using Shopping.Web.Models.Ordering;
using Refit;

namespace Shopping.Web.Services;

public interface IOrderingService
{
    [Get("/orders?pageIndex={pageIndex}&pageSize={pageSize}")]
    Task<GetOrdersResponse> GetOrders(int? pageIndex = 1, int? pageSize = 10);
    
    [Get("/orders/{orderName}")]
    Task<GetOrdersByNameResponse> GetOrdersByName(string orderName);
    
    [Get("/orders/customer/{customerId}")]
    Task<GetOrdersByCustomerResponse> GetOrdersByCustomer(Guid customerId);

    [Get("/orders/{id}")]
    Task<GetOrderByIdResponse> GetOrderById(Guid id);

    [Put("/orders")]
    Task<UpdateOrderResponse> UpdateOrder([Body] UpdateOrderRequest request);

    [Delete("/orders/{id}")]
    Task<DeleteOrderResponse> DeleteOrder(Guid id);
}
