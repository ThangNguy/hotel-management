using HotelManagement.Core.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.Infrastructure.Services
{
    public class ImageService : IImageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly string _imageDirectory = "uploads/images";
        private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif" };
        private readonly long _fileSizeLimit = 5 * 1024 * 1024; // 5MB

        public ImageService(IWebHostEnvironment environment)
        {
            _environment = environment;
            
            // Ensure the upload directory exists
            var uploadPath = Path.Combine(_environment.WebRootPath, _imageDirectory);
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }
        }

        public async Task<string> SaveImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded");
            }

            ValidateFile(file);

            // Generate a unique filename to prevent overwriting
            var fileName = GetUniqueFileName(file.FileName);
            var filePath = Path.Combine(_environment.WebRootPath, _imageDirectory, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative path
            return $"/{_imageDirectory}/{fileName}";
        }

        public async Task<List<string>> SaveImagesAsync(List<IFormFile> files)
        {
            if (files == null || !files.Any())
            {
                throw new ArgumentException("No files uploaded");
            }

            var imageUrls = new List<string>();
            foreach (var file in files)
            {
                if (file.Length > 0)
                {
                    try
                    {
                        var imageUrl = await SaveImageAsync(file);
                        imageUrls.Add(imageUrl);
                    }
                    catch (Exception)
                    {
                        // Log exception, continue with other files
                        continue;
                    }
                }
            }

            return imageUrls;
        }

        public bool DeleteImage(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return false;

            // Extract the file path from the URL
            var filePath = imageUrl.TrimStart('/').Replace("/", "\\");
            var fullPath = Path.Combine(_environment.WebRootPath, filePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }

            return false;
        }

        public string GetImageUrl(string imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return null;

            // Ensure the path starts with a slash for proper URL formatting
            if (!imagePath.StartsWith("/"))
                return $"/{imagePath}";

            return imagePath;
        }

        private void ValidateFile(IFormFile file)
        {
            // Check file size
            if (file.Length > _fileSizeLimit)
            {
                throw new ArgumentException($"File size exceeds the limit of {_fileSizeLimit / (1024 * 1024)}MB");
            }

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"File type {extension} is not allowed. Allowed types: {string.Join(", ", _allowedExtensions)}");
            }
        }

        private string GetUniqueFileName(string fileName)
        {
            // Generate a unique filename by adding a timestamp
            var extension = Path.GetExtension(fileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
            return $"{nameWithoutExtension}_{timestamp}{extension}";
        }
    }
}