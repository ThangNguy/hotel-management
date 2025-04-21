using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.Core.Interfaces
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(IFormFile file);
        Task<List<string>> SaveImagesAsync(List<IFormFile> files);
        bool DeleteImage(string imageUrl);
        string GetImageUrl(string imagePath);
    }
}