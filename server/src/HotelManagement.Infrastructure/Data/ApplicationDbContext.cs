using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;

namespace HotelManagement.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        private readonly ITenantContext _tenantContext;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantContext tenantContext) : base(options)
        {
            _tenantContext = tenantContext;
        }

        public DbSet<Hotel> Hotels { get; set; }

        public DbSet<Room> Rooms { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<HotelManagement.Core.Entities.Room>())
            {
                if (entry.State == EntityState.Added && entry.Entity.HotelId == 0)
                {
                    entry.Entity.HotelId = _tenantContext.HotelId;
                }
            }
            
            foreach (var entry in ChangeTracker.Entries<HotelManagement.Core.Entities.Booking>())
            {
                if (entry.State == EntityState.Added && entry.Entity.HotelId == 0)
                {
                    entry.Entity.HotelId = _tenantContext.HotelId;
                }
            }
            
            foreach (var entry in ChangeTracker.Entries<HotelManagement.Core.Entities.User>())
            {
                if (entry.State == EntityState.Added && entry.Entity.HotelId == 0)
                {
                    entry.Entity.HotelId = _tenantContext.HotelId;
                }
            }

            return await base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Global Query Filters for Multi-Tenancy
            // Allow Admins to see all data, otherwise filter by HotelId
            modelBuilder.Entity<User>().HasQueryFilter(e => _tenantContext.IsAdmin || e.HotelId == _tenantContext.HotelId);
            modelBuilder.Entity<Room>().HasQueryFilter(e => _tenantContext.IsAdmin || e.HotelId == _tenantContext.HotelId);
            modelBuilder.Entity<Booking>().HasQueryFilter(e => _tenantContext.IsAdmin || e.HotelId == _tenantContext.HotelId);

            // Configure Hotel entity
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
            });

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

                // Configure relationship with Hotel
                entity.HasOne(e => e.Hotel)
                    .WithMany(h => h.Bookings)
                    .HasForeignKey(e => e.HotelId)
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

                // Configure relationship with Hotel
                entity.HasOne(e => e.Hotel)
                    .WithMany(h => h.Users)
                    .HasForeignKey(e => e.HotelId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
            
            // Configure RefreshToken entity
            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Token).IsRequired();
                entity.Property(e => e.CreatedByIp).HasMaxLength(50);
                entity.Property(e => e.ReplacedByToken).HasMaxLength(500);
                
                // Configure relationship with User
                entity.HasOne(e => e.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Add index for faster token lookup
                entity.HasIndex(e => e.Token);
            });

            // Seed initial admin user with fixed date and hash value
            // Note: Data seeding might need adjustment for multi-tenancy as HotelId is required
            modelBuilder.Entity<Hotel>().HasData(
                new Hotel
                {
                    Id = 1,
                    Name = "Default Hotel",
                    Address = "123 Main St",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 4, 19, 12, 0, 0)
                }
            );

            // Ensure Admin user belongs to Default Hotel
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Name = "Administrator",
                    // Use a hardcoded hash for "Admin@123" instead of generating a new one each time
                    PasswordHash = "$2a$11$jytGBLLdqQTgIh8htOjXzOx/QjXf2fFX/24bILVGUNdV.SOlV3ggy",
                    Role = "admin",
                    HotelId = 1,
                    CreatedAt = new DateTime(2025, 4, 19, 12, 0, 0)
                }
            );
        }
    }
}