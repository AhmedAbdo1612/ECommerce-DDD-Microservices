using BuildingBlocks.Messaging.MassTransit;
using Discount.Grpc.Protos;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCarter();
var assembly = typeof(Program).Assembly;
builder.Services.AddMediatR(opt =>
{
    opt.RegisterServicesFromAssembly(assembly);
    //opt.AddBehavior(typeof(ValidationBehaviour<,>));
    //opt.AddBehavior(typeof(LoggingBehavior<,>));
});
builder.Services.AddMarten(c =>
{
    c.Connection(builder.Configuration.GetConnectionString("Database")!);
    c.Schema.For<ShoppingCart>().Identity(x => x.UserName);

}).UseLightweightSessions();

builder.Services.AddScoped<IBasketRespository, BasketRespository>();
builder.Services.Decorate<IBasketRespository, CachedBasketRepository>();
builder.Services.AddStackExchangeRedisCache(opt =>
{
    opt.Configuration = builder.Configuration.GetConnectionString("Redis");
});
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("Database")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);
//builder.Services.AddScoped<IBasketRespository>(provider =>
//{
//    var basketRepository = provider.GetRequiredService<BasketRespository>();
//    return new CachedBasketRepository(basketRepository, provider.GetRequiredService<IDistributedCache>());

//});
builder.Services.AddGrpcClient<DiscountProtoService.DiscountProtoServiceClient>(
    opt =>
    {
        opt.Address = new Uri(builder.Configuration["GrpcSttgins:DiscountUrl"]!);
    }
    );
builder.Services.AddMessageBroker(builder.Configuration);
var app = builder.Build();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHealthChecks("/health");
app.UseSwagger();
app.UseSwaggerUI();
app.MapCarter();
app.Run();
