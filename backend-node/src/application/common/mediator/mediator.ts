import { Inject, Injectable } from '@nestjs/common';
import { Command, CommandBus, Query, QueryBus } from '@nestjs/cqrs';
import { IPipelineBehavior, PIPELINE_BEHAVIORS, RequestHandlerDelegate } from './pipeline-behavior';

export abstract class IMediator {
  abstract send<T>(request: Command<T> | Query<T>): Promise<T>;
}

@Injectable()
export class Mediator implements IMediator {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(PIPELINE_BEHAVIORS) private readonly behaviors: IPipelineBehavior[],
  ) {}

  send<T>(request: Command<T> | Query<T>): Promise<T> {
    const dispatch: RequestHandlerDelegate<T> = () =>
      request instanceof Query ? this.queryBus.execute(request) : this.commandBus.execute(request);

    const pipeline = this.behaviors.reduceRight<RequestHandlerDelegate<T>>(
      (next, behavior) => () => behavior.handle(request, next),
      dispatch,
    );
    return pipeline();
  }
}
