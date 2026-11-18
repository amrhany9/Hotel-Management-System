namespace HotelManagement.Application.DTOs;

public class DashboardStatsDto
{
    public int TotalRooms { get; set; }
    public int AvailableRooms { get; set; }
    public int ConfirmedReservations { get; set; }
    public int CancelledReservations { get; set; }
    public double OccupancyPercentage { get; set; }
    public int ArrivalsToday { get; set; }
    public int DeparturesToday { get; set; }
    public int InHouse { get; set; }
    public decimal OutstandingBalance { get; set; }
    public decimal PaymentsThisMonth { get; set; }
}
