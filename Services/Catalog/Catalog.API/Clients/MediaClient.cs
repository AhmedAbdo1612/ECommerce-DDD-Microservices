using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Catalog.API.Clients;

public class MediaClient(HttpClient httpClient)
{
    public async Task<string> UploadFileAsync(IFormFile file)
    {
        using var content = new MultipartFormDataContent();

        var fileContent = new StreamContent(file.OpenReadStream());
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
        content.Add(fileContent, "files", file.FileName);

        var response = await httpClient.PostAsync("/api/media/upload", content);
        if (response.IsSuccessStatusCode)
        {
            var result = await response.Content.ReadFromJsonAsync<UploadMediaResponse>();
            return result?.Urls?.FirstOrDefault() ?? string.Empty;
        }
        return string.Empty;
    }

    public async Task DeleteFileAsync(string fileUrl)
    {
        var fileName = Path.GetFileName(fileUrl);
        await httpClient.DeleteAsync($"/api/media/{fileName}");
    }
}

public class UploadMediaResponse
{
    public List<string> Urls { get; set; } = new();
}
