namespace Baket.API.Data
{
    public interface IBasketRespository
    {
        Task<ShoppingCart> GetBasket(string UserName, CancellationToken cancellationToken = default);
        Task<ShoppingCart> StoreBasket(ShoppingCart basket, CancellationToken cancellationToken = default);
        Task<bool> DeleteBasket(string UserName, CancellationToken cancellationToken = default);
    }
}
