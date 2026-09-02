using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.HasKey(res => res.Id);

        builder.Property(res => res.GuestName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(res => res.CheckInDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(res => res.CheckOutDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(res => res.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(res => res.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(res => res.CreatedAt)
            .IsRequired();

        builder.HasOne(res => res.Room)
            .WithMany(r => r.Reservations)
            .HasForeignKey(res => res.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(res => res.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(res => res.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
