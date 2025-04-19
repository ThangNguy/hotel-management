using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCollectionComparer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 4, 19, 12, 0, 0, 0, DateTimeKind.Unspecified), "$2a$11$KqVUEwsPI.nCIl.Km5p7V.jDPSYi46P6jZ6q9fFgzF08XoeJNYfda" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "PasswordHash" },
                values: new object[] { new DateTime(2025, 4, 19, 16, 18, 20, 252, DateTimeKind.Local).AddTicks(3546), "$2a$11$vvOm48W7il/bhPGZC/zkROOPzixAknoI56hPExzTQiH3vYAkDt/2W" });
        }
    }
}
