using System.Linq;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for refresh token operations
    /// </summary>
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public RefreshTokenRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<RefreshToken> GetByTokenAsync(string token)
        {
            return await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.Token == token);
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

        public async Task RemoveOldRefreshTokensAsync(int userId, int keepCount = 5)
        {
            var oldTokens = await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == userId && (rt.RevokedAt != null || rt.ExpiresAt < System.DateTime.Now))
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
