using Microsoft.AspNetCore.Http;
using Ordering.Application.Data;
using Ordering.Infrastructure.Data.Interceptors;

namespace Ordering.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("Database");
            services.AddHttpContextAccessor();
            services.AddScoped<ISaveChangesInterceptor,AuditableEntityInterceptor>();
            services.AddScoped<ISaveChangesInterceptor,DispatchDomainEventInterceptor>();
            services.AddDbContext<ApplicationDbContext>((sp,opt) =>
            {
               opt.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
                opt.UseNpgsql(connectionString);
                opt.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            });
            services.AddScoped<IApplicationDbContext, ApplicationDbContext>();
            return services;
        }
    }
}
