using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> builder)
    {
        builder.HasKey(res => res.Id);

        builder.Property(res => res.CheckInDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(res => res.CheckOutDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(res => res.NightlyRate)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(res => res.TotalAmount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(res => res.Status)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(res => res.Notes)
            .HasMaxLength(500);

        builder.Property(res => res.CreatedAt)
            .IsRequired();

        builder.Ignore(res => res.Nights);
        builder.Ignore(res => res.AmountPaid);
        builder.Ignore(res => res.Balance);

        builder.HasIndex(res => new { res.RoomId, res.CheckInDate, res.CheckOutDate });
        builder.HasIndex(res => res.Status);

        builder.HasOne(res => res.Room)
            .WithMany(r => r.Reservations)
            .HasForeignKey(res => res.RoomId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(res => res.Guest)
            .WithMany(g => g.Reservations)
            .HasForeignKey(res => res.GuestId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(res => res.User)
            .WithMany(u => u.Reservations)
            .HasForeignKey(res => res.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
