export type ValidationErrors = Record<string, string[]>;

export class ValidationException extends Error {
  constructor(public readonly errors: ValidationErrors = {}) {
    super('One or more validation failures have occurred.');
    this.name = 'ValidationException';
  }

  static forProperty(propertyName: string, errorMessage: string): ValidationException {
    return new ValidationException({ [propertyName]: [errorMessage] });
  }
}
