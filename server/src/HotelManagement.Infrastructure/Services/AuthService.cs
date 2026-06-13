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

        public string GenerateJwtToken(User user)
        {
            var secretKey = _configuration["JWT:Secret"]
                ?? throw new InvalidOperationException("JWT:Secret is not configured.");
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("hotel_id", user.HotelId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expirationMinutes = GetAccessTokenExpirationMinutes();

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public (RefreshToken Entity, string RawToken) GenerateRefreshToken(string ipAddress)
        {
            var refreshTokenDays = GetRefreshTokenExpirationDays();

            var randomBytes = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);

            var rawToken = Convert.ToBase64String(randomBytes);
            var entity = new RefreshToken
            {
                // Persist only the hash; the raw token is returned once to the caller
                // and never re-derivable from the DB.
                Token = HashRefreshToken(rawToken),
                ExpiresAt = DateTime.UtcNow.AddDays(refreshTokenDays),
                CreatedAt = DateTime.UtcNow,
                CreatedByIp = ipAddress
            };

            return (entity, rawToken);
        }

        public string HashRefreshToken(string rawToken)
        {
            var bytes = Encoding.UTF8.GetBytes(rawToken);
            var hash = SHA256.HashData(bytes);
            return Convert.ToBase64String(hash);
        }

        public int GetAccessTokenExpirationMinutes()
        {
            var expirationStr = _configuration["JWT:AccessTokenExpirationMinutes"];
            return int.TryParse(expirationStr, out var minutes) ? minutes : 60;
        }

        public int GetRefreshTokenExpirationDays()
        {
            var expirationStr = _configuration["JWT:RefreshTokenExpirationDays"];
            return int.TryParse(expirationStr, out var days) ? days : 7;
        }
    }
}
