namespace HotelManagement.Domain.Entities;

public class AuditLog
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;

    public int UserId { get; set; }
    public User? User { get; set; }
    
    public DateTime ActionDate { get; set; } = DateTime.UtcNow;
    public string Details { get; set; } = string.Empty;
}
