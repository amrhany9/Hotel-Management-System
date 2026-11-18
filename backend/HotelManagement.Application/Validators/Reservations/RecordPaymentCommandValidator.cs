using FluentValidation;
using HotelManagement.Application.Commands.Reservations;

namespace HotelManagement.Application.Validators.Reservations;

public class RecordPaymentCommandValidator : AbstractValidator<RecordPaymentCommand>
{
    public RecordPaymentCommandValidator()
    {
        RuleFor(x => x.ReservationId)
            .GreaterThan(0);

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Payment amount must be greater than zero.")
            .PrecisionScale(18, 2, true).WithMessage("Payment amount can have at most two decimal places.");

        RuleFor(x => x.Method)
            .IsInEnum().WithMessage("Choose a payment method: Cash, Card or BankTransfer.");

        RuleFor(x => x.Reference)
            .MaximumLength(100).WithMessage("Reference must not exceed 100 characters.");
    }
}
