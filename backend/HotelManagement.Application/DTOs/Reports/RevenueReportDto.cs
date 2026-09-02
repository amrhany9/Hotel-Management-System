namespace HotelManagement.Application.DTOs;

public class RevenueReportDto
{
    public int TotalReservations { get; set; }
    public int TotalNights { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<RoomTypeRevenueDto> ByRoomType { get; set; } = new();
}
