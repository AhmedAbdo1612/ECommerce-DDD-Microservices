namespace OrderingDomain.Models
{
    public class OrderItem : Entity<OrderItemId>
    {
        internal OrderItem(OrderId orderId, ProductId productId, string productName, int quantity, float price)
        {
            Id = OrderItemId.Of(Guid.NewGuid());
            OrderId = orderId;
            ProductId = productId;
            ProductName = productName;
            Quantity = quantity;
            Price = price;
        }
        public OrderId OrderId { get; private set; } = default!;
        public ProductId ProductId { get; private set; } = default!;
        public string ProductName { get; private set; } = default!;
        public int Quantity { get; private set; } = default!;
        public float Price { get; private set; } = default!;

        public static OrderItem Create(OrderId orderId, ProductId productId, string productName, int quantity,float price)
        {
            return new OrderItem(orderId,productId,productName,quantity,price);
        }
        internal void UpdateQuantityAndPrice(int quantity, float price)
        {
            Quantity = quantity;
            Price    = price;
        }
    }
}
