using Identity.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Data;

public class IdentityContext : IdentityDbContext<ApplicationUser>
{
    public IdentityContext(DbContextOptions<IdentityContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ApplicationUser>(b =>
        {
            b.OwnsMany(u => u.RefreshTokens, a =>
            {
                a.WithOwner().HasForeignKey("UserId");
                a.Property(r => r.Id).ValueGeneratedOnAdd();
                a.HasKey(r => r.Id);
            });
        });
    }
}