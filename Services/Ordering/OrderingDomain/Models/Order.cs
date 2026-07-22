namespace OrderingDomain.Models
{
    public class Order : Aggregate<OrderId>
    {
        private readonly List<OrderItem> _orderItems = new();
        public IReadOnlyList<OrderItem> OrderItems => _orderItems.AsReadOnly();
        public CustomerId CustomerId { get; private set; } = default!;
        public OrderName OrderName { get; private set; } = default!;
        public Address ShippingAddress { get; private set; } = default!;
        public Address BillingAddress { get; private set; } = default!;
        public Payment Payment { get; private set; } = default!;
        public OrderStatus Status { get; private set; } = OrderStatus.Pending;
        public float TotalPrice
        {
            get => OrderItems.Sum(x => x.Price * x.Quantity);
            private set;
        }
        public static Order Create(OrderId id,
            CustomerId customerId,
            OrderName orderName,
            Address shippingAddress,
            Address billingAddress,
            Payment payment)
        {
            var order = new Order
            {
                Id = id,
                CustomerId = customerId,
                OrderName = orderName,
                ShippingAddress = shippingAddress,
                BillingAddress = billingAddress,
                Payment = payment,
                Status = OrderStatus.Pending,
            };
            order.AddDomainEvent(new OrderCreatedEvent(order));
            return order;
        }

        public void Update(
            OrderName orderName,
            Address shippingAddress,
            Address billingAddress,
            Payment payment,
            OrderStatus status
            )
        {
            OrderName = orderName;
            ShippingAddress = shippingAddress;
            BillingAddress = billingAddress;
            Payment = payment;
            Status = status;
            AddDomainEvent(new OrderUpdateEvent(this));
        }

        public void Add(ProductId productId, int quantity, float price)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);
            var orderItem = new OrderItem(Id, productId, quantity, price);
            _orderItems.Add(orderItem);
        }
        public void Remove(ProductId productId)
        {
            var orderItem = _orderItems.FirstOrDefault(x => x.ProductId == productId);
            if (orderItem is not null)
            {
                _orderItems.Remove(orderItem);
            }
        }

        /// <summary>
        /// Updates the quantity and/or price of an existing order item identified by productId.
        /// Does nothing if the product is not in the order.
        /// </summary>
        public void UpdateItem(ProductId productId, int quantity, float price)
        {
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(quantity);
            ArgumentOutOfRangeException.ThrowIfNegativeOrZero(price);
            var orderItem = _orderItems.FirstOrDefault(x => x.ProductId == productId);
            if (orderItem is not null)
            {
                orderItem.UpdateQuantityAndPrice(quantity, price);
            }
        }
    }
}
