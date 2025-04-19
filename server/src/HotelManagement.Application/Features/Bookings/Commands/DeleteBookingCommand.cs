using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Commands
{
    public class DeleteBookingCommand : IRequest<BaseResponse>
    {
        public int Id { get; set; }
    }

    public class DeleteBookingCommandValidator : AbstractValidator<DeleteBookingCommand>
    {
        public DeleteBookingCommandValidator()
        {
            RuleFor(p => p.Id)
                .NotEmpty().WithMessage("{PropertyName} is required.");
        }
    }

    public class DeleteBookingCommandHandler : IRequestHandler<DeleteBookingCommand, BaseResponse>
    {
        private readonly IBookingRepository _bookingRepository;

        public DeleteBookingCommandHandler(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<BaseResponse> Handle(DeleteBookingCommand request, CancellationToken cancellationToken)
        {
            var response = new BaseResponse();

            var bookingExists = await _bookingRepository.BookingExistsAsync(request.Id);
            if (!bookingExists)
            {
                response.Success = false;
                response.Message = "Booking not found";
                return response;
            }

            var result = await _bookingRepository.DeleteAsync(request.Id);

            if (result)
            {
                response.Success = true;
                response.Message = "Booking deleted successfully";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to delete booking";
                response.Errors.Add("An error occurred while deleting the booking");
            }

            return response;
        }
    }
}