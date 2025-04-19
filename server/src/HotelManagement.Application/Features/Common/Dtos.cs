using System;
using System.Collections.Generic;

namespace HotelManagement.Application.Features.Common
{
    // Base DTOs for responses
    public class BaseResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }

    // DTO for room responses
    public class RoomDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public int Capacity { get; set; }
        public int Size { get; set; }
        public string Beds { get; set; }
        public List<string> Amenities { get; set; }
        public bool Available { get; set; }
        public List<string> Images { get; set; }
    }

    // DTO for booking responses
    public class BookingDto
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; }
        public string GuestName { get; set; }
        public string GuestEmail { get; set; }
        public string GuestPhone { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public int NumberOfGuests { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public string SpecialRequests { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // DTO for user responses
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
    }
}