using System;

namespace HotelManagement.Core.Interfaces
{
    public interface ITenantContext
    {
        int HotelId { get; }
        bool IsAdmin { get; }
    }
}
