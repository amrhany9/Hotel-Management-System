using System.Reflection;
using FluentValidation;
using HotelManagement.Application.Common.Behaviors;
using HotelManagement.Application.Common.Services;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace HotelManagement.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddValidatorsFromAssembly(assembly);
        services.AddScoped<ReservationChangeRecorder>();

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
