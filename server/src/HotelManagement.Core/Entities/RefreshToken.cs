using System;

namespace HotelManagement.Core.Entities
{
    /// <summary>
    /// Entity representing a refresh token for JWT token renewal
    /// </summary>
    public class RefreshToken
    {
        public int Id { get; set; }
        
        /// <summary>
        /// The refresh token string
        /// </summary>
        public string Token { get; set; }
        
        /// <summary>
        /// User ID this token belongs to
        /// </summary>
        public int UserId { get; set; }
        
        /// <summary>
        /// Navigation property to User
        /// </summary>
        public User User { get; set; }
        
        /// <summary>
        /// When the token expires
        /// </summary>
        public DateTime ExpiresAt { get; set; }
        
        /// <summary>
        /// When the token was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        
        /// <summary>
        /// When the token was revoked (null if active)
        /// </summary>
        public DateTime? RevokedAt { get; set; }
        
        /// <summary>
        /// IP address that created this token
        /// </summary>
        public string CreatedByIp { get; set; } = string.Empty;
        
        /// <summary>
        /// Token that replaced this one (if rotated)
        /// </summary>
        public string? ReplacedByToken { get; set; }
        
        /// <summary>
        /// Check if token is expired
        /// </summary>
        public bool IsExpired => DateTime.Now >= ExpiresAt;
        
        /// <summary>
        /// Check if token has been revoked
        /// </summary>
        public bool IsRevoked => RevokedAt != null;
        
        /// <summary>
        /// Check if token is still active (not expired and not revoked)
        /// </summary>
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
