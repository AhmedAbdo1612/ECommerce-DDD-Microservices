

using Baket.API.Data;

namespace Baket.API.Basket.GetBaket
{
    public record GetBasketQuery(string UserName) : IQuery<GetBasketResult>;
    public record GetBasketResult(ShoppingCart Cart);

    public class GetBasketQueryHandler(IBasketRespository repo) : IQueryHandler<GetBasketQuery, GetBasketResult>
    {
        public async Task<GetBasketResult> Handle(GetBasketQuery query, CancellationToken cancellationToken)
        {
            var basket = await repo.GetBasket(query.UserName);
            return new GetBasketResult(basket);
        }
    }
}
