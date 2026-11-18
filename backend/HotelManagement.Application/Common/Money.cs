using System.Globalization;

namespace HotelManagement.Application.Common;

public static class Money
{
    public static string Format(decimal amount) => amount.ToString("N2", CultureInfo.InvariantCulture);
}
