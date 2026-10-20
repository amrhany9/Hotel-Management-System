import type { ValidationError } from 'class-validator';
import { ValidationErrors, ValidationException } from '../exceptions/validation.exception';

function toPascalCase(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function collect(failures: ValidationError[], result: ValidationErrors, prefix = ''): ValidationErrors {
  for (const failure of failures) {
    const key = prefix + toPascalCase(failure.property);
    if (failure.constraints) {
      const constraints = failure.constraints;
      const messages = constraints.isNotBlank ? [constraints.isNotBlank] : Object.values(constraints).reverse();
      result[key] = [...(result[key] ?? []), ...messages];
    }
    if (failure.children?.length) {
      collect(failure.children, result, `${key}.`);
    }
  }
  return result;
}

export function toValidationException(failures: ValidationError[]): ValidationException {
  return new ValidationException(collect(failures, {}));
}
