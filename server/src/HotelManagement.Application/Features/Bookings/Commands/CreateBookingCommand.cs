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
    /// <summary>
    /// Public guest-booking command. HotelId is intentionally NOT bindable from the client —
    /// it is derived from the tenant context (resolved by domain). TotalPrice is recomputed
    /// server-side from the room's nightly rate and the number of nights. Status is forced to Pending.
    /// </summary>
    public class CreateBookingCommand : IRequest<BaseResponse>
    {
        public int RoomId { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhone { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public string SpecialRequests { get; set; }
    }

    public class CreateBookingCommandValidator : AbstractValidator<CreateBookingCommand>
    {
        public CreateBookingCommandValidator()
        {
            RuleFor(p => p.RoomId)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");

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
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.CheckOutDate)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(p => p.CheckInDate).WithMessage("{PropertyName} must be later than CheckInDate.");

            RuleFor(p => p.NumberOfGuests)
                .NotEmpty().WithMessage("{PropertyName} is required.")
                .GreaterThan(0).WithMessage("{PropertyName} must be greater than 0.");
        }
    }

    public class CreateBookingCommandHandler : IRequestHandler<CreateBookingCommand, BaseResponse>
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly ITenantContext _tenantContext;

        public CreateBookingCommandHandler(
            IBookingRepository bookingRepository,
            IRoomRepository roomRepository,
            ITenantContext tenantContext)
        {
            _bookingRepository = bookingRepository;
            _roomRepository = roomRepository;
            _tenantContext = tenantContext;
        }

        public async Task<BaseResponse> Handle(CreateBookingCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var hotelId = _tenantContext.HotelId;
            if (hotelId <= 0)
            {
                response.Success = false;
                response.Message = "Tenant could not be resolved for this request.";
                return response;
            }

            // GetByIdAsync respects the global query filter, so a room belonging to a
            // different tenant is invisible here even if the client guesses its id.
            var room = await _roomRepository.GetByIdAsync(request.RoomId);
            if (room == null || room.HotelId != hotelId)
            {
                response.Success = false;
                response.Message = "Room not found";
                return response;
            }

            if (!room.Available)
            {
                response.Success = false;
                response.Message = "Room is not available for booking.";
                return response;
            }

            if (request.NumberOfGuests > room.Capacity)
            {
                response.Success = false;
                response.Message = "Number of guests exceeds room capacity.";
                return response;
            }

            var isRoomAvailable = await _bookingRepository.IsRoomAvailableAsync(
                request.RoomId, request.CheckInDate, request.CheckOutDate);

            if (!isRoomAvailable)
            {
                response.Success = false;
                response.Message = "Room is not available for the selected dates";
                return response;
            }

            // Recompute TotalPrice server-side. Never trust client-supplied price.
            var nights = (int)Math.Ceiling((request.CheckOutDate.Date - request.CheckInDate.Date).TotalDays);
            if (nights < 1) nights = 1;
            var totalPrice = room.Price * nights;

            var booking = new Booking
            {
                HotelId = hotelId,
                RoomId = request.RoomId,
                GuestName = request.GuestName,
                GuestEmail = request.GuestEmail,
                GuestPhone = request.GuestPhone,
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                NumberOfGuests = request.NumberOfGuests,
                TotalPrice = totalPrice,
                SpecialRequests = request.SpecialRequests ?? string.Empty,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
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
