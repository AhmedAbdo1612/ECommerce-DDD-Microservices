
namespace OrderingDomain.ValueObjects
{
    public record OrderId
    {
        public Guid Value { get; set; }
        private OrderId(Guid value) => Value = value;
        public static OrderId Of(Guid value)
        {
            ArgumentNullException.ThrowIfNull(value);
            if (value == Guid.Empty)
            {
                throw new Exception("Order Id Cannot be embty");
            }
            return new OrderId(value);
        }
    }
}
