using Shopping.Web.Models.Ordering;

namespace Shopping.Web.Services;

public interface IOrderingService
{
    [Get("/order-service/orders?pageIndex={pageIndex}&pageSize={pageSize}")]
    Task<GetOrdersResponse> GetOrders(int? pageIndex = 1, int? pageSize = 10);
    [Get("/order-service/orders/{orderName}")]
    Task<GetOrdersResponse> GetOrdersByName(string orderName);
    [Get("/order-service/orders/customer/{customerId}")]
    Task<GetOrdersByCustomerResponse> GetOrdersByCustomer(Guid customerId);
}
