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
            .NotEmpty().WithMessage("Guest name is required.")
            .MaximumLength(100).WithMessage("Guest name must not exceed 100 characters.");

        RuleFor(x => x.GuestPhone)
            .NotEmpty().WithMessage("Guest phone number is required.")
            .Matches(@"^\+?[0-9\s\-()]{7,20}$").WithMessage("Enter a valid phone number, for example +20 100 123 4567.");

        RuleFor(x => x.GuestEmail)
            .EmailAddress().WithMessage("Enter a valid email address.")
            .MaximumLength(150)
            .When(x => !string.IsNullOrWhiteSpace(x.GuestEmail));

        RuleFor(x => x.GuestIdNumber)
            .MaximumLength(50).WithMessage("ID or passport number must not exceed 50 characters.");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters.");

        RuleFor(x => x.CheckInDate)
            .NotEmpty().WithMessage("Check-in date is required.");

        RuleFor(x => x.CheckOutDate)
            .NotEmpty().WithMessage("Check-out date is required.")
            .GreaterThan(x => x.CheckInDate).WithMessage("Check-out date must be after check-in date.");
    }
}
