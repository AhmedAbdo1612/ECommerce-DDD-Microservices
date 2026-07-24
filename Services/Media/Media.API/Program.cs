using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", p =>
    {
        p.WithOrigins("http://localhost:5173", "http://localhost:3000")
         .AllowAnyHeader()
         .AllowAnyMethod();
    });
});
builder.Services.AddCarter();

var app = builder.Build();

app.UseCors("AllowReact");
app.UseStaticFiles();
app.MapCarter();
app.UseStaticFiles();
app.Run();
