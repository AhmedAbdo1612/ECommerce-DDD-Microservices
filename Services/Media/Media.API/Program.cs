using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCarter();

var app = builder.Build();

app.UseStaticFiles();
app.MapCarter();
app.UseStaticFiles();
app.Run();
