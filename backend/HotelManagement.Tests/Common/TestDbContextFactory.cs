using HotelManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace HotelManagement.Tests.Common;

public static class TestDbContextFactory
{
    public static HotelDbContext Create(string dbName)
    {
        var options = new DbContextOptionsBuilder<HotelDbContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        var context = new HotelDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
