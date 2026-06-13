using System.Threading.Tasks;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IRefreshTokenRepository
    {
        /// <summary>
        /// Look up a refresh token by its already-hashed value.
        /// </summary>
        Task<RefreshToken> GetByHashAsync(string tokenHash);

        Task<RefreshToken> AddAsync(RefreshToken refreshToken);
        Task<RefreshToken> UpdateAsync(RefreshToken refreshToken);

        /// <summary>
        /// Revoke every active refresh token for a user. Used when token reuse is detected.
        /// </summary>
        Task RevokeAllActiveForUserAsync(int userId, string reason);

        Task RemoveOldRefreshTokensAsync(int userId, int keepCount = 5);
    }
}
