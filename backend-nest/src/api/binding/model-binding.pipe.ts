import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

const PRIMITIVES: unknown[] = [String, Number, Boolean, Array, Object];

@Injectable()
export class ModelBindingPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const { type, metatype } = metadata;
    if (type !== 'body' || !metatype || PRIMITIVES.includes(metatype)) {
      return value;
    }
    const source = value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return plainToInstance(metatype, source);
  }
}
