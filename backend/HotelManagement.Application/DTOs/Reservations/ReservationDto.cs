namespace HotelManagement.Application.DTOs;

public class ReservationDto
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string RoomType { get; set; } = string.Empty;
    public int GuestId { get; set; }
    public string GuestName { get; set; } = string.Empty;
    public string GuestPhone { get; set; } = string.Empty;
    public string? GuestEmail { get; set; }
    public string? GuestIdNumber { get; set; }
    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public int Nights { get; set; }
    public decimal NightlyRate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime? CheckedInAt { get; set; }
    public DateTime? CheckedOutAt { get; set; }
    public int CreatedBy { get; set; }
    public string CreatedByName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ReservationDetailDto : ReservationDto
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public List<PaymentDto> Payments { get; set; } = new();
}

public class PaymentDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Method { get; set; } = string.Empty;
    public string? Reference { get; set; }
    public DateTime PaidAt { get; set; }
    public int ReceivedBy { get; set; }
    public string ReceivedByName { get; set; } = string.Empty;
}
