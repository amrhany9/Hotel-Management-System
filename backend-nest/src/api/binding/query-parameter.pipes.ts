import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { ValidationException } from '../../application/common/exceptions/validation.exception';
import { isValidDateOnly, type DateOnly } from '../../domain/common/date-only';

function isMissing(value: unknown): value is undefined | null | '' {
  return value === undefined || value === null || value === '';
}

function bindingError(value: unknown, metadata: ArgumentMetadata): ValidationException {
  const name = metadata.data ?? 'value';
  const key = name.charAt(0).toUpperCase() + name.slice(1);
  return ValidationException.forProperty(key, `The value '${String(value)}' is not valid for ${name}.`);
}

@Injectable()
export class OptionalNumberPipe implements PipeTransform<unknown, number | undefined> {
  transform(value: unknown, metadata: ArgumentMetadata): number | undefined {
    if (isMissing(value)) return undefined;
    const parsed = Number(value);
    if (typeof value !== 'string' || !Number.isFinite(parsed)) throw bindingError(value, metadata);
    return parsed;
  }
}

@Injectable()
export class OptionalIntPipe implements PipeTransform<unknown, number | undefined> {
  transform(value: unknown, metadata: ArgumentMetadata): number | undefined {
    if (isMissing(value)) return undefined;
    if (typeof value !== 'string' || !/^-?\d+$/.test(value)) throw bindingError(value, metadata);
    return Number(value);
  }
}

@Injectable()
export class OptionalDateOnlyPipe implements PipeTransform<unknown, DateOnly | undefined> {
  transform(value: unknown, metadata: ArgumentMetadata): DateOnly | undefined {
    if (isMissing(value)) return undefined;
    if (!isValidDateOnly(value)) throw bindingError(value, metadata);
    return value;
  }
}

@Injectable()
export class OptionalStringPipe implements PipeTransform<unknown, string | undefined> {
  transform(value: unknown, metadata: ArgumentMetadata): string | undefined {
    if (isMissing(value)) return undefined;
    if (typeof value !== 'string') throw bindingError(value, metadata);
    return value;
  }
}
