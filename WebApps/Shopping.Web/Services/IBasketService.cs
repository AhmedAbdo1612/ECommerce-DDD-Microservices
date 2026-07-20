namespace Shopping.Web.Services;

public interface IBasketService
{
    [Get("/basket/{userName}")]
    Task<GetBasketResponse> GetBasket(string userName);

    [Post("/basket")]
    Task<StoreBasketResponse> StoreBasket([Body] StoreBasketRequest request);

    [Delete("/basket/{userName}")]
    Task<DeleteBasketResponse> DeleteBasket(string userName);

    [Post("/basket/{userName}/items")]
    Task<AddItemResponse> AddBasketItem(string userName, [Body] AddItemRequest request);

    [Delete("/basket/{userName}/items/{productId}")]
    Task<RemoveItemResponse> RemoveBasketItem(string userName, Guid productId);

    [Put("/basket/{userName}/items/{productId}")]
    Task<UpdateItemQuantityResponse> UpdateBasketItemQuantity(string userName, Guid productId, [Body] UpdateItemQuantityRequest request);

    [Post("/basket/Checkout")]
    Task<CheckoutBasketResponse> CheckoutBasket([Body] CheckoutBasketRequest request);
}
