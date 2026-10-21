import { Injectable } from '@nestjs/common';
import { pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { IPasswordHasherService } from '../../application/common/interfaces/password-hasher.service';

const pbkdf2Async = promisify(pbkdf2);

const FORMAT_V2 = 0x00;
const FORMAT_V3 = 0x01;
const PRF_ALGORITHMS: Record<number, string> = { 0: 'sha1', 1: 'sha256', 2: 'sha512' };

const V3_PRF = 2;
const V3_ITERATIONS = 100_000;
const SALT_SIZE = 16;
const SUBKEY_SIZE = 32;

@Injectable()
export class PasswordHasherService implements IPasswordHasherService {
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(SALT_SIZE);
    const subkey = await pbkdf2Async(password, salt, V3_ITERATIONS, SUBKEY_SIZE, PRF_ALGORITHMS[V3_PRF]);

    const header = Buffer.alloc(13);
    header.writeUInt8(FORMAT_V3, 0);
    header.writeUInt32BE(V3_PRF, 1);
    header.writeUInt32BE(V3_ITERATIONS, 5);
    header.writeUInt32BE(SALT_SIZE, 9);

    return Buffer.concat([header, salt, subkey]).toString('base64');
  }

  async verifyPassword(hashedPassword: string, providedPassword: string): Promise<boolean> {
    let decoded: Buffer;
    try {
      decoded = Buffer.from(hashedPassword, 'base64');
    } catch {
      return false;
    }
    if (decoded.length === 0) return false;

    switch (decoded[0]) {
      case FORMAT_V3:
        return this.verifyV3(decoded, providedPassword);
      case FORMAT_V2:
        return this.verifyV2(decoded, providedPassword);
      default:
        return false;
    }
  }

  private async verifyV3(decoded: Buffer, password: string): Promise<boolean> {
    if (decoded.length < 13) return false;
    const algorithm = PRF_ALGORITHMS[decoded.readUInt32BE(1)];
    const iterations = decoded.readUInt32BE(5);
    const saltLength = decoded.readUInt32BE(9);
    if (!algorithm || iterations < 1 || saltLength < 16 || decoded.length < 13 + saltLength + 16) return false;

    const salt = decoded.subarray(13, 13 + saltLength);
    const expected = decoded.subarray(13 + saltLength);
    const actual = await pbkdf2Async(password, salt, iterations, expected.length, algorithm);
    return timingSafeEqual(actual, expected);
  }

  private async verifyV2(decoded: Buffer, password: string): Promise<boolean> {
    if (decoded.length !== 1 + SALT_SIZE + SUBKEY_SIZE) return false;
    const salt = decoded.subarray(1, 1 + SALT_SIZE);
    const expected = decoded.subarray(1 + SALT_SIZE);
    const actual = await pbkdf2Async(password, salt, 1000, SUBKEY_SIZE, 'sha1');
    return timingSafeEqual(actual, expected);
  }
}
