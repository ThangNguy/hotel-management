using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Auth.Commands
{
    /// <summary>
    /// Command for refreshing an access token using a refresh token
    /// </summary>
    public class RefreshTokenCommand : IRequest<AuthResponse>
    {
        public string RefreshToken { get; set; }
    }

    /// <summary>
    /// Validator for RefreshTokenCommand
    /// </summary>
    public class RefreshTokenCommandValidator : AbstractValidator<RefreshTokenCommand>
    {
        public RefreshTokenCommandValidator()
        {
            RuleFor(p => p.RefreshToken)
                .NotEmpty().WithMessage("Refresh token is required.");
        }
    }

    /// <summary>
    /// Handler for RefreshTokenCommand
    /// </summary>
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

            // Find the refresh token
            var refreshToken = await _refreshTokenRepository.GetByTokenAsync(request.RefreshToken);

            if (refreshToken == null)
            {
                response.Success = false;
                response.Message = "Invalid refresh token";
                return response;
            }

            // Check if token is active
            if (!refreshToken.IsActive)
            {
                response.Success = false;
                response.Message = refreshToken.IsExpired ? "Refresh token has expired" : "Refresh token has been revoked";
                return response;
            }

            var user = refreshToken.User;

            // Revoke the old refresh token
            refreshToken.RevokedAt = DateTime.Now;

            // Generate new refresh token (rotation)
            var newRefreshToken = _authService.GenerateRefreshToken(refreshToken.CreatedByIp);
            newRefreshToken.UserId = user.Id;
            refreshToken.ReplacedByToken = newRefreshToken.Token;

            // Update old token and add new one
            await _refreshTokenRepository.UpdateAsync(refreshToken);
            await _refreshTokenRepository.AddAsync(newRefreshToken);

            // Generate new access token
            var accessToken = _authService.GenerateJwtToken(user);

            response.Success = true;
            response.Message = "Token refreshed successfully";
            response.Token = accessToken;
            response.RefreshToken = newRefreshToken.Token;
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
