export abstract class IPasswordHasherService {
  abstract hashPassword(password: string): Promise<string>;
  abstract verifyPassword(hashedPassword: string, providedPassword: string): Promise<boolean>;
}
