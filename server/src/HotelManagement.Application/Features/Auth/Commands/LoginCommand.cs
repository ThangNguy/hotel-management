using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;
using BCrypt.Net;

namespace HotelManagement.Application.Features.Auth.Commands
{
    public class LoginCommand : IRequest<AuthResponse>
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class AuthResponse : BaseResponse
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public UserDto User { get; set; }
    }

    public class LoginCommandValidator : AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(p => p.Username)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.");

            RuleFor(p => p.Password)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MinimumLength(6).WithMessage("{PropertyName} must be at least 6 characters.");
        }
    }

    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public LoginCommandHandler(
            IUserRepository userRepository, 
            IAuthService authService,
            IRefreshTokenRepository refreshTokenRepository)
        {
            _userRepository = userRepository;
            _authService = authService;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var response = new AuthResponse();

            // Check if user exists
            var user = await _userRepository.GetByUsernameAsync(request.Username);
            if (user == null)
            {
                response.Success = false;
                response.Message = "Invalid username or password";
                return response;
            }

            // Verify password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            if (!isPasswordValid)
            {
                response.Success = false;
                response.Message = "Invalid username or password";
                return response;
            }

            // Generate access token
            var accessToken = _authService.GenerateJwtToken(user);
            
            // Generate and save refresh token
            var refreshToken = _authService.GenerateRefreshToken("unknown");
            refreshToken.UserId = user.Id;
            await _refreshTokenRepository.AddAsync(refreshToken);

            response.Success = true;
            response.Message = "Login successful";
            response.Token = accessToken;
            response.RefreshToken = refreshToken.Token;
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