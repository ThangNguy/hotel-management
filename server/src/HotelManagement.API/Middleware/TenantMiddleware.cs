using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace HotelManagement.Api.Middleware
{
    public class TenantMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<TenantMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public TenantMiddleware(
            RequestDelegate next,
            IMemoryCache cache,
            IServiceScopeFactory scopeFactory,
            ILogger<TenantMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _cache = cache;
            _scopeFactory = scopeFactory;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Authenticated requests rely on the hotel_id claim resolved by TenantContext.
            // We only resolve tenant from Host for anonymous public traffic.
            if (context.User.Identity?.IsAuthenticated == true)
            {
                await _next(context);
                return;
            }

            var host = context.Request.Host.Host;

            // X-Tenant-Domain override is ONLY honored in Development for local testing.
            // In production this header is ignored.
            if (_environment.IsDevelopment() &&
                context.Request.Headers.TryGetValue("X-Tenant-Domain", out var devDomain))
            {
                host = devDomain.ToString();
            }

            if (!_cache.TryGetValue($"Tenant_{host}", out int hotelId))
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                    var hotel = await dbContext.Hotels
                        .AsNoTracking()
                        .FirstOrDefaultAsync(h => h.Domain == host);

                    if (hotel != null)
                    {
                        hotelId = hotel.Id;
                        _cache.Set($"Tenant_{host}", hotelId, TimeSpan.FromMinutes(30));
                    }
                    else
                    {
                        hotelId = 0;
                    }
                }
            }

            if (hotelId > 0)
            {
                context.Items["HotelId"] = hotelId;
            }

            await _next(context);
        }
    }
}
