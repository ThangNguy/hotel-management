using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using BC = BCrypt.Net.BCrypt;

namespace HotelManagement.DatabaseSeeder
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Starting Hotel Management Database Seeder...");
            
            // Create services with database context
            var services = new ServiceCollection();
            
            // Use the connection string from appsettings.json
            string connectionString = "Server=localhost;Database=HotelManagement;User Id=sa;Password=123456;TrustServerCertificate=True;Trusted_Connection=True;MultipleActiveResultSets=true;";
            
            // Register database context
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));
            
            var serviceProvider = services.BuildServiceProvider();
            
            using (var scope = serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                Console.WriteLine("Connecting to database...");
                
                try
                {
                    // Ensure database is created
                    await dbContext.Database.EnsureCreatedAsync();
                    
                    Console.WriteLine("Database connection successful!");
                    
                    // Clear existing data first if needed
                    await ClearExistingData(dbContext);
                    
                    // Seed users if they don't exist already
                    await SeedUsers(dbContext);
                    
                    // Seed rooms
                    await SeedRooms(dbContext);
                    
                    // Seed bookings
                    await SeedBookings(dbContext);
                    
                    Console.WriteLine("Database seeding completed successfully!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred while seeding the database: {ex.Message}");
                    Console.WriteLine(ex.StackTrace);
                }
            }
            
            Console.WriteLine("Press any key to exit...");
            Console.ReadKey();
        }
        
        private static async Task ClearExistingData(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Clearing existing data...");
            
            // Remove bookings first (because of foreign key constraints)
            if (await dbContext.Bookings.AnyAsync())
            {
                dbContext.Bookings.RemoveRange(await dbContext.Bookings.ToListAsync());
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Existing bookings cleared.");
            }
            
            // Remove rooms
            if (await dbContext.Rooms.AnyAsync())
            {
                dbContext.Rooms.RemoveRange(await dbContext.Rooms.ToListAsync());
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Existing rooms cleared.");
            }
            
            // We're intentionally NOT clearing users here to preserve any existing users
            Console.WriteLine("Data clearing completed.");
        }
        
        private static async Task SeedUsers(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Checking for existing users...");
            
            if (!await dbContext.Users.AnyAsync())
            {
                Console.WriteLine("Seeding users...");
                
                var users = new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        Name = "Admin User",
                        PasswordHash = BC.HashPassword("Admin@123"),
                        Role = "Admin",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "staff1",
                        Name = "Staff Member 1",
                        PasswordHash = BC.HashPassword("Staff@123"),
                        Role = "Staff",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "guest1",
                        Name = "John Doe",
                        PasswordHash = BC.HashPassword("Guest@123"),
                        Role = "Guest",
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "guest2",
                        Name = "Jane Smith",
                        PasswordHash = BC.HashPassword("Guest@123"),
                        Role = "Guest",
                        CreatedAt = DateTime.Now
                    }
                };
                
                await dbContext.Users.AddRangeAsync(users);
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Users seeded successfully.");
            }
            else
            {
                Console.WriteLine("Users already exist, skipping user seeding.");
            }
        }
        
        private static async Task SeedRooms(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Seeding rooms...");
            
            var rooms = new List<Room>
            {
                new Room
                {
                    Name = "Deluxe Room",
                    Description = "Spacious room with city view",
                    Price = 150.00m,
                    Capacity = 2,
                    Size = 35,
                    Beds = "1 King",
                    Amenities = new List<string> { "WIFI", "AIR_CONDITIONING", "FLAT_SCREEN_TV", "MINIBAR", "SAFE" },
                    Available = true,
                    Images = new List<string> { "/assets/images/rooms/deluxe-1.jpg", "/assets/images/rooms/deluxe-2.jpg" }
                },
                new Room
                {
                    Name = "Superior Room",
                    Description = "Elegant room with garden view",
                    Price = 200.00m,
                    Capacity = 2,
                    Size = 40,
                    Beds = "1 King",
                    Amenities = new List<string> { "WIFI", "AIR_CONDITIONING", "FLAT_SCREEN_TV", "MINIBAR", "SAFE", "COFFEE_MACHINE", "MARBLE_BATHROOM" },
                    Available = true,
                    Images = new List<string> { "/assets/images/rooms/superior-1.jpg", "/assets/images/rooms/superior-2.jpg" }
                },
                new Room
                {
                    Name = "Family Room",
                    Description = "Comfortable room for families",
                    Price = 250.00m,
                    Capacity = 4,
                    Size = 55,
                    Beds = "2 Queen",
                    Amenities = new List<string> { "WIFI", "AIR_CONDITIONING", "FLAT_SCREEN_TV", "MINIBAR", "SAFE", "COFFEE_MACHINE", "BATHTUB" },
                    Available = true,
                    Images = new List<string> { "/assets/images/rooms/family-1.jpg", "/assets/images/rooms/family-2.jpg" }
                },
                new Room
                {
                    Name = "Executive Suite",
                    Description = "Luxurious suite with separate living area",
                    Price = 350.00m,
                    Capacity = 2,
                    Size = 70,
                    Beds = "1 King",
                    Amenities = new List<string> { "WIFI", "AIR_CONDITIONING", "FLAT_SCREEN_TV", "MINIBAR", "SAFE", "COFFEE_MACHINE", "MARBLE_BATHROOM", "BATHTUB", "LIVING_ROOM", "DESK" },
                    Available = true,
                    Images = new List<string> { "/assets/images/rooms/executive-1.jpg", "/assets/images/rooms/executive-2.jpg" }
                },
                new Room
                {
                    Name = "Presidential Suite",
                    Description = "Our finest accommodation with panoramic views",
                    Price = 600.00m,
                    Capacity = 4,
                    Size = 120,
                    Beds = "1 King",
                    Amenities = new List<string> { "WIFI", "AIR_CONDITIONING", "FLAT_SCREEN_TV", "MINIBAR", "SAFE", "COFFEE_MACHINE", "MARBLE_BATHROOM", "BATHTUB", "LIVING_ROOM", "DESK", "DINING_ROOM", "BUTLER", "BALCONY" },
                    Available = true,
                    Images = new List<string> { "/assets/images/rooms/presidential-1.jpg", "/assets/images/rooms/presidential-2.jpg" }
                }
            };
            
            await dbContext.Rooms.AddRangeAsync(rooms);
            await dbContext.SaveChangesAsync();
            Console.WriteLine("Rooms seeded successfully.");
        }
        
        private static async Task SeedBookings(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Seeding bookings...");
            
            var rooms = await dbContext.Rooms.ToListAsync();
            
            var bookings = new List<Booking>
            {
                new Booking
                {
                    RoomId = rooms[0].Id, // Deluxe Room
                    GuestName = "John Doe",
                    GuestEmail = "john.doe@example.com",
                    GuestPhone = "+1-555-123-4567",
                    CheckInDate = DateTime.Now.AddDays(5),
                    CheckOutDate = DateTime.Now.AddDays(8),
                    NumberOfGuests = 2,
                    TotalPrice = rooms[0].Price * 3, // 3 nights
                    Status = BookingStatus.Confirmed,
                    SpecialRequests = "Early check-in if possible",
                    CreatedAt = DateTime.Now.AddDays(-2)
                },
                new Booking
                {
                    RoomId = rooms[1].Id, // Superior Room
                    GuestName = "Jane Smith",
                    GuestEmail = "jane.smith@example.com",
                    GuestPhone = "+1-555-987-6543",
                    CheckInDate = DateTime.Now.AddDays(-2),
                    CheckOutDate = DateTime.Now.AddDays(1),
                    NumberOfGuests = 2,
                    TotalPrice = rooms[1].Price * 3, // 3 nights
                    Status = BookingStatus.CheckedIn,
                    SpecialRequests = "Non-smoking room",
                    CreatedAt = DateTime.Now.AddDays(-5)
                },
                new Booking
                {
                    RoomId = rooms[2].Id, // Family Room
                    GuestName = "Robert Johnson",
                    GuestEmail = "robert.johnson@example.com",
                    GuestPhone = "+1-555-456-7890",
                    CheckInDate = DateTime.Now.AddDays(-7),
                    CheckOutDate = DateTime.Now.AddDays(-3),
                    NumberOfGuests = 4,
                    TotalPrice = rooms[2].Price * 4, // 4 nights
                    Status = BookingStatus.CheckedOut,
                    SpecialRequests = "Extra pillows",
                    CreatedAt = DateTime.Now.AddDays(-10)
                },
                new Booking
                {
                    RoomId = rooms[3].Id, // Executive Suite
                    GuestName = "Michael Brown",
                    GuestEmail = "michael.brown@example.com",
                    GuestPhone = "+1-555-789-0123",
                    CheckInDate = DateTime.Now.AddDays(10),
                    CheckOutDate = DateTime.Now.AddDays(15),
                    NumberOfGuests = 2,
                    TotalPrice = rooms[3].Price * 5, // 5 nights
                    Status = BookingStatus.Pending,
                    SpecialRequests = "Airport transfer",
                    CreatedAt = DateTime.Now.AddDays(-1)
                },
                new Booking
                {
                    RoomId = rooms[4].Id, // Presidential Suite
                    GuestName = "Emma Davis",
                    GuestEmail = "emma.davis@example.com",
                    GuestPhone = "+1-555-234-5678",
                    CheckInDate = DateTime.Now.AddDays(20),
                    CheckOutDate = DateTime.Now.AddDays(25),
                    NumberOfGuests = 2,
                    TotalPrice = rooms[4].Price * 5, // 5 nights
                    Status = BookingStatus.Confirmed,
                    SpecialRequests = "Champagne upon arrival",
                    CreatedAt = DateTime.Now.AddDays(-3)
                },
                new Booking
                {
                    RoomId = rooms[0].Id, // Deluxe Room
                    GuestName = "David Wilson",
                    GuestEmail = "david.wilson@example.com",
                    GuestPhone = "+1-555-345-6789",
                    CheckInDate = DateTime.Now.AddDays(-10),
                    CheckOutDate = DateTime.Now.AddDays(-7),
                    NumberOfGuests = 1,
                    TotalPrice = rooms[0].Price * 3, // 3 nights
                    Status = BookingStatus.CheckedOut,
                    SpecialRequests = "",
                    CreatedAt = DateTime.Now.AddDays(-15)
                }
            };
            
            await dbContext.Bookings.AddRangeAsync(bookings);
            await dbContext.SaveChangesAsync();
            Console.WriteLine("Bookings seeded successfully.");
        }
    }
}
