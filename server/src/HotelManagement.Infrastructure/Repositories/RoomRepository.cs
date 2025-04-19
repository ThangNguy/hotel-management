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
    public class RoomRepository : IRoomRepository
    {
        private readonly ApplicationDbContext _context;

        public RoomRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Room>> GetAllAsync()
        {
            return await _context.Rooms.ToListAsync();
        }

        public async Task<Room> GetByIdAsync(int id)
        {
            return await _context.Rooms
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Room> AddAsync(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<Room> UpdateAsync(Room room)
        {
            _context.Entry(room).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var roomToDelete = await _context.Rooms.FindAsync(id);
            if (roomToDelete == null)
                return false;

            // Check if room has any bookings
            var hasBookings = await _context.Bookings.AnyAsync(b => b.RoomId == id);
            if (hasBookings)
                return false;

            _context.Rooms.Remove(roomToDelete);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RoomExistsAsync(int id)
        {
            return await _context.Rooms.AnyAsync(r => r.Id == id);
        }

        public async Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut)
        {
            // Get all rooms
            var allRooms = await _context.Rooms.ToListAsync();
            
            // Get IDs of rooms that have overlapping bookings
            var unavailableRoomIds = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled &&
                         ((checkIn >= b.CheckInDate && checkIn < b.CheckOutDate) ||
                          (checkOut > b.CheckInDate && checkOut <= b.CheckOutDate) ||
                          (checkIn <= b.CheckInDate && checkOut >= b.CheckOutDate)))
                .Select(b => b.RoomId)
                .Distinct()
                .ToListAsync();

            // Return only available rooms
            return allRooms.Where(r => r.Available && !unavailableRoomIds.Contains(r.Id)).ToList();
        }
    }
}