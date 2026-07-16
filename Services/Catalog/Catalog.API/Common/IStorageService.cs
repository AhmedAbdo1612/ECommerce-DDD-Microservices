using Microsoft.AspNetCore.Http;

namespace Catalog.API.Common
{
    public interface IStorageService
    {
        Task<string> UploadFileAsync(IFormFile file);
        void DeleteFile(string fileUrl);
        string GetFullUrl(string imageName);
    }
}
