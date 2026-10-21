export abstract class IUnitOfWork {
  abstract executeTransaction<T>(action: () => Promise<T>): Promise<T>;
}
