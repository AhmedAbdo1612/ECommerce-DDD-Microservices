using Identity.API.Data;
using Identity.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.API.Data
{
    public class DatabaseInitializer(
        IdentityContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger<DatabaseInitializer> logger)
    {
        public async Task InitializeAsync()
        {
            try
            {
                if (context.Database.IsNpgsql())
                {
                    logger.LogInformation("Applying migrations...");
                    await context.Database.MigrateAsync();
                }

                logger.LogInformation("Seeding database...");
                await SeedRolesAsync();
                await SeedAdminUserAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while initializing the database.");
                throw;
            }
        }

        private async Task SeedRolesAsync()
        {
            var roles = new[] { "Customer", "Manager", "Admin" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    logger.LogInformation("Creating role: {Role}", role);
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private async Task SeedAdminUserAsync()
        {
            const string adminEmail = "admin@instashop.com";
            const string adminUserName = "root-admin";
            
            if (await userManager.FindByNameAsync(adminUserName) == null)
            {
                logger.LogInformation("Creating default admin user...");
                
                var adminUser = new ApplicationUser
                {
                    UserName = adminUserName,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                // Using the specific password requested by the user
                var result = await userManager.CreateAsync(adminUser, "Ahmed123*");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                    logger.LogInformation("Default admin user created successfully.");
                }
                else
                {
                    logger.LogError("Failed to create default admin user: {Errors}", 
                        string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
        }
    }
}
