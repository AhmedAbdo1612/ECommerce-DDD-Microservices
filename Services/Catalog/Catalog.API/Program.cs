
using HealthChecks.UI.Client;

var builder = WebApplication.CreateBuilder(args);
var assembly = typeof(Program).Assembly;
builder.Services.AddCarter();
builder.Services.AddMediatR(con =>
{
    con.RegisterServicesFromAssembly(assembly);
    con.AddOpenBehavior(typeof(ValidationBehaviour<,>));
    con.AddOpenBehavior(typeof(LoggingBehavior<,>));
});
builder.Services.AddSwaggerGen();
builder.Services.AddMarten(c =>
{
    c.Connection(builder.Configuration.GetConnectionString("Database")!);

}).UseLightweightSessions();
if (builder.Environment.IsDevelopment())
{
    builder.Services.InitializeMartenWith<CatalogInitialData>();
}

builder.Services.AddValidatorsFromAssembly(assembly);
builder.Services.AddHealthChecks().AddNpgSql(builder.Configuration.GetConnectionString("Database")!);
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.MapCarter();

app.UseSwagger();
app.UseSwaggerUI();
app.UseHealthChecks("/health",
    new HealthCheckOptions
    {
        ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
    }
    );

app.Run();
