using System;
using System.Linq;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public RefreshTokenRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RefreshToken> GetByHashAsync(string tokenHash)
        {
            // Refresh tokens are owned by users that may belong to any tenant.
            // Token resolution must happen before tenant context is established,
            // so we bypass the global query filter.
            return await _dbContext.RefreshTokens
                .IgnoreQueryFilters()
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == tokenHash);
        }

        public async Task<RefreshToken> AddAsync(RefreshToken refreshToken)
        {
            await _dbContext.RefreshTokens.AddAsync(refreshToken);
            await _dbContext.SaveChangesAsync();
            return refreshToken;
        }

        public async Task<RefreshToken> UpdateAsync(RefreshToken refreshToken)
        {
            _dbContext.RefreshTokens.Update(refreshToken);
            await _dbContext.SaveChangesAsync();
            return refreshToken;
        }

        public async Task RevokeAllActiveForUserAsync(int userId, string reason)
        {
            var now = DateTime.UtcNow;
            var activeTokens = await _dbContext.RefreshTokens
                .IgnoreQueryFilters()
                .Where(rt => rt.UserId == userId && rt.RevokedAt == null && rt.ExpiresAt > now)
                .ToListAsync();

            foreach (var token in activeTokens)
            {
                token.RevokedAt = now;
                token.RevocationReason = reason;
            }

            if (activeTokens.Count > 0)
            {
                await _dbContext.SaveChangesAsync();
            }
        }

        public async Task RemoveOldRefreshTokensAsync(int userId, int keepCount = 5)
        {
            var oldTokens = await _dbContext.RefreshTokens
                .IgnoreQueryFilters()
                .Where(rt => rt.UserId == userId && (rt.RevokedAt != null || rt.ExpiresAt < DateTime.UtcNow))
                .OrderByDescending(rt => rt.CreatedAt)
                .Skip(keepCount)
                .ToListAsync();

            if (oldTokens.Any())
            {
                _dbContext.RefreshTokens.RemoveRange(oldTokens);
                await _dbContext.SaveChangesAsync();
            }
        }
    }
}
