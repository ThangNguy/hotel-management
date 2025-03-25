namespace HotelManagement.Domain.Entities
{
    public class Booking
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public Room Room { get; set; } = null!;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public decimal TotalPrice { get; set; }

        public int? DiscountId { get; set; }
        public Discount? Discount { get; set; }
    }
}
