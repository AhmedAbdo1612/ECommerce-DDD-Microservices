using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderingDomain.Models;
using OrderingDomain.ValueObjects;

namespace Ordering.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasConversion(
            orderId => orderId.Value,
            dbId => OrderItemId.Of(dbId)
            );
        builder.Property(x => x.ProductId).HasConversion(
            productId => productId.Value,
            dbId => ProductId.Of(dbId)
        );
        builder.Property(x => x.ProductName).IsRequired().HasMaxLength(150);
        builder.Property(x => x.Quantity).IsRequired();
        builder.Property(x => x.Price).IsRequired();
    }
}

