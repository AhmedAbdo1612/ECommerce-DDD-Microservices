using JasperFx;


namespace Baket.API.Models
{
    public class ShoppingCart
    {
        [Identity]
        public string UserName { get; set; } = default!;
        public List<ShoppingCartItem> Items { get; set; } = new();
        public float TotalPrice => Items.Sum(x => x.Price * x.Quantity);
        public ShoppingCart(string userName)
        {
            UserName = userName;
        }
        public ShoppingCart()
        {
            
        }
    }
}
