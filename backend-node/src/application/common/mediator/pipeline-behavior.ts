export type RequestHandlerDelegate<T> = () => Promise<T>;

export interface IPipelineBehavior {
  handle<T>(request: object, next: RequestHandlerDelegate<T>): Promise<T>;
}

export const PIPELINE_BEHAVIORS = Symbol('PIPELINE_BEHAVIORS');
