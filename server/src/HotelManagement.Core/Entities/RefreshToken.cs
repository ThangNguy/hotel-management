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
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// When the token was revoked (null if active)
        /// </summary>
        public DateTime? RevokedAt { get; set; }
        
        /// <summary>
        /// IP address that created this token
        /// </summary>
        public string CreatedByIp { get; set; } = string.Empty;
        
        /// <summary>
        /// Hash of the token that replaced this one during rotation. Used to walk
        /// the chain when reuse is detected. Stores a SHA-256 hash, not the raw token.
        /// </summary>
        public string? ReplacedByToken { get; set; }

        /// <summary>
        /// Optional reason for revocation (e.g., "rotated", "reuse_detected").
        /// </summary>
        public string? RevocationReason { get; set; }

        public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
        public bool IsRevoked => RevokedAt != null;
        public bool IsActive => !IsRevoked && !IsExpired;
    }
}
