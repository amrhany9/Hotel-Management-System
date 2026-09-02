namespace HotelManagement.Application.DTOs;

public class RoomTypeRevenueDto
{
    public string RoomType { get; set; } = string.Empty;
    public int ReservationCount { get; set; }
    public int TotalNights { get; set; }
    public decimal TotalRevenue { get; set; }
}
