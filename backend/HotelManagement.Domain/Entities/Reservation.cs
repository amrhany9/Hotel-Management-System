using HotelManagement.Domain.Enums;

namespace HotelManagement.Domain.Entities;

public class Reservation
{
    public int Id { get; set; }

    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;

    public int GuestId { get; set; }
    public Guest Guest { get; set; } = null!;

    public DateOnly CheckInDate { get; set; }
    public DateOnly CheckOutDate { get; set; }
    public decimal NightlyRate { get; set; }
    public decimal TotalAmount { get; set; }
    public ReservationStatus Status { get; set; } = ReservationStatus.Confirmed;
    public string? Notes { get; set; }

    public DateTime? CheckedInAt { get; set; }
    public DateTime? CheckedOutAt { get; set; }

    public int CreatedBy { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public int Nights => CheckOutDate.DayNumber - CheckInDate.DayNumber;

    public decimal AmountPaid => Payments.Sum(p => p.Amount);

    public decimal Balance => TotalAmount - AmountPaid;

    public static bool BlocksRoom(ReservationStatus status) =>
        status is ReservationStatus.Confirmed or ReservationStatus.CheckedIn;

    public static bool CountsAsStay(ReservationStatus status) =>
        status is ReservationStatus.Confirmed or ReservationStatus.CheckedIn or ReservationStatus.CheckedOut;
}
