using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.IO;

namespace Media.API.Endpoints;

public class UploadMediaEndpoint : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/media/upload", async (HttpRequest request, IWebHostEnvironment env, Microsoft.Extensions.Configuration.IConfiguration config) =>
        {
            if (!request.HasFormContentType || !request.Form.Files.Any())
            {
                return Results.BadRequest("No files uploaded.");
            }

            var uploadedUrls = new List<string>();
            var uploadPath = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images");

            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            foreach (var file in request.Form.Files)
            {
                if (file.Length > 0)
                {
                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var filePath = Path.Combine(uploadPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }


                    var baseUrl = config["ExternalUrl"] ?? $"{request.Scheme}://{request.Host}";
                    var fileUrl = $"{baseUrl}/images/{fileName}";
                    uploadedUrls.Add(fileUrl);
                }
            }

            return Results.Ok(new { Urls = uploadedUrls });
        }).DisableAntiforgery();

        app.MapDelete("/api/media/{fileName}", (string fileName, IWebHostEnvironment env) =>
        {
            var uploadPath = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images");
            var filePath = Path.Combine(uploadPath, fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            return Results.NoContent();
        });
    }
}
