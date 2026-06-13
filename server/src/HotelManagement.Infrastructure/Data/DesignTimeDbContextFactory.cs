using System;
using HotelManagement.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace HotelManagement.Infrastructure.Data
{
    /// <summary>
    /// Used by `dotnet ef migrations` / `dotnet ef database update` at design time.
    /// Avoids requiring a fully-configured runtime so migrations can be scaffolded
    /// without a real connection string. The provider must match production (Npgsql).
    /// </summary>
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        static DesignTimeDbContextFactory()
        {
            // Match the runtime configuration so migrations emit `timestamp without time zone`
            // for plain DateTime properties, instead of requiring UTC `timestamptz`.
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
        }

        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            // Connection string is not used during scaffolding; the provider just needs to know
            // which SQL dialect to emit.
            optionsBuilder.UseNpgsql("Host=localhost;Database=design_time;Username=postgres;Password=postgres");

            return new ApplicationDbContext(optionsBuilder.Options, new DesignTimeTenantContext());
        }

        private sealed class DesignTimeTenantContext : ITenantContext
        {
            public int HotelId => 0;
            public bool IsSuperAdmin => true;
        }
    }
}
