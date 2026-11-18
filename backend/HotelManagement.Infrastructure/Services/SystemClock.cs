using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Settings;
using Microsoft.Extensions.Options;

namespace HotelManagement.Infrastructure.Services;

public class SystemClock : IClock
{
    private readonly TimeZoneInfo _hotelTimeZone;

    public SystemClock(IOptions<HotelSettings> settings)
    {
        _hotelTimeZone = ResolveTimeZone(settings.Value.TimeZone);
    }

    public DateTime UtcNow => DateTime.UtcNow;

    public DateOnly Today => DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(UtcNow, _hotelTimeZone));

    private static TimeZoneInfo ResolveTimeZone(string? id)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            return TimeZoneInfo.Utc;
        }

        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(id);
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.Utc;
        }
    }
}
