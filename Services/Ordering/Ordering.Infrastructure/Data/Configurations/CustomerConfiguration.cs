using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using OrderingDomain.Models;
using OrderingDomain.ValueObjects;

namespace Ordering.Infrastructure.Data.Configurations;

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasConversion(customerId => customerId.Value, dbId => CustomerId.Of(dbId));
        builder.Property(c => c.Name).HasMaxLength(100).IsRequired(true);
        builder.Property(c => c.Email).HasMaxLength(255).IsRequired(true);
        builder.HasIndex(c => c.Email).IsUnique();
    }
}

