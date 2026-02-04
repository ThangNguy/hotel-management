using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace HotelManagement.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;

        public AuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Generate a JWT access token for the user
        /// </summary>
        public string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expirationMinutes = GetAccessTokenExpirationMinutes();
            
            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(expirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Generate a refresh token
        /// </summary>
        public RefreshToken GenerateRefreshToken(string ipAddress)
        {
            var refreshTokenDays = GetRefreshTokenExpirationDays();
            
            // Generate a secure random token
            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            
            return new RefreshToken
            {
                Token = Convert.ToBase64String(randomBytes),
                ExpiresAt = DateTime.Now.AddDays(refreshTokenDays),
                CreatedAt = DateTime.Now,
                CreatedByIp = ipAddress
            };
        }

        /// <summary>
        /// Get the access token expiration in minutes from configuration
        /// </summary>
        public int GetAccessTokenExpirationMinutes()
        {
            var expirationStr = _configuration["JWT:AccessTokenExpirationMinutes"];
            return int.TryParse(expirationStr, out var minutes) ? minutes : 60; // Default 60 minutes
        }

        /// <summary>
        /// Get the refresh token expiration in days from configuration
        /// </summary>
        public int GetRefreshTokenExpirationDays()
        {
            var expirationStr = _configuration["JWT:RefreshTokenExpirationDays"];
            return int.TryParse(expirationStr, out var days) ? days : 7; // Default 7 days
        }
    }
}