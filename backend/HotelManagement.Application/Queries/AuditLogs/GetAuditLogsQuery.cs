using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.AuditLogs;

public record GetAuditLogsQuery(int Take = 100) : IRequest<List<AuditLogDto>>;

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, List<AuditLogDto>>
{
    private readonly IAuditLogRepository _auditLogRepository;

    public GetAuditLogsQueryHandler(IAuditLogRepository auditLogRepository)
    {
        _auditLogRepository = auditLogRepository;
    }

    public async Task<List<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var logs = await _auditLogRepository.GetRecentAsync(request.Take, cancellationToken);

        return logs.Select(a => new AuditLogDto
        {
            Id = a.Id,
            Action = a.Action,
            EntityName = a.EntityName,
            EntityId = a.EntityId,
            UserId = a.UserId,
            UserName = a.User != null ? a.User.FullName : $"User #{a.UserId}",
            ActionDate = a.ActionDate,
            Details = a.Details
        }).ToList();
    }
}
