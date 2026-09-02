using FluentValidation;
using HotelManagement.Application.Commands.Rooms;

namespace HotelManagement.Application.Validators.Rooms;

public class UpdateRoomCommandValidator : AbstractValidator<UpdateRoomCommand>
{
    public UpdateRoomCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Valid Room ID is required.");

        RuleFor(x => x.RoomNumber)
            .NotEmpty().WithMessage("Room number is required.")
            .MaximumLength(50).WithMessage("Room number must not exceed 50 characters.");

        RuleFor(x => x.RoomType)
            .NotEmpty().WithMessage("Room type is required.")
            .MaximumLength(50).WithMessage("Room type must not exceed 50 characters.");

        RuleFor(x => x.PricePerNight)
            .GreaterThan(0).WithMessage("Price per night must be greater than zero.");
    }
}
