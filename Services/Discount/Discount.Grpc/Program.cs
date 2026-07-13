
using Discount.Grpc.Data;
using Discount.Grpc.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddGrpc();
builder.Services.AddDbContext<DiscountContext>(opt => opt.UseSqlite(builder.Configuration.GetConnectionString("Database")));
builder.Services.AddOpenApiDocument();


var app = builder.Build();
app.UseMigration();
app.MapGrpcService<DiscountService>();

app.UseOpenApi();
app.UseSwaggerUi();
app.Run();
