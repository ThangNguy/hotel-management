using HotelManagement.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HotelManagement.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Room entity
            modelBuilder.Entity<Room>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.Property(e => e.Beds).IsRequired().HasMaxLength(100);
                
                // Configure list of strings for Amenities with value converter and comparer
                entity.Property(e => e.Amenities)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
                        new ValueComparer<List<string>>(
                            (c1, c2) => c1.SequenceEqual(c2),
                            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                            c => c.ToList()));
                
                // Configure list of strings for Images with value converter and comparer
                entity.Property(e => e.Images)
                    .HasConversion(
                        v => string.Join(',', v),
                        v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList(),
                        new ValueComparer<List<string>>(
                            (c1, c2) => c1.SequenceEqual(c2),
                            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                            c => c.ToList()));
            });

            // Configure Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.GuestName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.GuestEmail).IsRequired().HasMaxLength(100);
                entity.Property(e => e.GuestPhone).IsRequired().HasMaxLength(20);
                entity.Property(e => e.TotalPrice).HasColumnType("decimal(18,2)");
                entity.Property(e => e.SpecialRequests).HasMaxLength(500);

                // Configure relationship with Room
                entity.HasOne(e => e.Room)
                    .WithMany(r => r.Bookings)
                    .HasForeignKey(e => e.RoomId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).IsRequired().HasMaxLength(20);

                // Add unique constraint for username
                entity.HasIndex(e => e.Username).IsUnique();
            });

            // Seed initial admin user with fixed date and hash value
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Name = "Administrator",
                    // Use a hardcoded hash for "Admin@123" instead of generating a new one each time
                    PasswordHash = "$2a$11$jytGBLLdqQTgIh8htOjXzOx/QjXf2fFX/24bILVGUNdV.SOlV3ggy",
                    Role = "admin",
                    CreatedAt = new DateTime(2025, 4, 19, 12, 0, 0)
                }
            );
        }
    }
}