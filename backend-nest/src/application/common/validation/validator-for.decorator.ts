import type { Type } from '@nestjs/common';

const VALIDATED_TYPE = Symbol('validatedType');

export function ValidatorFor(requestType: Type<object>): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(VALIDATED_TYPE, requestType, target);
  };
}

export function getValidatedType(validator: Type<object>): Type<object> | undefined {
  return Reflect.getMetadata(VALIDATED_TYPE, validator) as Type<object> | undefined;
}
