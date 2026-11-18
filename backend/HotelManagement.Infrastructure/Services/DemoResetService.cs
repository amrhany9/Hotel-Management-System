using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Settings;
using HotelManagement.Infrastructure.Persistence;
using HotelManagement.Infrastructure.Persistence.Seed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HotelManagement.Infrastructure.Services;

public class DemoResetService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DemoResetService> _logger;
    private readonly DemoSettings _settings;

    public DemoResetService(IServiceScopeFactory scopeFactory, ILogger<DemoResetService> logger, IOptions<DemoSettings> settings)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _settings = settings.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            var delay = TimeUntilNextReset(DateTime.UtcNow, _settings.DailyResetHourUtc);
            _logger.LogInformation("Next demo data reset in {Delay}.", delay);

            try
            {
                await Task.Delay(delay, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                return;
            }

            try
            {
                await ResetNowAsync(_scopeFactory, _logger, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Demo data reset failed.");
            }
        }
    }

    public static async Task ResetNowAsync(IServiceScopeFactory scopeFactory, ILogger logger, CancellationToken cancellationToken = default)
    {
        using var scope = scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<HotelDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasherService>();
        var clock = scope.ServiceProvider.GetRequiredService<IClock>();
        await HotelDbSeeder.ResetAsync(context, hasher, clock, logger);
    }

    public static TimeSpan TimeUntilNextReset(DateTime utcNow, int resetHourUtc)
    {
        var hour = Math.Clamp(resetHourUtc, 0, 23);
        var next = utcNow.Date.AddHours(hour);
        if (next <= utcNow)
        {
            next = next.AddDays(1);
        }
        return next - utcNow;
    }
}
