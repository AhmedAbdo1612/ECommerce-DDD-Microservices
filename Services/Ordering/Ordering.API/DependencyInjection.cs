using Carter;
using BuildingBlocks.Exceptions.Handler;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using HealthChecks.UI.Client;

namespace Ordering.API
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddCarter();
            services.AddHealthChecks()
                .AddNpgSql(config.GetConnectionString("Database")!);
            return services;
        }
        public static WebApplication UseApiServices(this WebApplication app)
        {
            app.UseMiddleware<CustomExceptionHandler>();

            app.MapCarter();
            app.UseHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter =    UIResponseWriter.WriteHealthCheckUIResponse
            });

            return app;
        }
    }
}
