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

            // Global Query Filters for Multi-Tenancy.
            // Only the platform-level "super_admin" role bypasses the filter.
            // Per-tenant "admin" users are still scoped to their own HotelId.
            modelBuilder.Entity<User>().HasQueryFilter(e => _tenantContext.IsSuperAdmin || e.HotelId == _tenantContext.HotelId);
            modelBuilder.Entity<Room>().HasQueryFilter(e => _tenantContext.IsSuperAdmin || e.HotelId == _tenantContext.HotelId);
            modelBuilder.Entity<Booking>().HasQueryFilter(e => _tenantContext.IsSuperAdmin || e.HotelId == _tenantContext.HotelId);

            // Configure Hotel entity
            modelBuilder.Entity<Hotel>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Address).HasMaxLength(200);
                entity.Property(e => e.Domain).HasMaxLength(255);
                entity.HasIndex(e => e.Domain).IsUnique();
            });

            // Configure Room entity
            modelBuilder.Entity<Room>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.Price).HasPrecision(18, 2);
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
                entity.Property(e => e.TotalPrice).HasPrecision(18, 2);
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
                entity.Property(e => e.Token).IsRequired().HasMaxLength(200);
                entity.Property(e => e.CreatedByIp).HasMaxLength(50);
                entity.Property(e => e.ReplacedByToken).HasMaxLength(200);
                entity.Property(e => e.RevocationReason).HasMaxLength(100);
                
                // Configure relationship with User
                entity.HasOne(e => e.User)
                    .WithMany(u => u.RefreshTokens)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                // Add index for faster token lookup
                entity.HasIndex(e => e.Token);
            });

            // Initial Hotel and admin user are now provisioned by HotelManagement.DatabaseSeeder,
            // not via baked-in HasData seeds. This keeps password hashes out of migrations.
        }
    }
}