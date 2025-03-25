namespace HotelManagement.Domain.Entities
{
    public class Discount
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public bool IsPercentage { get; set; }
    }
}
