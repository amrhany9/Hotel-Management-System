using HotelManagement.Application.Commands.Users;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Settings;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Tests.Common;
using Microsoft.Extensions.Options;
using Moq;

namespace HotelManagement.Tests.Users;

public class UserManagementTests
{
    private static SetUserActiveCommandHandler SetActive(TestHotel hotel, bool demo = false) => new(
        new UserRepository(hotel.Context),
        new AuditLogRepository(hotel.Context),
        new UnitOfWork(hotel.Context),
        hotel.CurrentUser.Object,
        hotel.Clock,
        Options.Create(new DemoSettings { Enabled = demo }));

    [Fact]
    public async Task Deactivate_OwnAccount_ThrowsConflictException()
    {
        var hotel = new TestHotel(new DateOnly(2026, 9, 1));

        await Assert.ThrowsAsync<ConflictException>(() =>
            SetActive(hotel).Handle(new SetUserActiveCommand(hotel.Admin.Id, false), CancellationToken.None));
    }

    [Fact]
    public async Task Deactivate_DemoAccount_InDemoMode_ThrowsConflictException()
    {
        var hotel = new TestHotel(new DateOnly(2026, 9, 1));
        var staff = new User { Id = 2, FullName = "Front Desk", Email = "staff@hotel.local", PasswordHash = "hash", Role = UserRole.FrontDesk };
        hotel.Context.Users.Add(staff);
        await hotel.Context.SaveChangesAsync();

        await Assert.ThrowsAsync<ConflictException>(() =>
            SetActive(hotel, demo: true).Handle(new SetUserActiveCommand(staff.Id, false), CancellationToken.None));
    }

    [Fact]
    public async Task Deactivate_OtherStaff_Succeeds()
    {
        var hotel = new TestHotel(new DateOnly(2026, 9, 1));
        var staff = new User { Id = 2, FullName = "Front Desk", Email = "frontdesk@hotel.local", PasswordHash = "hash", Role = UserRole.FrontDesk };
        hotel.Context.Users.Add(staff);
        await hotel.Context.SaveChangesAsync();

        var result = await SetActive(hotel, demo: true).Handle(new SetUserActiveCommand(staff.Id, false), CancellationToken.None);

        Assert.False(result.IsActive);
    }

    [Fact]
    public async Task CreateUser_WithExistingEmail_ThrowsConflictException()
    {
        var hotel = new TestHotel(new DateOnly(2026, 9, 1));
        var hasher = new Mock<IPasswordHasherService>();
        hasher.Setup(h => h.HashPassword(It.IsAny<string>())).Returns("hash");
        var handler = new CreateUserCommandHandler(
            new UserRepository(hotel.Context),
            new AuditLogRepository(hotel.Context),
            new UnitOfWork(hotel.Context),
            hasher.Object,
            hotel.CurrentUser.Object,
            hotel.Clock);

        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new CreateUserCommand("Another Admin", "ADMIN@hotel.local", "Password1", UserRole.Admin), CancellationToken.None));
    }
}
