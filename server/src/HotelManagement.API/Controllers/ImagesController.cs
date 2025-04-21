using HotelManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HotelManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IImageService _imageService;

        public ImagesController(IImageService imageService)
        {
            _imageService = imageService;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UploadImage([FromForm] UploadImageRequest request)
        {
            if (request.File == null || request.File.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                var imageUrl = await _imageService.SaveImageAsync(request.File);
                return Ok(new { Url = imageUrl });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload-multiple")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UploadMultipleImages([FromForm] UploadMultipleImagesRequest request)
        {
            if (request.Files == null || request.Files.Count == 0)
                return BadRequest("No files uploaded");

            try
            {
                var imageUrls = await _imageService.SaveImagesAsync(request.Files);
                return Ok(new { Urls = imageUrls });
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{imageUrl}")]
        [Authorize(Roles = "admin")]
        public IActionResult DeleteImage(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return BadRequest("No image URL provided");

            var result = _imageService.DeleteImage(imageUrl);
            if (result)
                return Ok(new { Message = "Image deleted successfully" });
            else
                return NotFound("Image not found");
        }
    }

    public class UploadImageRequest
    {
        public Microsoft.AspNetCore.Http.IFormFile File { get; set; }
    }

    public class UploadMultipleImagesRequest
    {
        public List<Microsoft.AspNetCore.Http.IFormFile> Files { get; set; }
    }
}