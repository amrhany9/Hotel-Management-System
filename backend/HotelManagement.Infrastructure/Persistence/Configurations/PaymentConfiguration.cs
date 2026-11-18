using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Amount)
            .HasColumnType("decimal(18,2)")
            .IsRequired();

        builder.Property(p => p.Method)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(p => p.Reference)
            .HasMaxLength(100);

        builder.Property(p => p.PaidAt)
            .IsRequired();

        builder.HasIndex(p => p.PaidAt);

        builder.HasOne(p => p.Reservation)
            .WithMany(r => r.Payments)
            .HasForeignKey(p => p.ReservationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.ReceivedByUser)
            .WithMany()
            .HasForeignKey(p => p.ReceivedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
