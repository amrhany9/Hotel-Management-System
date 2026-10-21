import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';
import { isValidDateOnly } from '../../../domain/common/date-only';

export function IsNotBlank(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isNotBlank',
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
        defaultMessage: (args?: ValidationArguments) => `${args?.property} is required.`,
      },
    });
  };
}

export function IsDateOnly(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isDateOnly',
      target: target.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: {
        validate: (value: unknown) => isValidDateOnly(value),
        defaultMessage: (args?: ValidationArguments) => `${args?.property} must be a valid date (yyyy-MM-dd).`,
      },
    });
  };
}

export function IsDateOnlyAfter(otherProperty: string, validationOptions?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    registerDecorator({
      name: 'isDateOnlyAfter',
      target: target.constructor,
      propertyName: propertyName as string,
      constraints: [otherProperty],
      options: validationOptions,
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          const other = (args.object as Record<string, unknown>)[args.constraints[0] as string];
          if (!isValidDateOnly(value) || !isValidDateOnly(other)) return true;
          return value > other;
        },
        defaultMessage: (args?: ValidationArguments) =>
          `${args?.property} must be after ${args?.constraints[0] as string}.`,
      },
    });
  };
}
