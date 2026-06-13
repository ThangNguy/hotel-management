namespace HotelManagement.Core.Interfaces
{
    public interface ITenantContext
    {
        int HotelId { get; }

        /// <summary>
        /// Platform-wide administrator that bypasses tenant scoping.
        /// Reserved for the "super_admin" role. Hotel-level "admin" users are NOT super admins.
        /// </summary>
        bool IsSuperAdmin { get; }
    }
}
