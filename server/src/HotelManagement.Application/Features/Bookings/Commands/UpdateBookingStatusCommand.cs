using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands
{
    public class UpdateBookingStatusCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
        public BookingStatus Status { get; set; }
    }

    public class UpdateBookingStatusCommandValidator : AbstractValidator<UpdateBookingStatusCommand>
    {
        public UpdateBookingStatusCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");

            RuleFor(p => p.Status)
                .IsInEnum().WithMessage("{PropertyName} has a range of values which does not include '{PropertyValue}'.");
        }
    }

    public class UpdateBookingStatusCommandHandler : IRequestHandler<UpdateBookingStatusCommand, BaseResponse>
    {
        private readonly IBookingRepository _bookingRepository;

        public UpdateBookingStatusCommandHandler(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<BaseResponse> Handle(UpdateBookingStatusCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var bookingExists = await _bookingRepository.BookingExistsAsync(request.Id);
            if (!bookingExists)
            {
                response.Success = false;
                response.Message = "Booking not found";
                return response;
            }

            var updatedBooking = await _bookingRepository.UpdateStatusAsync(request.Id, request.Status);

            if (updatedBooking != null)
            {
                response.Success = true;
                response.Message = $"Booking status updated to {request.Status} successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to update booking status";
                response.Errors.Add("An error occurred while updating the booking status");
            }

            return response;
        }
    }
}