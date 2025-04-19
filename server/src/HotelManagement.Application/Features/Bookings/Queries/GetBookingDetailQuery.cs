using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Queries
{
    public class GetBookingDetailQuery : IRequest<BookingDto>
    {
        public int Id { get; set; }
    }

    public class GetBookingDetailQueryHandler : IRequestHandler<GetBookingDetailQuery, BookingDto>
    {
        private readonly IBookingRepository _bookingRepository;

        public GetBookingDetailQueryHandler(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<BookingDto> Handle(GetBookingDetailQuery request, CancellationToken cancellationToken)
        {
            var booking = await _bookingRepository.GetByIdAsync(request.Id);
            
            if (booking == null)
                return null;

            return new BookingDto
            {
                Id = booking.Id,
                RoomId = booking.RoomId,
                RoomName = booking.Room?.Name ?? "Unknown",
                GuestName = booking.GuestName,
                GuestEmail = booking.GuestEmail,
                GuestPhone = booking.GuestPhone,
                CheckInDate = booking.CheckInDate,
                CheckOutDate = booking.CheckOutDate,
                NumberOfGuests = booking.NumberOfGuests,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString(),
                SpecialRequests = booking.SpecialRequests,
                CreatedAt = booking.CreatedAt
            };
        }
    }
}