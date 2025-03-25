using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence
{
    public class HotelDbContext : DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options) : base(options) { }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Discount> Discounts { get; set; }
        public DbSet<Invoice> Invoices { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Room>()
                .HasMany(r => r.Bookings)
                .WithOne(b => b.Room)
                .HasForeignKey(b => b.RoomId);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Discount)
                .WithMany()
                .HasForeignKey(b => b.DiscountId);
        }
    }
}
