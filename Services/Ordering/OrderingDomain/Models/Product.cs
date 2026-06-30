namespace OrderingDomain.Models
{
    public class Product : Entity<ProductId>
    {
        public string Name { get; private set; } = default!;
        public float Price { get; private set; } = default!;
        public static Product Create(ProductId productId, string name, float price)
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(name);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);
            return new Product { Id = productId, Name = name, Price = price };
        }

    }
}
