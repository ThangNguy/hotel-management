using System;

namespace HotelManagement.Core.Entities
{
    public class Booking
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhone { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public decimal TotalPrice { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public string SpecialRequests { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property
        public Room Room { get; set; }
    }
}