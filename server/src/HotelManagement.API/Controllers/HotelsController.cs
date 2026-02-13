using HotelManagement.Core.DTOs;
using HotelManagement.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace HotelManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HotelsController : ControllerBase
    {
        private readonly IHotelRepository _hotelRepository;
        private readonly ITenantContext _tenantContext;

        public HotelsController(IHotelRepository hotelRepository, ITenantContext tenantContext)
        {
            _hotelRepository = hotelRepository;
            _tenantContext = tenantContext;
        }

        [HttpGet("current")]
        public async Task<ActionResult<HotelDto>> GetCurrent()
        {
            var hotelId = _tenantContext.HotelId;
            if (hotelId == 0)
            {
                return NotFound("No tenant resolved");
            }

            var hotel = await _hotelRepository.GetByIdAsync(hotelId);
            if (hotel == null)
            {
                return NotFound();
            }

            return Ok(new HotelDto
            {
                Id = hotel.Id,
                Name = hotel.Name,
                Domain = hotel.Domain,
                Address = hotel.Address,
                IsActive = hotel.IsActive,
                CreatedAt = hotel.CreatedAt
            });
        }
    }
}
