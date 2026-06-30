

namespace OrderingDomain.ValueObjects
{
    public class ProductId
    {
        public Guid Value { get; set; }
        private ProductId(Guid value)
        {
            Value = value;
        }

        public static ProductId Of(Guid value)
        {
            ArgumentNullException.ThrowIfNull(value);
            if (value == Guid.Empty) throw new Exception("ProductId cannot be embty");
            return new ProductId(value);
        }
    }
}
