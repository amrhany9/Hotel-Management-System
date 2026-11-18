namespace HotelManagement.Application.Common.Settings;

public class HotelSettings
{
    public const string SectionName = "Hotel";

    public string Name { get; set; } = "Grand Horizon Hotel";
    public string Address { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public string TimeZone { get; set; } = "UTC";
}
