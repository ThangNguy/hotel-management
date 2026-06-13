using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IAuthService
    {
        /// <summary>
        /// Generate a JWT access token for the user.
        /// </summary>
        string GenerateJwtToken(User user);

        /// <summary>
        /// Generate a refresh token.
        /// Returns the entity to persist (Token column stores the SHA-256 hash)
        /// and the raw token string to return to the client. The raw token is never persisted.
        /// </summary>
        (RefreshToken Entity, string RawToken) GenerateRefreshToken(string ipAddress);

        /// <summary>
        /// Hash a raw refresh token using SHA-256 for DB lookup/comparison.
        /// </summary>
        string HashRefreshToken(string rawToken);

        int GetAccessTokenExpirationMinutes();
        int GetRefreshTokenExpirationDays();
    }
}
