import { Inject, Injectable, Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IPipelineBehavior, RequestHandlerDelegate } from '../mediator/pipeline-behavior';
import { toValidationException } from '../validation/to-validation-exception';
import { getValidatedType } from '../validation/validator-for.decorator';

export const VALIDATORS = Symbol('VALIDATORS');

@Injectable()
export class ValidationBehavior implements IPipelineBehavior {
  private readonly validatorsByRequest = new Map<Type<object>, Type<object>[]>();

  constructor(@Inject(VALIDATORS) validators: Type<object>[]) {
    for (const validator of validators) {
      const requestType = getValidatedType(validator);
      if (!requestType) {
        throw new Error(`${validator.name} is missing the @ValidatorFor(...) decorator.`);
      }
      this.validatorsByRequest.set(requestType, [...(this.validatorsByRequest.get(requestType) ?? []), validator]);
    }
  }

  async handle<T>(request: object, next: RequestHandlerDelegate<T>): Promise<T> {
    const validators = this.validatorsByRequest.get(request.constructor as Type<object>) ?? [];
    if (validators.length > 0) {
      const results = await Promise.all(
        validators.map((validator) => validate(plainToInstance(validator, { ...request }))),
      );
      const failures = results.flat();
      if (failures.length > 0) {
        throw toValidationException(failures);
      }
    }
    return next();
  }
}
