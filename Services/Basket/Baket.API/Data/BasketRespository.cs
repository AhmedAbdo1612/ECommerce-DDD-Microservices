namespace Baket.API.Data
{
    public class BasketRespository(IDocumentSession session) : IBasketRespository
    {
        public async Task<ShoppingCart> GetBasket(string UserName, CancellationToken cancellationToken = default)
        {
            var basket = await session.LoadAsync<ShoppingCart>(UserName, cancellationToken);
            //if (basket is null) throw new BuildingBlocks.Exceptions.NotFoundException("Basket", UserName);
            return basket;
        }
        public async Task<ShoppingCart> StoreBasket(ShoppingCart basket, CancellationToken cancellationToken = default)
        {
            session.Store(basket);
            await session.SaveChangesAsync(cancellationToken);
            return basket;
        }
        public async Task<bool> DeleteBasket(string UserName, CancellationToken cancellationToken = default)
        {
            session.Delete<ShoppingCart>(UserName);
            await session.SaveChangesAsync(cancellationToken);
            return true;
        }

    }
}
