namespace Catalog.API.Common
{
    public class LocalStorageService(IWebHostEnvironment env, IHttpContextAccessor httpContextAccessor) : IStorageService
    {
        public async Task<string> UploadFileAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return string.Empty;

            var uploadsFolder = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            var request = httpContextAccessor.HttpContext?.Request;
            if (request != null)
            {
                var baseUrl = $"{request.Scheme}://{request.Host.Value}{request.PathBase.Value}";
                return $"{baseUrl}/images/{uniqueFileName}";
            }

            return $"/images/{uniqueFileName}";
        }

        public void DeleteFile(string fileUrl)
        {
            if (string.IsNullOrWhiteSpace(fileUrl))
                return;

            try
            {
                var uri = new Uri(fileUrl);
                var fileName = Path.GetFileName(uri.LocalPath);
                if (string.IsNullOrEmpty(fileName)) return;

                var filePath = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", fileName);
                
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }
            catch (UriFormatException)
            {
                // In case it's a relative URL or not a valid URL
                var fileName = Path.GetFileName(fileUrl);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var filePath = Path.Combine(env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "images", fileName);
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }
            }
        }

        public string GetFullUrl(string imageName)
        {
            if (string.IsNullOrWhiteSpace(imageName))
                return string.Empty;

            if (imageName.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                imageName.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                return imageName;

            var request = httpContextAccessor.HttpContext?.Request;
            var baseUrl = string.Empty;
            
            if (request != null)
            {
                baseUrl = $"{request.Scheme}://{request.Host.Value}{request.PathBase.Value}";
            }

            var imagePath = imageName.StartsWith("/images/", StringComparison.OrdinalIgnoreCase) 
                ? imageName 
                : (imageName.StartsWith("/") ? $"/images{imageName}" : $"/images/{imageName}");

            return string.IsNullOrEmpty(baseUrl) ? imagePath : $"{baseUrl}{imagePath}";
        }
    }
}
