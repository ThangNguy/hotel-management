using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;

        public BookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .ToListAsync();
        }

        public async Task<Booking> GetByIdAsync(int id)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<IEnumerable<Booking>> GetRecentBookingsAsync(int count)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .OrderByDescending(b => b.CreatedAt)
                .Take(count)
                .ToListAsync();
        }

        public async Task<Booking> AddAsync(Booking booking)
        {
            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking> UpdateAsync(Booking booking)
        {
            _context.Entry(booking).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Booking> UpdateStatusAsync(int id, BookingStatus status)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
                return null;

            booking.Status = status;
            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var bookingToDelete = await _context.Bookings.FindAsync(id);
            if (bookingToDelete == null)
                return false;

            _context.Bookings.Remove(bookingToDelete);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> BookingExistsAsync(int id)
        {
            return await _context.Bookings.AnyAsync(b => b.Id == id);
        }

        public async Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut, int? excludeBookingId = null)
        {
            var query = _context.Bookings
                .Where(b => b.RoomId == roomId && b.Status != BookingStatus.Cancelled);

            // Exclude the current booking if we're updating
            if (excludeBookingId.HasValue)
            {
                query = query.Where(b => b.Id != excludeBookingId.Value);
            }

            // Check for overlapping bookings
            var overlappingBookings = await query.AnyAsync(b =>
                (checkIn >= b.CheckInDate && checkIn < b.CheckOutDate) ||
                (checkOut > b.CheckInDate && checkOut <= b.CheckOutDate) ||
                (checkIn <= b.CheckInDate && checkOut >= b.CheckOutDate));

            // Room is available if there are no overlapping bookings
            return !overlappingBookings;
        }
    }
}