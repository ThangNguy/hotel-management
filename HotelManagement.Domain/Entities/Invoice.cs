namespace HotelManagement.Domain.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public Booking Booking { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public decimal Amount { get; set; }
    }
}
