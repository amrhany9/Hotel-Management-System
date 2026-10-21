import { PasswordHasherService } from '../../src/infrastructure/authentication/password-hasher.service';

const DOTNET_HASH_OF_ADMIN123 =
  'AQAAAAIAAYagAAAAEBH8b41DGvNP5K7AsnuHb80BSU2WJjFw9BKGGAR6xeEtKzfIc2YD50ufu7TGnAhTBw==';

describe('PasswordHasherTests', () => {
  const hasher = new PasswordHasherService();

  it('VerifyPassword_AcceptsHashCreatedByAspNetCoreIdentity', async () => {
    await expect(hasher.verifyPassword(DOTNET_HASH_OF_ADMIN123, 'Admin123!')).resolves.toBe(true);
    await expect(hasher.verifyPassword(DOTNET_HASH_OF_ADMIN123, 'admin123!')).resolves.toBe(false);
  });

  it('HashPassword_ProducesIdentityV3FormatThatRoundTrips', async () => {
    const hash = await hasher.hashPassword('Staff123!');
    const bytes = Buffer.from(hash, 'base64');

    expect(bytes[0]).toBe(0x01);
    expect(bytes.readUInt32BE(1)).toBe(2);
    expect(bytes.readUInt32BE(5)).toBe(100_000);
    expect(bytes.readUInt32BE(9)).toBe(16);
    expect(bytes.length).toBe(13 + 16 + 32);
    await expect(hasher.verifyPassword(hash, 'Staff123!')).resolves.toBe(true);
    await expect(hasher.verifyPassword(hash, 'wrong')).resolves.toBe(false);
  });

  it('HashPassword_UsesRandomSalt', async () => {
    expect(await hasher.hashPassword('same')).not.toEqual(await hasher.hashPassword('same'));
  });

  it('VerifyPassword_RejectsMalformedHashesWithoutThrowing', async () => {
    await expect(hasher.verifyPassword('', 'x')).resolves.toBe(false);
    await expect(hasher.verifyPassword('AQ==', 'x')).resolves.toBe(false);
    await expect(hasher.verifyPassword('not base64 at all!', 'x')).resolves.toBe(false);
  });
});
