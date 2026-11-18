using FluentValidation;
using HotelManagement.Application.Commands.Users;

namespace HotelManagement.Application.Validators.Users;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(100).WithMessage("Full name must not exceed 100 characters.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("A valid email address is required.")
            .MaximumLength(150).WithMessage("Email must not exceed 150 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches("[A-Za-z]").WithMessage("Password must contain a letter.")
            .Matches("[0-9]").WithMessage("Password must contain a number.");

        RuleFor(x => x.Role)
            .IsInEnum().WithMessage("Role must be Admin or FrontDesk.");
    }
}
