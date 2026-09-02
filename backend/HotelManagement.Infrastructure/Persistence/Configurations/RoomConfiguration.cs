using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class RoomConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.RoomNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(r => r.RoomNumber)
            .IsUnique();

        builder.Property(r => r.RoomType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(r => r.PricePerNight)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(r => r.CreatedAt)
            .IsRequired();
    }
}
