using System.Text;

namespace HotelManagement.Application.Common;

public static class PhoneNumber
{
    public static string Normalize(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
        {
            return string.Empty;
        }

        var trimmed = phone.Trim();
        var builder = new StringBuilder(trimmed.Length);
        if (trimmed.StartsWith('+'))
        {
            builder.Append('+');
        }

        foreach (var c in trimmed)
        {
            if (char.IsAsciiDigit(c))
            {
                builder.Append(c);
            }
        }

        return builder.ToString();
    }
}
