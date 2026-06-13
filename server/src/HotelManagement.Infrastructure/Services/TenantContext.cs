using HotelManagement.Core.Common;
using HotelManagement.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Linq;

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
                var context = _httpContextAccessor.HttpContext;
                if (context == null) return 0;

                if (context.Items.TryGetValue("HotelId", out var hotelIdObj) && hotelIdObj is int hotelIdItem)
                {
                    return hotelIdItem;
                }

                var user = context.User;
                if (user != null && user.Identity?.IsAuthenticated == true)
                {
                    var hotelIdClaim = user.Claims.FirstOrDefault(c => c.Type == "hotel_id");
                    if (hotelIdClaim != null && int.TryParse(hotelIdClaim.Value, out int hotelId))
                    {
                        return hotelId;
                    }
                }

                return 0;
            }
        }

        public bool IsSuperAdmin
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                return user != null && user.IsInRole(Roles.SuperAdmin);
            }
        }
    }
}
