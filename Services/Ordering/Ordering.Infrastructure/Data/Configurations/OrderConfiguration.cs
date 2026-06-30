
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderingDomain.Enums;
using OrderingDomain.Models;
using OrderingDomain.ValueObjects;

namespace Ordering.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasConversion(
            orderId => orderId.Value,
            dbId => OrderId.Of(dbId)
            );

        builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(x => x.CustomerId)
            .IsRequired();

        builder.HasMany(o => o.OrderItems)
            .WithOne()
            .HasForeignKey(x => x.OrderId);

        builder.ComplexProperty(
            o => o.OrderName, nameBuilder =>
            {
                nameBuilder.Property(n => n.Value)
                .HasColumnName(nameof(Order.OrderName))
                .HasMaxLength(100)
                .IsRequired();
            }
            );
        builder.ComplexProperty(o => o.ShippingAddress, d =>
        {
            d.Property(x => x.FirstName)
            .HasMaxLength(50)
            .IsRequired();

            d.Property(x => x.LastName)
           .HasMaxLength(50)
           .IsRequired();

            d.Property(x => x.EmailAddress)
           .HasMaxLength(50)
           .IsRequired();

            d.Property(x => x.AddressLine)
           .HasMaxLength(180)
           .IsRequired();

            d.Property(x => x.Country)
          .HasMaxLength(50);

            d.Property(x => x.State)
          .HasMaxLength(50);

            d.Property(x => x.ZipCode)
          .HasMaxLength(5);

        });

        builder.ComplexProperty(o => o.BillingAddress, d =>
        {
            d.Property(x => x.FirstName)
            .HasMaxLength(50)
            .IsRequired();

            d.Property(x => x.LastName)
           .HasMaxLength(50)
           .IsRequired();

            d.Property(x => x.EmailAddress)
           .HasMaxLength(50)
           .IsRequired();

            d.Property(x => x.AddressLine)
           .HasMaxLength(180)
           .IsRequired();

            d.Property(x => x.Country)
          .HasMaxLength(50);

            d.Property(x => x.State)
          .HasMaxLength(50);

            d.Property(x => x.ZipCode)
          .HasMaxLength(5);

        });

        builder.ComplexProperty(o => o.Payment, p =>
        {
            p.Property(x => x.CardName).HasMaxLength(50);
            p.Property(x => x.CardNumber).HasMaxLength(24).IsRequired();
            p.Property(x => x.Expiration).HasMaxLength(10).IsRequired();
            p.Property(x => x.CVV).HasMaxLength(3).IsRequired();
            p.Property(x => x.PaymentMethod);
        });

        builder.Property(o => o.Status)
            .HasDefaultValue(OrderStatus.Draft)
            .HasConversion(s => s.ToString(), dbStatus => (OrderStatus)Enum.Parse(typeof(OrderStatus), dbStatus));

        builder.Property(o => o.TotalPrice);
    }
}

