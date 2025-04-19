using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IBookingRepository
    {
        Task<IEnumerable<Booking>> GetAllAsync();
        Task<Booking> GetByIdAsync(int id);
        Task<IEnumerable<Booking>> GetRecentBookingsAsync(int count);
        Task<Booking> AddAsync(Booking booking);
        Task<Booking> UpdateAsync(Booking booking);
        Task<Booking> UpdateStatusAsync(int id, BookingStatus status);
        Task<bool> DeleteAsync(int id);
        Task<bool> BookingExistsAsync(int id);
        Task<bool> IsRoomAvailableAsync(int roomId, DateTime checkIn, DateTime checkOut, int? excludeBookingId = null);
    }
}