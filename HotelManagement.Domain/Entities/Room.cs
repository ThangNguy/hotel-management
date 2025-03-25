namespace HotelManagement.Domain.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public string Number { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
