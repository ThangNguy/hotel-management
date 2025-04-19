using HotelManagement.Core.Entities;

namespace HotelManagement.Core.Interfaces
{
    public interface IAuthService
    {
        string GenerateJwtToken(User user);
    }
}