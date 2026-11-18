using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Settings;
using HotelManagement.Infrastructure.Authentication;
using HotelManagement.Infrastructure.Persistence;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace HotelManagement.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is not configured. Set it with 'dotnet user-secrets' locally or the ConnectionStrings__DefaultConnection environment variable in production.");
        }

        services.AddDbContext<HotelDbContext>(options =>
            options.UseSqlServer(connectionString, b =>
            {
                b.MigrationsAssembly(typeof(HotelDbContext).Assembly.FullName);
                b.EnableRetryOnFailure(5);
            }));

        services.Configure<HotelSettings>(configuration.GetSection(HotelSettings.SectionName));
        services.Configure<DemoSettings>(configuration.GetSection(DemoSettings.SectionName));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<IReservationRepository, ReservationRepository>();
        services.AddScoped<IGuestRepository, GuestRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IReportRepository, ReportRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<IPasswordHasherService, PasswordHasherService>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddHostedService<DemoResetService>();

        return services;
    }
}
