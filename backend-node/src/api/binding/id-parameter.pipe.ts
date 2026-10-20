import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

const MAX_INT32 = 2_147_483_647;

@Injectable()
export class IdParameterPipe implements PipeTransform<unknown, number> {
  transform(value: unknown): number {
    const id = /^\d+$/.test(String(value)) ? Number(value) : Number.NaN;
    if (!Number.isInteger(id) || id < 1 || id > MAX_INT32) {
      throw new NotFoundException('The requested resource was not found.');
    }
    return id;
  }
}
