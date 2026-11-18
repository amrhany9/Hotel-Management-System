using System.Text;
using HotelManagement.API.Hubs;
using HotelManagement.API.Middleware;
using HotelManagement.Application;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Settings;
using HotelManagement.Infrastructure;
using HotelManagement.Infrastructure.Persistence;
using HotelManagement.Infrastructure.Persistence.Seed;
using HotelManagement.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddSignalR();
builder.Services.AddSingleton<ISignalRNotificationService, SignalRNotificationService>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key must be configured and at least 32 bytes long. Set it with 'dotnet user-secrets' locally or the Jwt__Key environment variable in production.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "HotelManagementApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "HotelManagementApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularClient", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Clear();
    options.KnownProxies.Clear();
});

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Hotel Management API",
        Version = "v1",
        Description = "ASP.NET Core Web API for Hotel Management System"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseForwardedHeaders();
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Hotel Management API v1");
    });
}

app.UseCors("AngularClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ReservationHub>("/hubs/reservations");
app.MapGet("/health", () => Results.Ok(new { status = "ok" })).AllowAnonymous();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var dbContext = services.GetRequiredService<HotelDbContext>();

    if (dbContext.Database.IsRelational())
    {
        logger.LogInformation("Applying pending EF Core migrations...");
        await dbContext.Database.MigrateAsync();
    }

    var passwordHasher = services.GetRequiredService<IPasswordHasherService>();
    var clock = services.GetRequiredService<IClock>();
    var demo = services.GetRequiredService<IOptions<DemoSettings>>().Value;

    if (demo.Enabled)
    {
        await DemoResetService.ResetNowAsync(services.GetRequiredService<IServiceScopeFactory>(), logger);
    }
    else
    {
        await HotelDbSeeder.SeedAsync(dbContext, passwordHasher, clock, logger);
    }

    logger.LogInformation("Database initialized and verified successfully.");
}

app.Run();

public partial class Program;
