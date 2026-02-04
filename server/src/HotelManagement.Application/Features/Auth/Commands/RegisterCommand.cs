using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using MediatR;
using BCrypt.Net;

namespace HotelManagement.Application.Features.Auth.Commands
{
    /// <summary>
    /// Command for registering a new user
    /// </summary>
    public class RegisterCommand : IRequest<AuthResponse>
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
    }

    /// <summary>
    /// Validator for RegisterCommand
    /// </summary>
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(p => p.Username)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MinimumLength(3).WithMessage("{PropertyName} must be at least 3 characters.")
                .MaximumLength(50).WithMessage("{PropertyName} must not exceed 50 characters.")
                .Matches("^[a-zA-Z0-9_]+$").WithMessage("{PropertyName} can only contain letters, numbers, and underscores.");

            RuleFor(p => p.Password)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MinimumLength(6).WithMessage("{PropertyName} must be at least 6 characters.")
                .Matches("[A-Z]").WithMessage("{PropertyName} must contain at least one uppercase letter.")
                .Matches("[a-z]").WithMessage("{PropertyName} must contain at least one lowercase letter.")
                .Matches("[0-9]").WithMessage("{PropertyName} must contain at least one digit.");

            RuleFor(p => p.Name)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");
        }
    }

    /// <summary>
    /// Handler for RegisterCommand
    /// </summary>
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponse>
    {
        private readonly IUserRepository _userRepository;
        private readonly IAuthService _authService;
        private readonly IRefreshTokenRepository _refreshTokenRepository;

        public RegisterCommandHandler(
            IUserRepository userRepository, 
            IAuthService authService,
            IRefreshTokenRepository refreshTokenRepository)
        {
            _userRepository = userRepository;
            _authService = authService;
            _refreshTokenRepository = refreshTokenRepository;
        }

        public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            var response = new AuthResponse();

            // Check if username already exists
            if (await _userRepository.UsernameExistsAsync(request.Username))
            {
                response.Success = false;
                response.Message = "Username already exists";
                return response;
            }

            // Hash the password
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create new user
            var user = new User
            {
                Username = request.Username,
                Name = request.Name,
                PasswordHash = passwordHash,
                Role = "Guest", // Default role for new registrations
                CreatedAt = DateTime.Now
            };

            // Save user to database
            var createdUser = await _userRepository.AddAsync(user);

            // Generate access token
            var accessToken = _authService.GenerateJwtToken(createdUser);
            
            // Generate and save refresh token
            var refreshToken = _authService.GenerateRefreshToken("unknown");
            refreshToken.UserId = createdUser.Id;
            await _refreshTokenRepository.AddAsync(refreshToken);

            response.Success = true;
            response.Message = "Registration successful";
            response.Token = accessToken;
            response.RefreshToken = refreshToken.Token;
            response.User = new UserDto
            {
                Id = createdUser.Id,
                Username = createdUser.Username,
                Name = createdUser.Name,
                Role = createdUser.Role
            };

            return response;
        }
    }
}
