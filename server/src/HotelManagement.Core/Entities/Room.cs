using System;
using System.Collections.Generic;

namespace HotelManagement.Core.Entities
{
    public class Room
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Capacity { get; set; }
        public int Size { get; set; }
        public string Beds { get; set; }
        public List<string> Amenities { get; set; } = new List<string>();
        public bool Available { get; set; } = true;
        public List<string> Images { get; set; } = new List<string>();
        
        // Navigation properties
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}