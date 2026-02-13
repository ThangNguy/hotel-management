using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
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

        public TenantMiddleware(RequestDelegate next, IMemoryCache cache, IServiceScopeFactory scopeFactory, ILogger<TenantMiddleware> logger)
        {
            _next = next;
            _cache = cache;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // If user is authenticated, we might rely on claims,
            // but for mixed public/private usage, we should probably resolve tenant anyway.
            // If the user's claim conflicts with the domain they are visiting, that's a security edge case.
            // For now, let's allow the plan's logic: Auth > Domain.
            // But actually, if an Admin from Hotel A visits Hotel B's domain, what happens?
            // They shouldn't be logged in at Hotel B if cookies are domain-scoped?
            // If using JWT in header, the client decides.
            
            // For this task, we focus on PUBLIC access (unauthenticated).
            if (context.User.Identity?.IsAuthenticated == true)
            {
                await _next(context);
                return;
            }

            // Get Host
            var host = context.Request.Host.Host;
            
            // Allow dev override
            if (context.Request.Headers.TryGetValue("X-Tenant-Domain", out var devDomain))
            {
                 host = devDomain.ToString();
            }

            // Check Cache
            if (!_cache.TryGetValue($"Tenant_{host}", out int hotelId))
            {
                // Resolve from DB
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
