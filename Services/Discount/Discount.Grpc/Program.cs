
using Discount.Grpc.Data;
using Discount.Grpc.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", p =>
    {
        p.WithOrigins("http://localhost:5173", "http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod();
    });
});
builder.Services.AddGrpc();
builder.Services.AddDbContext<DiscountContext>(opt => opt.UseSqlite(builder.Configuration.GetConnectionString("Database")));
builder.Services.AddOpenApiDocument();


var app = builder.Build();
app.UseCors("AllowReact");
app.UseMigration();
app.MapGrpcService<DiscountService>();

app.UseOpenApi();
app.UseSwaggerUi();
app.Run();
