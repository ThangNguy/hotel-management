using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Queries
{
    public class GetRecentBookingsQuery : IRequest<List<BookingDto>>
    {
        public int Count { get; set; } = 5; // Default to 5 recent bookings
    }

    public class GetRecentBookingsQueryHandler : IRequestHandler<GetRecentBookingsQuery, List<BookingDto>>
    {
        private readonly IBookingRepository _bookingRepository;

        public GetRecentBookingsQueryHandler(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<List<BookingDto>> Handle(GetRecentBookingsQuery request, CancellationToken cancellationToken)
        {
            var bookings = await _bookingRepository.GetRecentBookingsAsync(request.Count);
            
            return bookings.Select(booking => new BookingDto
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
            }).ToList();
        }
    }
}