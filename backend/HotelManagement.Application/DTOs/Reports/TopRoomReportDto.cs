namespace HotelManagement.Application.DTOs;

public class TopRoomReportDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public int ReservationCount { get; set; }
    public decimal TotalRevenue { get; set; }
}
