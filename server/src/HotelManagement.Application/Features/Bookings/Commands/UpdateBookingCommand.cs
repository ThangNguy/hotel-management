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
    public class UpdateBookingCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhone { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public decimal TotalPrice { get; set; }
        public string SpecialRequests { get; set; }
        public BookingStatus Status { get; set; }
    }

    public class UpdateBookingCommandValidator : AbstractValidator<UpdateBookingCommand>
    {
        public UpdateBookingCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");

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
                .NotEmpty().WithMessage("{PropertyName} is required.");

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

    public class UpdateBookingCommandHandler : IRequestHandler<UpdateBookingCommand, BaseResponse>
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IRoomRepository _roomRepository;

        public UpdateBookingCommandHandler(IBookingRepository bookingRepository, IRoomRepository roomRepository)
        {
            _bookingRepository = bookingRepository;
            _roomRepository = roomRepository;
        }

        public async Task<BaseResponse> Handle(UpdateBookingCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            // Check if booking exists
            var bookingToUpdate = await _bookingRepository.GetByIdAsync(request.Id);
            if (bookingToUpdate == null)
            {
                response.Success = false;
                response.Message = "Booking not found";
                return response;
            }

            // Check if room exists
            var roomExists = await _roomRepository.RoomExistsAsync(request.RoomId);
            if (!roomExists)
            {
                response.Success = false;
                response.Message = "Room not found";
                return response;
            }

            // Check if room is available for the requested dates, excluding the current booking
            var isRoomAvailable = await _bookingRepository.IsRoomAvailableAsync(
                request.RoomId, request.CheckInDate, request.CheckOutDate, request.Id);
                
            if (!isRoomAvailable)
            {
                response.Success = false;
                response.Message = "Room is not available for the selected dates";
                return response;
            }

            // Update properties
            bookingToUpdate.RoomId = request.RoomId;
            bookingToUpdate.GuestName = request.GuestName;
            bookingToUpdate.GuestEmail = request.GuestEmail;
            bookingToUpdate.GuestPhone = request.GuestPhone;
            bookingToUpdate.CheckInDate = request.CheckInDate;
            bookingToUpdate.CheckOutDate = request.CheckOutDate;
            bookingToUpdate.NumberOfGuests = request.NumberOfGuests;
            bookingToUpdate.TotalPrice = request.TotalPrice;
            bookingToUpdate.SpecialRequests = request.SpecialRequests;
            bookingToUpdate.Status = request.Status;

            var updatedBooking = await _bookingRepository.UpdateAsync(bookingToUpdate);

            if (updatedBooking != null)
            {
                response.Success = true;
                response.Message = "Booking updated successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to update booking";
                response.Errors.Add("An error occurred while updating the booking");
            }

            return response;
        }
    }
}