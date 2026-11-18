namespace HotelManagement.Application.DTOs;

public class GuestDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? IdNumber { get; set; }
    public int TotalStays { get; set; }
    public decimal TotalPaid { get; set; }
    public DateOnly? LastStay { get; set; }
    public DateTime CreatedAt { get; set; }
}
