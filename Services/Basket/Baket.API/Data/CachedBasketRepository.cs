namespace Baket.API.Data
{
    public class CachedBasketRepository(IBasketRespository repo,IDistributedCache cache) : IBasketRespository
    {
        public async Task<ShoppingCart> GetBasket(string UserName, CancellationToken cancellationToken = default)
        {
            var cachedBasket = await cache.GetStringAsync(UserName, cancellationToken);
            
            if (!string.IsNullOrEmpty(cachedBasket))
            {
               return JsonSerializer.Deserialize<ShoppingCart>(cachedBasket)!;
            }
            var basket= await repo.GetBasket(UserName, cancellationToken);
            await cache.SetStringAsync(UserName, JsonSerializer.Serialize(basket),cancellationToken);
            return basket;
        }

        public async Task<ShoppingCart> StoreBasket(ShoppingCart basket, CancellationToken cancellationToken = default)
        {
            await cache.SetStringAsync(basket.UserName,JsonSerializer.Serialize(basket),cancellationToken);
            return await repo.StoreBasket(basket, cancellationToken);
        }
        public async Task<bool> DeleteBasket(string UserName, CancellationToken cancellationToken = default)
        {
            await cache.RemoveAsync(UserName, cancellationToken);
            return await repo.DeleteBasket(UserName, cancellationToken);
        }
    }
}
