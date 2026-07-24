using BuildingBlocks.Authentication;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173", "http://localhost:3000")
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});


builder.Services.AddRateLimiter(
    rateLimiterOptions =>
    {
        rateLimiterOptions.AddFixedWindowLimiter("fixed", opt =>
        {
            opt.Window = TimeSpan.FromSeconds(10);
            opt.PermitLimit = 5;
        });
    }
    );

var app = builder.Build();


app.UseRateLimiter();
app.UseCors("AllowReact");
app.MapReverseProxy();


app.Run();
