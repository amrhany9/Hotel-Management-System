namespace HotelManagement.Application.DTOs;

public class OccupancyReportItemDto
{
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public int BookedNights { get; set; }
    public int AvailableNights { get; set; }
    public double OccupancyPercentage { get; set; }
}
