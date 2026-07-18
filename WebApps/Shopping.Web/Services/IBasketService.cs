namespace Shopping.Web.Services;

public interface IBasketService
{
    [Get("/basket/{userName}")]
    Task<GetBasketResponse> GetBasket(string userName);
    [Post("/basket")]
    Task<StoreBasketResponse> StoreBasket([Body] StoreBasketRequest request);
    [Delete("/basket/{userName}")]
    Task<DeleteBasketResponse> DeleteBasket(string userName);
    [Post("/basket/Checkout")]
    Task<CheckoutBasketResponse> CheckoutBasket([Body] CheckoutBasketRequest request);
}
