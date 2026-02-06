using System;
using System.Collections.Generic;

namespace HotelManagement.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public int HotelId { get; set; }
        public Hotel Hotel { get; set; } = default!;
        
        /// <summary>
        /// Collection of refresh tokens for this user
        /// </summary>
        public List<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }
}