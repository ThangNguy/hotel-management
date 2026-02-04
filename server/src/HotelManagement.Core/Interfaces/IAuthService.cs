using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IAuthService
    {
        /// <summary>
        /// Generate a JWT access token for the user
        /// </summary>
        string GenerateJwtToken(User user);
        
        /// <summary>
        /// Generate a refresh token
        /// </summary>
        RefreshToken GenerateRefreshToken(string ipAddress);
        
        /// <summary>
        /// Get the access token expiration in minutes from configuration
        /// </summary>
        int GetAccessTokenExpirationMinutes();
        
        /// <summary>
        /// Get the refresh token expiration in days from configuration
        /// </summary>
        int GetRefreshTokenExpirationDays();
    }
}