using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands
{
    public class CreateBookingCommand : IRequest<BaseResponse>
    {
        public int RoomId { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhone { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public decimal TotalPrice { get; set; }
        public string SpecialRequests { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
    }

    public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
    {
        public CreateBookingCommandValidator()
        {
            RuleFor(p => p.RoomId)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.GuestName)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");

            RuleFor(p => p.GuestEmail)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .EmailAddress().WithMessage("{PropertyName} must be a valid email address.")
                .MaximumLength(100).WithMessage("{PropertyName} must not exceed 100 characters.");

            RuleFor(p => p.GuestPhone)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .MaximumLength(20).WithMessage("{PropertyName} must not exceed 20 characters.");

            RuleFor(p => p.CheckInDate)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThanOrEqualTo(DateTime.Today).WithMessage("{PropertyName} must be today or later.");

            RuleFor(p => p.CheckOutDate)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(p => p.CheckInDate).WithMessage("{PropertyName} must be later than CheckInDate.");

            RuleFor(p => p.NumberOfGuests)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");

            RuleFor(p => p.TotalPrice)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");
        }
    }

    public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BaseResponse>
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IRoomRepository _roomRepository;

        public CreateBookingCommandHandler(IBookingRepository bookingRepository, IRoomRepository roomRepository)
        {
            _bookingRepository = bookingRepository;
            _roomRepository = roomRepository;
        }

        public async Task<BaseResponse> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            // Check if room exists
            var roomExists = await _roomRepository.RoomExistsAsync(request.RoomId);
            if (!roomExists)
            {
                response.Success = false;
                response.Message = "Room not found";
                return response;
            }

            // Check if room is available for the requested dates
            var isRoomAvailable = await _bookingRepository.IsRoomAvailableAsync(
                request.RoomId, request.CheckInDate, request.CheckOutDate);
                
            if (!isRoomAvailable)
            {
                response.Success = false;
                response.Message = "Room is not available for the selected dates";
                return response;
            }

            var booking = new Booking
            {
                RoomId = request.RoomId,
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                GuestPhone = request.GuestPhone,
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                NumberOfGuests = request.NumberOfGuests,
                TotalPrice = request.TotalPrice,
                SpecialRequests = request.SpecialRequests,
                Status = request.Status,
                CreatedAt = DateTime.Now
            };

            var createdBooking = await _bookingRepository.AddAsync(booking);

            if (createdBooking != null)
            {
                response.Success = true;
                response.Message = "Booking created successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to create booking";
                response.Errors.Add("An error occurred while creating the booking");
            }

            return response;
        }
    }
}