namespace HotelManagement.Application.Common.Interfaces;

public interface IClock
{
    DateTime UtcNow { get; }
    DateOnly Today { get; }
}
