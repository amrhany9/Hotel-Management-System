import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '../../infrastructure/services/request-context';
import type { AuthenticatedRequest } from './jwt-authentication.guard';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly requestContext: RequestContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().user;

    return new Observable((subscriber) =>
      this.requestContext.run(() => {
        if (user) this.requestContext.setUser(user);
        return next.handle().subscribe(subscriber);
      }),
    );
  }
}
