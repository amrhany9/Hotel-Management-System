using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Services;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence;
using HotelManagement.Infrastructure.Persistence.Repositories;
using Moq;

namespace HotelManagement.Tests.Common;

public sealed class FakeClock : IClock
{
    public FakeClock(DateOnly today)
    {
        Today = today;
    }

    public DateOnly Today { get; set; }
    public DateTime UtcNow => Today.ToDateTime(new TimeOnly(12, 0), DateTimeKind.Utc);
}

public sealed class TestHotel
{
    public HotelDbContext Context { get; }
    public FakeClock Clock { get; }
    public Mock<ICurrentUserService> CurrentUser { get; } = new();
    public Mock<ISignalRNotificationService> SignalR { get; } = new();
    public User Admin { get; }
    public Room Room { get; }
    public Guest Guest { get; }

    public TestHotel(DateOnly today)
    {
        Context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        Clock = new FakeClock(today);
        CurrentUser.Setup(u => u.UserId).Returns(1);
        CurrentUser.Setup(u => u.IsAuthenticated).Returns(true);

        Admin = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash", Role = UserRole.Admin };
        Room = new Room { Id = 1, RoomNumber = "101", RoomType = "Standard", PricePerNight = 100m, IsAvailable = true };
        Guest = new Guest { Id = 1, FullName = "Existing Guest", Phone = "+201001234567" };

        Context.Users.Add(Admin);
        Context.Rooms.Add(Room);
        Context.Guests.Add(Guest);
        Context.SaveChanges();
    }

    public Reservation AddReservation(DateOnly checkIn, int nights, ReservationStatus status, decimal paid = 0m)
    {
        var reservation = new Reservation
        {
            RoomId = Room.Id,
            GuestId = Guest.Id,
            CheckInDate = checkIn,
            CheckOutDate = checkIn.AddDays(nights),
            NightlyRate = Room.PricePerNight,
            TotalAmount = Room.PricePerNight * nights,
            Status = status,
            CreatedBy = Admin.Id
        };

        if (paid > 0)
        {
            reservation.Payments.Add(new Payment { Amount = paid, Method = PaymentMethod.Cash, ReceivedBy = Admin.Id, PaidAt = Clock.UtcNow.AddDays(-1) });
        }

        Context.Reservations.Add(reservation);
        Context.SaveChanges();
        return reservation;
    }

    public ReservationRepository Reservations => new(Context);

    public ReservationChangeRecorder Recorder => new(
        new AuditLogRepository(Context),
        new UnitOfWork(Context),
        CurrentUser.Object,
        SignalR.Object,
        Clock);
}
