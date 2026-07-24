using Ordering.API;
using Ordering.Application;
using Ordering.Infrastructure;
using BuildingBlocks.Authentication;
using Ordering.Infrastructure.Data.Extensions;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// ── JSON serialisation ────────────────────────────────────────────────────────
// Configure System.Text.Json globally:
//   • Enums serialised as string names (e.g. "Pending") — consistent with the
//     DB column that stores status as a VARCHAR via HasConversion(s => s.ToString()).
//   • CamelCase property names for RFC-conforming JSON.
//   • Unknown properties are silently skipped (forward-compat).
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.SerializerOptions.PropertyNameCaseInsensitive = true;
});

// Also configure Microsoft.AspNetCore.Mvc.JsonOptions (used by ProblemDetails, etc.)
builder.Services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.AddOpenApiDocument();
builder.Services
    .AddApplicationServices(builder.Configuration)
    .AddInfrastructureServices(builder.Configuration)
    .AddApiServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", p =>
    {
        p.WithOrigins("http://localhost:5173", "http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddJwtAuthentication(builder.Configuration);

var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────────────────
// IMPORTANT — order matters:
//   1. CustomExceptionHandler FIRST so it wraps every subsequent middleware,
//      including the auth stack. Auth failures (malformed JWT, etc.) are caught
//      and returned as structured ProblemDetails JSON instead of a Kestrel HTML 500.
//   2. Then Authentication / Authorisation.
//   3. Then Carter route handlers.
app.UseApiServices();           // registers CustomExceptionHandler + MapCarter

app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    await app.InitialiseDatabaseAsync();
}

app.UseOpenApi();
app.UseSwaggerUi();
app.Run();
