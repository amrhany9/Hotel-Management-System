using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelManagement.Infrastructure.Persistence.Migrations
{
    public partial class GuestsPaymentsRolesAndStayStatuses : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Role",
                table: "Users",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "FrontDesk");

            migrationBuilder.Sql("UPDATE Users SET Role = 'Admin' WHERE Email = 'admin@hotel.local';");

            migrationBuilder.CreateTable(
                name: "Guests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    IdNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Guests", x => x.Id);
                });

            migrationBuilder.AddColumn<int>(
                name: "GuestId",
                table: "Reservations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "NightlyRate",
                table: "Reservations",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Reservations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckedInAt",
                table: "Reservations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckedOutAt",
                table: "Reservations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql(@"
INSERT INTO Guests (FullName, Phone, Email, IdNumber, CreatedAt)
SELECT GuestName, '', NULL, NULL, MIN(CreatedAt)
FROM Reservations
GROUP BY GuestName;

UPDATE r SET r.GuestId = g.Id
FROM Reservations r
INNER JOIN Guests g ON g.FullName = r.GuestName;

UPDATE Reservations
SET NightlyRate = CASE
    WHEN DATEDIFF(day, CheckInDate, CheckOutDate) > 0 THEN TotalAmount / DATEDIFF(day, CheckInDate, CheckOutDate)
    ELSE TotalAmount
END;");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_RoomId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "GuestName",
                table: "Reservations");

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReservationId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReceivedBy = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Payments_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Payments_Users_ReceivedBy",
                        column: x => x.ReceivedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_GuestId",
                table: "Reservations",
                column: "GuestId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_RoomId_CheckInDate_CheckOutDate",
                table: "Reservations",
                columns: new[] { "RoomId", "CheckInDate", "CheckOutDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_Status",
                table: "Reservations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_FullName",
                table: "Guests",
                column: "FullName");

            migrationBuilder.CreateIndex(
                name: "IX_Guests_Phone",
                table: "Guests",
                column: "Phone");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PaidAt",
                table: "Payments",
                column: "PaidAt");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReceivedBy",
                table: "Payments",
                column: "ReceivedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ReservationId",
                table: "Payments",
                column: "ReservationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservations_Guests_GuestId",
                table: "Reservations",
                column: "GuestId",
                principalTable: "Guests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservations_Guests_GuestId",
                table: "Reservations");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.AddColumn<string>(
                name: "GuestName",
                table: "Reservations",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
UPDATE r SET r.GuestName = g.FullName
FROM Reservations r
INNER JOIN Guests g ON g.Id = r.GuestId;

UPDATE Reservations SET Status = 'Confirmed' WHERE Status IN ('CheckedIn', 'CheckedOut');
UPDATE Reservations SET Status = 'Cancelled' WHERE Status = 'NoShow';");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_GuestId",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_RoomId_CheckInDate_CheckOutDate",
                table: "Reservations");

            migrationBuilder.DropIndex(
                name: "IX_Reservations_Status",
                table: "Reservations");

            migrationBuilder.DropTable(
                name: "Guests");

            migrationBuilder.DropColumn(
                name: "Role",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CheckedInAt",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "CheckedOutAt",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "GuestId",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "NightlyRate",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Reservations");

            migrationBuilder.CreateIndex(
                name: "IX_Reservations_RoomId",
                table: "Reservations",
                column: "RoomId");
        }
    }
}
