using System;
using System.Linq;
using System.Security.Claims;
using HotelManagement.Core.Interfaces;
using Microsoft.AspNetCore.Http;

namespace HotelManagement.Infrastructure.Services
{
    public class TenantContext : ITenantContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TenantContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int HotelId
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                if (user == null || !user.Identity.IsAuthenticated)
                {
                    // Fallback or throw exception depending on requirement
                    // For now returning 0 which might indicate no tenant
                    return 0;
                }

                // Try to get from claims
                var hotelIdClaim = user.Claims.FirstOrDefault(c => c.Type == "hotel_id");
                if (hotelIdClaim != null && int.TryParse(hotelIdClaim.Value, out int hotelId))
                {
                    return hotelId;
                }

                return 0;
            }
        }

        public bool IsAdmin
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                return user != null && user.IsInRole("admin");
            }
        }
    }
}
