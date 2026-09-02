using FluentValidation;
using HotelManagement.Application.Commands.Reservations;

namespace HotelManagement.Application.Validators.Reservations;

public class CreateReservationCommandValidator : AbstractValidator<CreateReservationCommand>
{
    public CreateReservationCommandValidator()
    {
        RuleFor(x => x.RoomId)
            .GreaterThan(0).WithMessage("Room ID must be valid.");

        RuleFor(x => x.GuestName)
            .NotEmpty().WithMessage("Guest Name is required.")
            .MaximumLength(100).WithMessage("Guest Name must not exceed 100 characters.");

        RuleFor(x => x.CheckInDate)
            .NotEmpty().WithMessage("Check-in date is required.");

        RuleFor(x => x.CheckOutDate)
            .NotEmpty().WithMessage("Check-out date is required.")
            .GreaterThan(x => x.CheckInDate).WithMessage("Check-out date must be after check-in date.");
    }
}
