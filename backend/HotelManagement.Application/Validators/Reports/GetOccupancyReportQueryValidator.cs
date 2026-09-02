using FluentValidation;
using HotelManagement.Application.Queries.Reports;

namespace HotelManagement.Application.Validators.Reports;

public class GetOccupancyReportQueryValidator : AbstractValidator<GetOccupancyReportQuery>
{
    public GetOccupancyReportQueryValidator()
    {
        RuleFor(x => x.From).NotEmpty().WithMessage("From date is required.");
        RuleFor(x => x.To).NotEmpty().WithMessage("To date is required.")
            .GreaterThan(x => x.From).WithMessage("To date must be after From date.");
    }
}
