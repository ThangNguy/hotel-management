using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IRoomRepository
    {
        Task<IEnumerable<Room>> GetAllAsync();
        Task<Room> GetByIdAsync(int id);
        Task<Room> AddAsync(Room room);
        Task<Room> UpdateAsync(Room room);
        Task<bool> DeleteAsync(int id);
        Task<bool> RoomExistsAsync(int id);
        Task<IEnumerable<Room>> GetAvailableRoomsAsync(DateTime checkIn, DateTime checkOut);
    }
}