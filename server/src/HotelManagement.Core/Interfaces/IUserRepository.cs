using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IUserRepository
    {
        Task<User> GetByIdAsync(int id);
        Task<User> GetByUsernameAsync(string username);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> AddAsync(User user);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
        Task<bool> UserExistsAsync(int id);
        Task<bool> UsernameExistsAsync(string username);
    }
}