using Discount.Grpc.Models;
using Microsoft.EntityFrameworkCore;

namespace Discount.Grpc.Data
{
    public class DiscountContext : DbContext
    {
        public DbSet<Coupon> Coupons { get; set; }

        public DiscountContext(DbContextOptions<DiscountContext> opt) : base(opt)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Coupon>().HasData(
                new Coupon { Id = 1, ProductName = "Samsung S26", Description = "Samsung S26", Amount = 150 },
                 new Coupon { Id = 2, ProductName = "Dell 3530", Description = "Dell discount", Amount = 250 }
                );
        }
    }
}
