namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<T> ExecuteTransactionAsync<T>(Func<Task<T>> action, CancellationToken cancellationToken = default);
    Task ExecuteTransactionAsync(Func<Task> action, CancellationToken cancellationToken = default);
}
