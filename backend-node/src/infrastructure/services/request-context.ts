import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { AuthenticatedUser } from '../authentication/authenticated-user';

interface RequestContextStore {
  user?: AuthenticatedUser;
}

@Injectable()
export class RequestContext {
  private readonly storage = new AsyncLocalStorage<RequestContextStore>();

  run<T>(callback: () => T): T {
    return this.storage.run({}, callback);
  }

  get user(): AuthenticatedUser | undefined {
    return this.storage.getStore()?.user;
  }

  setUser(user: AuthenticatedUser): void {
    const store = this.storage.getStore();
    if (store) {
      store.user = user;
    }
  }
}
