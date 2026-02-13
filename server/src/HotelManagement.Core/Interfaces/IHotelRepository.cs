using System.Threading.Tasks;
using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IHotelRepository
    {
        Task<Hotel> GetByIdAsync(int id);
        Task<Hotel> GetByDomainAsync(string domain);
    }
}
