using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Mappings;

public static class ReservationMapper
{
    public static ReservationDto ToDto(Reservation reservation) => Fill(new ReservationDto(), reservation);

    public static ReservationDetailDto ToDetailDto(Reservation reservation)
    {
        var dto = Fill(new ReservationDetailDto(), reservation);
        dto.InvoiceNumber = InvoiceNumberFor(reservation);
        dto.Payments = reservation.Payments
            .OrderBy(p => p.PaidAt)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                Amount = p.Amount,
                Method = p.Method.ToString(),
                Reference = p.Reference,
                PaidAt = p.PaidAt,
                ReceivedBy = p.ReceivedBy,
                ReceivedByName = p.ReceivedByUser?.FullName ?? $"User #{p.ReceivedBy}"
            })
            .ToList();
        return dto;
    }

    public static string InvoiceNumberFor(Reservation reservation) =>
        $"INV-{reservation.CreatedAt:yyyy}-{reservation.Id:D5}";

    private static T Fill<T>(T dto, Reservation r) where T : ReservationDto
    {
        dto.Id = r.Id;
        dto.RoomId = r.RoomId;
        dto.RoomNumber = r.Room?.RoomNumber ?? string.Empty;
        dto.RoomType = r.Room?.RoomType ?? string.Empty;
        dto.GuestId = r.GuestId;
        dto.GuestName = r.Guest?.FullName ?? string.Empty;
        dto.GuestPhone = r.Guest?.Phone ?? string.Empty;
        dto.GuestEmail = r.Guest?.Email;
        dto.GuestIdNumber = r.Guest?.IdNumber;
        dto.CheckInDate = r.CheckInDate;
        dto.CheckOutDate = r.CheckOutDate;
        dto.Nights = r.Nights;
        dto.NightlyRate = r.NightlyRate;
        dto.TotalAmount = r.TotalAmount;
        dto.AmountPaid = r.AmountPaid;
        dto.Balance = r.Balance;
        dto.Status = r.Status.ToString();
        dto.Notes = r.Notes;
        dto.CheckedInAt = r.CheckedInAt;
        dto.CheckedOutAt = r.CheckedOutAt;
        dto.CreatedBy = r.CreatedBy;
        dto.CreatedByName = r.User?.FullName ?? $"User #{r.CreatedBy}";
        dto.CreatedAt = r.CreatedAt;
        return dto;
    }
}
