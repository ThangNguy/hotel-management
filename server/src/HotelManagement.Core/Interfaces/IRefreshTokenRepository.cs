using System.Threading.Tasks;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    /// <summary>
    /// Repository interface for refresh token operations
    /// </summary>
    public interface IRefreshTokenRepository
    {
        /// <summary>
        /// Get a refresh token by its token string
        /// </summary>
        Task<RefreshToken> GetByTokenAsync(string token);
        
        /// <summary>
        /// Add a new refresh token
        /// </summary>
        Task<RefreshToken> AddAsync(RefreshToken refreshToken);
        
        /// <summary>
        /// Update an existing refresh token
        /// </summary>
        Task<RefreshToken> UpdateAsync(RefreshToken refreshToken);
        
        /// <summary>
        /// Remove old revoked or expired tokens for a user
        /// </summary>
        Task RemoveOldRefreshTokensAsync(int userId, int keepCount = 5);
    }
}
