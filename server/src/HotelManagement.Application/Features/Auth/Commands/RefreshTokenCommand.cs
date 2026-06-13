using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Auth.Commands
{
    public class RefreshTokenCommand : IRequest<AuthResponse>
    {
        public string RefreshToken { get; set; }
    }

    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(p => p.RefreshToken)
                .NotEmpty().WithMessage("Refresh token is required.");
        }
    }

    public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponse>
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IAuthService _authService;

        public RefreshTokenCommandHandler(
            IRefreshTokenRepository refreshTokenRepository,
            IAuthService authService)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _authService = authService;
        }

        public async Task<AuthResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var response = new AuthResponse();

            var presentedHash = _authService.HashRefreshToken(request.RefreshToken);
            var stored = await _refreshTokenRepository.GetByHashAsync(presentedHash);

            if (stored == null)
            {
                response.Success = false;
                response.Message = "Invalid refresh token";
                return response;
            }

            if (stored.IsExpired)
            {
                response.Success = false;
                response.Message = "Refresh token has expired";
                return response;
            }

            // Reuse detection: if a token that has already been revoked is presented again,
            // treat it as a stolen token and revoke every active refresh token for this user.
            if (stored.IsRevoked)
            {
                await _refreshTokenRepository.RevokeAllActiveForUserAsync(stored.UserId, "reuse_detected");
                response.Success = false;
                response.Message = "Refresh token has been revoked";
                return response;
            }

            var user = stored.User;

            // Rotate: revoke the current token and issue a new one.
            var (newEntity, newRawToken) = _authService.GenerateRefreshToken(stored.CreatedByIp);
            newEntity.UserId = user.Id;

            stored.RevokedAt = DateTime.UtcNow;
            stored.RevocationReason = "rotated";
            stored.ReplacedByToken = newEntity.Token; // stores the new token's hash

            await _refreshTokenRepository.UpdateAsync(stored);
            await _refreshTokenRepository.AddAsync(newEntity);

            var accessToken = _authService.GenerateJwtToken(user);

            response.Success = true;
            response.Message = "Token refreshed successfully";
            response.Token = accessToken;
            response.RefreshToken = newRawToken;
            response.User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Name = user.Name,
                Role = user.Role
            };

            return response;
        }
    }
}
