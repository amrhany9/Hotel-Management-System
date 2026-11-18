namespace HotelManagement.Application.Common.Settings;

public class DemoSettings
{
    public const string SectionName = "Demo";

    public static readonly string[] ProtectedAccountEmails = ["admin@hotel.local", "staff@hotel.local"];

    public bool Enabled { get; set; }
    public int DailyResetHourUtc { get; set; } = 3;
}
