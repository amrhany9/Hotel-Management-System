using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities;

public class Payment
{
    public int Id { get; set; }

    public int ReservationId { get; set; }
    public Reservation Reservation { get; set; } = null!;

    public decimal Amount { get; set; }
    public PaymentMethod Method { get; set; }
    public string? Reference { get; set; }
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;

    public int ReceivedBy { get; set; }
    public User ReceivedByUser { get; set; } = null!;
}
