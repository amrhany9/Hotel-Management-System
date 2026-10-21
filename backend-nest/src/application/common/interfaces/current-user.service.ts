export abstract class ICurrentUserService {
  abstract get userId(): number | undefined;
  abstract get email(): string | undefined;
  abstract get fullName(): string | undefined;
  abstract get isAuthenticated(): boolean;
}
