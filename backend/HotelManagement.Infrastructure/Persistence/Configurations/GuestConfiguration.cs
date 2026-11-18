using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HotelManagement.Infrastructure.Persistence.Configurations;

public class GuestConfiguration : IEntityTypeConfiguration<Guest>
{
    public void Configure(EntityTypeBuilder<Guest> builder)
    {
        builder.HasKey(g => g.Id);

        builder.Property(g => g.FullName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.Phone)
            .IsRequired()
            .HasMaxLength(30);

        builder.Property(g => g.Email)
            .HasMaxLength(150);

        builder.Property(g => g.IdNumber)
            .HasMaxLength(50);

        builder.Property(g => g.CreatedAt)
            .IsRequired();

        builder.HasIndex(g => g.Phone);
        builder.HasIndex(g => g.FullName);
    }
}
