using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Core.Entities;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Services;
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
            
            // Register Mock TenantContext for Seeder (Admin access)
            services.AddScoped<ITenantContext, SeederTenantContext>();
            
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
                    // await ClearExistingData(dbContext); // Crashing, so we skip and update instead
                    
                    // Seed hotels
                    await SeedHotels(dbContext);

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
            if (await dbContext.Bookings.IgnoreQueryFilters().AnyAsync())
            {
                dbContext.Bookings.RemoveRange(await dbContext.Bookings.IgnoreQueryFilters().ToListAsync());
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Existing bookings cleared.");
            }
            
            // Remove rooms
            if (await dbContext.Rooms.IgnoreQueryFilters().AnyAsync())
            {
                dbContext.Rooms.RemoveRange(await dbContext.Rooms.IgnoreQueryFilters().ToListAsync());
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Existing rooms cleared.");
            }
            
            // We're intentionally NOT clearing users here to preserve any existing users
            Console.WriteLine("Data clearing completed.");
        }
        
        private static async Task SeedHotels(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Checking for existing hotels...");
            
            if (!await dbContext.Hotels.IgnoreQueryFilters().AnyAsync())
            {
                Console.WriteLine("Seeding hotels...");
                
                var hotels = new List<Hotel>
                {
                    new Hotel
                    {
                        // Id = 1, // Let Identity handle it or try to force if needed. With EF Core seeding we often force.
                        // But for manual seeding, Identity is usually on.
                        // Let's assume Identity is on (1,1). First insert gets 1.
                        Name = "Default Hotel",
                        Address = "123 Main St",
                        IsActive = true,
                        CreatedAt = DateTime.Now
                    }
                };
                
                await dbContext.Hotels.AddRangeAsync(hotels);
                await dbContext.SaveChangesAsync();
                
                // If we rely on Id=1, we should check what ID we got.
                var hotel = await dbContext.Hotels.FirstAsync();
                Console.WriteLine($"Hotel seeded with ID: {hotel.Id}");
                
                if (hotel.Id != 1)
                {
                    Console.WriteLine("WARNING: Hotel ID is not 1. Subsequent seeding might fail or need adjustment.");
                    // For now, assuming fresh DB, it should be 1.
                }
            }

            else
            {
                var hotel = await dbContext.Hotels.IgnoreQueryFilters().FirstOrDefaultAsync();
                Console.WriteLine($"Hotels already exist. First Hotel ID: {hotel?.Id}");
            }
        }

        private static async Task SeedUsers(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Checking for existing users...");
            
            var admin = await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Username == "admin");
            if (admin != null)
            {
                Console.WriteLine($"Found admin user. HotelId: {admin.HotelId}");
                Console.WriteLine("Updating admin user...");
                admin.PasswordHash = BC.HashPassword("Admin@123");
                admin.Role = "admin"; // Ensure lowercase "admin" or match Role logic
                // HotelId is already 1 from migration
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Admin updated.");
            }

            var testUser = await dbContext.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Username == "testuser_verif");
            if (testUser != null)
            {
                Console.WriteLine("Updating testuser_verif...");
                testUser.Role = "admin";
                await dbContext.SaveChangesAsync();
                Console.WriteLine("Test User updated to Admin.");
            }
            
            if (!await dbContext.Users.IgnoreQueryFilters().AnyAsync())
            {
                var hotelId = (await dbContext.Hotels.IgnoreQueryFilters().FirstOrDefaultAsync())?.Id ?? 0;
                if (hotelId == 0)
                {
                    Console.WriteLine("ERROR: No hotel found to assign users to.");
                    return;
                }

                Console.WriteLine($"Seeding users for Hotel ID: {hotelId}...");
                
                var users = new List<User>
                {
                    new User
                    {
                        Username = "admin",
                        Name = "Admin User",
                        PasswordHash = BC.HashPassword("Admin@123"),
                        Role = "admin",
                        HotelId = hotelId,
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "staff1",
                        Name = "Staff Member 1",
                        PasswordHash = BC.HashPassword("Staff@123"),
                        Role = "Staff",
                        HotelId = hotelId,
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "guest1",
                        Name = "John Doe",
                        PasswordHash = BC.HashPassword("Guest@123"),
                        Role = "Guest",
                        HotelId = hotelId,
                        CreatedAt = DateTime.Now
                    },
                    new User
                    {
                        Username = "guest2",
                        Name = "Jane Smith",
                        PasswordHash = BC.HashPassword("Guest@123"),
                        Role = "Guest",
                        HotelId = hotelId,
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

            var hotelId = (await dbContext.Hotels.IgnoreQueryFilters().FirstOrDefaultAsync())?.Id ?? 0;
            if (hotelId == 0) return;
            
            var rooms = new List<Room>
            {
                new Room
                {
                    Name = "Deluxe King",
                    Description = "A spacious 35m² retreat featuring a plush king-sized bed, modern amenities, and a stunning city view. Perfect for couples or business travelers seeking comfort and style.",
                    Price = 180.00m,
                    Capacity = 2,
                    Size = 35,
                    Beds = "1 King Bed",
                    Amenities = new List<string> { "Free Wi-Fi", "Air Conditioning", "50\" Flat Screen TV", "Mini Bar", "Work Desk" },
                    Available = true,
                    HotelId = hotelId,
                    Images = new List<string> { "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop" }
                },
                new Room
                {
                    Name = "Superior Twin",
                    Description = "Designed for friends or family, this 40m² room offers two comfortable twin beds and a relaxing garden view. Enjoy a blend of elegance and functionality.",
                    Price = 220.00m,
                    Capacity = 2,
                    Size = 40,
                    Beds = "2 Twin Beds",
                    Amenities = new List<string> { "Free Wi-Fi", "Balcony", "Coffee Maker", "Rain Shower", "Safe" },
                    Available = true,
                    HotelId = hotelId,
                    Images = new List<string> { "https://images.unsplash.com/photo-1590490360182-f33efe29a79d?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop" }
                },
                new Room
                {
                    Name = "Family Suite",
                    Description = "Experience home away from home in our 60m² Family Suite. Features a master bedroom, a separate living area with a sofa bed, and plenty of space for everyone.",
                    Price = 350.00m,
                    Capacity = 4,
                    Size = 60,
                    Beds = "1 King + 1 Soda Bed",
                    Amenities = new List<string> { "Kitchenette", "Living Area", "2 TVs", "Bathtub", "High-speed Wi-Fi" },
                    Available = true,
                    HotelId = hotelId,
                    Images = new List<string> { "https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop" }
                },
                new Room
                {
                    Name = "Executive Studio",
                    Description = "Tailored for the modern executive. This 45m² studio combines a productive workspace with a luxurious sleeping area and exclusive lounge access.",
                    Price = 290.00m,
                    Capacity = 2,
                    Size = 45,
                    Beds = "1 Queen Bed",
                    Amenities = new List<string> { "Lounge Access", "Premium Sound System", "Espresso Machine", "Ironing Facilities", "Smart TV" },
                    Available = true,
                    HotelId = hotelId,
                    Images = new List<string> { "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1590490360182-f33efe29a79d?q=80&w=1000&auto=format&fit=crop" }
                },
                new Room
                {
                    Name = "Oceanfront Villa",
                    Description = "Indulge in ultimate luxury with our 120m² Oceanfront Villa. Private pool, direct beach access, and personalized butler service for an unforgettable stay.",
                    Price = 850.00m,
                    Capacity = 4,
                    Size = 120,
                    Beds = "2 King Beds",
                    Amenities = new List<string> { "Private Pool", "Butler Service", "Jacuzzi", "Ocean View", "Private Terrace" },
                    Available = true,
                    HotelId = hotelId,
                    Images = new List<string> { "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1000&auto=format&fit=crop", "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000&auto=format&fit=crop" }
                }
            };
            
            await dbContext.Rooms.AddRangeAsync(rooms);
            await dbContext.SaveChangesAsync();
            Console.WriteLine("Rooms seeded successfully.");
        }
        
        private static async Task SeedBookings(ApplicationDbContext dbContext)
        {
            Console.WriteLine("Seeding bookings...");
            
            var hotelId = (await dbContext.Hotels.IgnoreQueryFilters().FirstOrDefaultAsync())?.Id ?? 0;
            if (hotelId == 0) return;

            var rooms = await dbContext.Rooms.IgnoreQueryFilters().ToListAsync();
            
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
                    HotelId = hotelId,
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
                    HotelId = hotelId,
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
                    HotelId = hotelId,
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
                    HotelId = hotelId,
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
                    HotelId = hotelId,
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
                    HotelId = hotelId,
                    CreatedAt = DateTime.Now.AddDays(-15)
                }
            };
            
            await dbContext.Bookings.AddRangeAsync(bookings);
            await dbContext.SaveChangesAsync();
            Console.WriteLine("Bookings seeded successfully.");
        }
    }

    public class SeederTenantContext : ITenantContext
    {
        public int HotelId => 0; // Admin sees all data or bypasses filter
        public bool IsAdmin => true;
    }
}
