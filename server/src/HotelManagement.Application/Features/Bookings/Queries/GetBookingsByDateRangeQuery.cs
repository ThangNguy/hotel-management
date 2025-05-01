using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Bookings.Queries
{
    public class GetBookingsByDateRangeQuery : IRequest<List<BookingDto>>
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }

    public class GetBookingsByDateRangeQueryHandler : IRequestHandler<GetBookingsByDateRangeQuery, List<BookingDto>>
    {
        private readonly IBookingRepository _bookingRepository;

        public GetBookingsByDateRangeQueryHandler(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<List<BookingDto>> Handle(GetBookingsByDateRangeQuery request, CancellationToken cancellationToken)
        {
            // Get all bookings
            var allBookings = await _bookingRepository.GetAllAsync();
            
            // Filter bookings that overlap with the given date range
            // A booking overlaps if its check-out date is after the start date AND
            // its check-in date is before the end date
            var bookings = allBookings
                .Where(b => b.CheckOutDate > request.StartDate && b.CheckInDate < request.EndDate)
                .OrderBy(b => b.CheckInDate)
                .ThenBy(b => b.RoomId);

            // Map to BookingDto manually instead of using AutoMapper
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
