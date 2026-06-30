
namespace OrderingDomain.ValueObjects
{
    public record OrderItemId
    {
        public Guid Value { get; set; }
        private OrderItemId(Guid value) => Value = value;
        public static OrderItemId Of(Guid value)
        {
            ArgumentNullException.ThrowIfNull(value);
            if (value == Guid.Empty)
                throw new Exception("OrderItemId cannot be embty");
            return new OrderItemId(value);
        }
    }
}
