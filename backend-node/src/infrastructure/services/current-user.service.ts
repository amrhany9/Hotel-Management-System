import { Injectable } from '@nestjs/common';
import { ICurrentUserService } from '../../application/common/interfaces/current-user.service';
import { RequestContext } from './request-context';

@Injectable()
export class CurrentUserService implements ICurrentUserService {
  constructor(private readonly requestContext: RequestContext) {}

  get userId(): number | undefined {
    return this.requestContext.user?.userId;
  }

  get email(): string | undefined {
    return this.requestContext.user?.email;
  }

  get fullName(): string | undefined {
    return this.requestContext.user?.fullName;
  }

  get isAuthenticated(): boolean {
    return this.requestContext.user !== undefined;
  }
}
