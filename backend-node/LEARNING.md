# What You Learned Building the Node.js Backend

A guided tour of the Node.js, TypeScript and NestJS concepts used in `backend-node`, explained from the point of view of the ASP.NET Core backend you already know. The Node project follows the **same Clean Architecture layout** (Domain → Application → Infrastructure → API), so you can open a .NET file and its Node counterpart side by side. Every section links to the code where the concept is used.

---

## 1. The big picture: file-by-file translation

| ASP.NET Core backend | Node.js backend |
| :--- | :--- |
| `HotelManagement.Domain/Entities/Room.cs` | [src/domain/entities/room.ts](src/domain/entities/room.ts) |
| `Application/Commands/Reservations/CreateReservationCommand.cs` | [src/application/commands/reservations/create-reservation.command.ts](src/application/commands/reservations/create-reservation.command.ts) |
| `Application/Queries/Rooms/GetAvailableRoomsQuery.cs` | [src/application/queries/rooms/get-available-rooms.query.ts](src/application/queries/rooms/get-available-rooms.query.ts) |
| `Application/Validators/Rooms/CreateRoomCommandValidator.cs` | [src/application/validators/rooms/create-room-command.validator.ts](src/application/validators/rooms/create-room-command.validator.ts) |
| `Application/Common/Behaviors/ValidationBehavior.cs` | [src/application/common/behaviors/validation.behavior.ts](src/application/common/behaviors/validation.behavior.ts) |
| `Application/Common/Interfaces/Repositories/IRoomRepository.cs` | [src/application/common/interfaces/repositories/room.repository.ts](src/application/common/interfaces/repositories/room.repository.ts) |
| `Application/DependencyInjection.cs` | [src/application/application.module.ts](src/application/application.module.ts) |
| MediatR `IMediator` | [src/application/common/mediator/mediator.ts](src/application/common/mediator/mediator.ts) (on top of `@nestjs/cqrs`) |
| `Infrastructure/Persistence/Configurations/RoomConfiguration.cs` | [src/infrastructure/persistence/configurations/room.configuration.ts](src/infrastructure/persistence/configurations/room.configuration.ts) |
| `Infrastructure/Persistence/Repositories/RoomRepository.cs` | [src/infrastructure/persistence/repositories/room.repository.ts](src/infrastructure/persistence/repositories/room.repository.ts) |
| `Infrastructure/Persistence/Repositories/UnitOfWork.cs` | [src/infrastructure/persistence/repositories/unit-of-work.ts](src/infrastructure/persistence/repositories/unit-of-work.ts) |
| `Infrastructure/Persistence/Seed/HotelDbSeeder.cs` | [src/infrastructure/persistence/seed/hotel-db.seeder.ts](src/infrastructure/persistence/seed/hotel-db.seeder.ts) |
| `Infrastructure/Authentication/PasswordHasherService.cs` | [src/infrastructure/authentication/password-hasher.service.ts](src/infrastructure/authentication/password-hasher.service.ts) |
| `Infrastructure/Services/CurrentUserService.cs` | [src/infrastructure/services/current-user.service.ts](src/infrastructure/services/current-user.service.ts) |
| `Infrastructure/DependencyInjection.cs` | [src/infrastructure/infrastructure.module.ts](src/infrastructure/infrastructure.module.ts) |
| `API/Controllers/RoomsController.cs` | [src/api/controllers/rooms.controller.ts](src/api/controllers/rooms.controller.ts) |
| `API/Hubs/ReservationHub.cs`, `SignalRNotificationService.cs` | [src/api/hubs](src/api/hubs) |
| `API/Middleware/ExceptionHandlingMiddleware.cs` | [src/api/middleware/exception-handling.filter.ts](src/api/middleware/exception-handling.filter.ts) |
| `[Authorize]` + JwtBearer setup in `Program.cs` | [src/api/middleware/jwt-authentication.guard.ts](src/api/middleware/jwt-authentication.guard.ts) |
| `[AllowAnonymous]` | [src/api/middleware/allow-anonymous.decorator.ts](src/api/middleware/allow-anonymous.decorator.ts) |
| ASP.NET model binding | [src/api/binding](src/api/binding) |
| `Program.cs` | [src/main.ts](src/main.ts) + [src/api/configure-app.ts](src/api/configure-app.ts) |
| `appsettings.json` + `IConfiguration` | `.env` + [src/config/app.config.ts](src/config/app.config.ts) |
| `HotelManagement.Tests/Reservations/ReservationOverlapTests.cs` | [test/reservations/reservation-overlap.spec.ts](test/reservations/reservation-overlap.spec.ts) |
| `HotelManagement.Tests/Common/TestDbContextFactory.cs` | [test/common/test-db-context.factory.ts](test/common/test-db-context.factory.ts) |
| NuGet + `.csproj` | npm + [package.json](package.json) |

---

## 2. Node.js fundamentals

### 2.1 One thread, one event loop

ASP.NET Core takes requests on a thread pool. Node.js runs all **your JavaScript on a single thread** and uses an *event loop*. While one request waits for the database, the thread serves other requests. That works only as long as nobody **blocks** the thread.

That is why the password hasher uses the **async** version of PBKDF2:

```ts
const pbkdf2Async = promisify(pbkdf2);
const subkey = await pbkdf2Async(password, salt, 100_000, 32, 'sha512');
```

`crypto.pbkdf2Sync` would freeze the whole server for about 100 ms on every login. The async version runs the hashing on libuv's background worker threads, and the event loop keeps serving other requests. Rule of thumb: **never use `*Sync` functions in request code.** → [password-hasher.service.ts](src/infrastructure/authentication/password-hasher.service.ts)

### 2.2 Promises and async/await

`Task<T>` in C# is `Promise<T>` in JavaScript, and `async`/`await` work almost identically. Differences worth remembering:

* There is no `CancellationToken` everywhere. Cancellation is rare in Node APIs (`AbortSignal` exists, but this project does not need it).
* `Promise.all([...])` is `Task.WhenAll`. The validation behavior uses it to run several validators at once.
* A Promise that nobody awaits does not crash the request; an unhandled rejection can crash the process. `void bootstrap();` in `main.ts` explicitly marks a promise we intentionally do not await.
* `promisify` converts old callback-style APIs (`fn(args, (err, result) => ...)`) into Promise-returning functions.

### 2.3 Built-in modules with the `node:` prefix

| Module | Used for |
| :--- | :--- |
| `node:crypto` | PBKDF2 hashing, `randomBytes`, `randomUUID`, `timingSafeEqual` |
| `node:async_hooks` | `AsyncLocalStorage`: per-request current user and per-transaction EntityManager |
| `node:http` | Listening for WebSocket `upgrade` events, `STATUS_CODES` |
| `node:fs` / `node:path` | Creating the SQLite data folder |
| `node:util` | `promisify` |

### 2.4 `Buffer`: working with bytes

The .NET hasher works on `byte[]`. In Node, the equivalent is `Buffer`. The ASP.NET Identity V3 hash header is built byte by byte:

```ts
header.writeUInt8(0x01, 0);           // format marker
header.writeUInt32BE(2, 1);           // PRF = HMAC-SHA512
header.writeUInt32BE(100_000, 5);     // iterations (big-endian, like .NET)
header.writeUInt32BE(16, 9);          // salt length
Buffer.concat([header, salt, subkey]).toString('base64');
```

Because the bytes match exactly, the Node backend verifies passwords created by the .NET backend. [test/authentication/password-hasher.spec.ts](test/authentication/password-hasher.spec.ts) checks this with a real hash from your database. `timingSafeEqual` compares hashes in constant time, so response times reveal nothing about how many bytes matched.

---

## 3. TypeScript on Node

### 3.1 Compiling

Node runs JavaScript, so TypeScript is compiled first (`nest build` → `dist/`). The [tsconfig.json](tsconfig.json) settings that matter most:

* `"module": "commonjs"`: classic Node modules. NestJS 11 uses CommonJS; NestJS 12 switched to native **ESM**, which is still awkward with Jest. This is why the project uses NestJS 11.
* `"experimentalDecorators"` and `"emitDecoratorMetadata"`: required for NestJS decorators (next section).
* `"strict": true`: null checks and no implicit `any`, comparable to C# nullable reference types.

### 3.2 How DI works without reflection, and why interfaces are abstract classes

C# DI reads constructor parameter types through runtime reflection. JavaScript erases types at compile time. With `emitDecoratorMetadata`, TypeScript **writes constructor parameter types into metadata** whenever the class has a decorator (`@Injectable()`, `@CommandHandler()`...). Nest reads that metadata to know what to inject.

The catch: **TypeScript interfaces do not exist at runtime**, so there is nothing to put in that metadata. `constructor(private readonly rooms: IRoomRepository)` cannot work if `IRoomRepository` is an `interface`.

The solution used throughout this project is to declare the "interfaces" as **abstract classes**. They exist at runtime, so they work as DI tokens, and implementations can still `implements` them:

```ts
export abstract class IRoomRepository {
  abstract getById(id: number): Promise<Room | null>;
}

@Injectable()
export class RoomRepository implements IRoomRepository { ... }

{ provide: IRoomRepository, useClass: RoomRepository }
```

The last line is exactly `services.AddScoped<IRoomRepository, RoomRepository>()`. Handlers in the Application layer depend only on `IRoomRepository` and never import TypeORM, the same dependency rule as your .NET solution. → [interfaces](src/application/common/interfaces), [infrastructure.module.ts](src/infrastructure/infrastructure.module.ts)

The `I` prefix is unusual in TypeScript, but it is kept here so the names match the .NET code one to one.

For values that are not classes, such as the configuration object, a `Symbol` token is used instead: `@Inject(APP_CONFIG) config: AppConfig`. → [app-config.module.ts](src/config/app-config.module.ts)

### 3.3 `import type`

`import type { Room } from './room'` imports only the type; it disappears from the compiled JavaScript. The domain entities use it to reference each other (Room ↔ Reservation) without creating **circular imports** at runtime.

---

## 4. npm and package.json

* `dependencies` are needed at runtime; `devDependencies` only for building and testing (TypeScript, Jest, the Nest CLI).
* `scripts` are your build/run commands: `npm run start:dev`, `npm test`, `npm run test:e2e`.
* Versions are **pinned exactly** (`"typeorm": "0.3.31"`, not `^0.3.31`), so `npm install` never silently upgrades. `package-lock.json` additionally locks every transitive dependency.
* `npm view <package> version peerDependencies` is how the NestJS 12 ESM switch and the `@nestjs/cqrs` 11 compatibility were checked before installing.

---

## 5. Clean Architecture with NestJS modules

Each .NET project became a **Nest module**, and [app.module.ts](src/app.module.ts) wires them together:

```ts
@Module({ imports: [AppConfigModule, InfrastructureModule, ApplicationModule, ApiModule] })
export class AppModule {}
```

| Module | Role | .NET equivalent |
| :--- | :--- | :--- |
| `InfrastructureModule` (`@Global`) | Binds every `I...` token to its implementation | `AddInfrastructureServices()` |
| `ApplicationModule` | Registers handlers, validators, behaviors and `IMediator` | `AddApplicationServices()` |
| `HubsModule` (`@Global`) | Provides `ISignalRNotificationService` | `AddSingleton<ISignalRNotificationService, ...>` in `Program.cs` |
| `ApiModule` | Controllers, global guard and interceptor | `AddControllers()` + middleware |

`@Global()` means "available everywhere without importing". This keeps the dependency direction clean: `ApplicationModule` never imports `InfrastructureModule`; it only asks for `IRoomRepository`, and the global module supplies it. That is the dependency-inversion principle, enforced by the container.

Providers are **singletons** by default (like `AddSingleton`). Per-request state, such as the current user and the current transaction, lives in `AsyncLocalStorage` instead (sections 8.3 and 9.4).

---

## 6. CQRS: commands, queries and a Mediator

### 6.1 `@nestjs/cqrs` is Nest's MediatR

| MediatR | `@nestjs/cqrs` |
| :--- | :--- |
| `record CreateRoomCommand(...) : IRequest<RoomDto>` | `class CreateRoomCommand extends Command<RoomDto>` |
| `IRequestHandler<CreateRoomCommand, RoomDto>` | `@CommandHandler(CreateRoomCommand)` + `ICommandHandler<CreateRoomCommand, RoomDto>` |
| `Task<RoomDto> Handle(...)` | `execute(command): Promise<RoomDto>` |
| `IRequest<List<RoomDto>>` for queries | `Query<RoomDto[]>` + `@QueryHandler` |

The `Command<RoomDto>` generic makes `send(command)` return `Promise<RoomDto>` automatically. The result type travels with the request, just like `IRequest<T>`. → [create-room.command.ts](src/application/commands/rooms/create-room.command.ts)

Each file holds the command **and** its handler, exactly like your .NET files.

### 6.2 The Mediator and its pipeline

`@nestjs/cqrs` has a `CommandBus` and a `QueryBus`, but no pipeline behaviors. A small `Mediator` adds them on top:

```ts
send<T>(request: Command<T> | Query<T>): Promise<T> {
  const dispatch = () => request instanceof Query ? this.queryBus.execute(request) : this.commandBus.execute(request);
  const pipeline = this.behaviors.reduceRight((next, behavior) => () => behavior.handle(request, next), dispatch);
  return pipeline();
}
```

`reduceRight` wraps the handler in each behavior, last behavior innermost. That is the "Russian doll" MediatR builds from `IPipelineBehavior<TRequest, TResponse>`. Adding a logging or caching behavior is now one class plus one line in [application.module.ts](src/application/application.module.ts). → [mediator.ts](src/application/common/mediator/mediator.ts)

Controllers stay thin dispatchers:

```ts
@Post()
create(@Body() command: CreateRoomCommand): Promise<RoomDto> {
  return this.mediator.send(command);
}
```

---

## 7. Validation: FluentValidation → class-validator

### 7.1 Validators are separate classes

In .NET, a validator is `AbstractValidator<CreateRoomCommand>` with `RuleFor(...)` rules. Here, a validator is a separate class whose **properties carry class-validator decorators**, linked to its request with `@ValidatorFor(...)`:

```ts
@ValidatorFor(CreateRoomCommand)
export class CreateRoomCommandValidator {
  @IsNotBlank({ message: 'Room number is required.' })
  @MaxLength(50, { message: 'Room number must not exceed 50 characters.' })
  roomNumber: string;

  @IsPositive({ message: 'Price per night must be greater than zero.' })
  pricePerNight: number;
}
```

The command itself stays a plain class, exactly like the C# record. → [validators](src/application/validators)

### 7.2 ValidationBehavior

[validation.behavior.ts](src/application/common/behaviors/validation.behavior.ts) does what your MediatR `ValidationBehavior` does:

1. Find the validators registered for `request.constructor`. This is the JS way to ask "what type is this object?", like `typeof(TRequest)`.
2. Copy the request onto each validator class (`plainToInstance`) and run `validate()`.
3. Throw `ValidationException` with errors grouped per property (`{ CheckOutDate: [...] }`), or call `next()`.

Validators are registered as a list in `application.module.ts`, the equivalent of `AddValidatorsFromAssembly`. The `@ValidatorFor` decorator stores its metadata with `Reflect.defineMetadata`, the same mechanism Nest uses for its own decorators.

### 7.3 Writing your own rules

`registerDecorator` creates reusable rules ([custom.validators.ts](src/application/common/validation/custom.validators.ts)):

* `@IsNotBlank()`: FluentValidation's `NotEmpty()`; rejects `"   "`.
* `@IsDateOnly()`: a real calendar date in `yyyy-MM-dd` (rejects `2026-02-30`).
* `@IsDateOnlyAfter('checkInDate')`: compares two properties, like `GreaterThan(x => x.CheckInDate)`.

---

## 8. The HTTP pipeline

### 8.1 Stages

```text
Request → Guard → Interceptor → Pipes (binding) → Controller → Mediator → Handler
                                                       ↘ Exception filter on any error
```

| Stage | ASP.NET equivalent | File |
| :--- | :--- | :--- |
| `JwtAuthenticationGuard` | JwtBearer + `[Authorize]` | [jwt-authentication.guard.ts](src/api/middleware/jwt-authentication.guard.ts) |
| `RequestContextInterceptor` | `IHttpContextAccessor` | [request-context.interceptor.ts](src/api/middleware/request-context.interceptor.ts) |
| `ModelBindingPipe` + query pipes | Model binding | [binding](src/api/binding) |
| `ExceptionHandlingFilter` | `ExceptionHandlingMiddleware` | [exception-handling.filter.ts](src/api/middleware/exception-handling.filter.ts) |

### 8.2 Secure by default with a global guard

The guard is registered globally (`APP_GUARD`), so every endpoint requires a token unless it is marked otherwise:

```ts
@AllowAnonymous()
@Post('login')
login(@Body() command: LoginCommand) { ... }
```

`@AllowAnonymous()` is `SetMetadata(...)`; the guard reads it back with `Reflector`. Forgetting the decorator gives a 401, whereas forgetting `[Authorize]` in .NET leaves an endpoint open, so this setup fails safe.

### 8.3 ICurrentUserService without HttpContext

In .NET, `CurrentUserService` reads `IHttpContextAccessor.HttpContext.User`. Node has no ambient HttpContext, so the interceptor creates one with `AsyncLocalStorage`:

```ts
return new Observable((subscriber) =>
  this.requestContext.run(() => {
    if (user) this.requestContext.setUser(user);
    return next.handle().subscribe(subscriber);
  }),
);
```

Everything the controller, mediator and handler await afterwards sees the same store, so `CurrentUserService.userId` works anywhere, even deep inside a handler. → [request-context.ts](src/infrastructure/services/request-context.ts)

Two subtle lessons:

* `next.handle()` returns a **lazy** Observable: the handler only runs when it is subscribed. Subscribing **inside** `run(...)` is what makes the handler execute inside the context.
* An Express middleware would have been the obvious place, but Express body parsing reads the request stream through events that can lose the async context. The interceptor runs after guards and parsing, so it avoids that problem.

The user ID always comes **from the verified JWT**. The e2e test sends `"createdBy": 999` in a request body and checks that it is ignored.

### 8.4 Model binding

ASP.NET binds `[FromBody] CreateRoomCommand` and `[FromQuery] decimal? minPrice` for you. In Nest:

* `ModelBindingPipe` turns the JSON body into a real `CreateRoomCommand` instance with `plainToInstance`. The instance matters: the Mediator routes by class, and the ValidationBehavior looks up validators by `request.constructor`.
* Query strings are always strings, so `OptionalNumberPipe`, `OptionalIntPipe` and `OptionalDateOnlyPipe` convert them. Malformed values produce the same message ASP.NET uses: `The value 'abc' is not valid for minPrice.`
* `IdParameterPipe` plays the role of the `{id:int}` route constraint (non-numeric IDs give 404).

One difference: Nest stops at the first failing pipe, while ASP.NET collects every binding error.

### 8.5 Exceptions

Handlers throw `ValidationException`, `NotFoundException`, `ConflictException` and `UnauthorizedAccessException` from [application/common/exceptions](src/application/common/exceptions), with the same names as in .NET. They know nothing about HTTP. The `@Catch()` filter maps them to 400/404/409/401 with the same JSON shape as your middleware.

Nest also has classes called `NotFoundException` and `ConflictException` (in `@nestjs/common`). Because the application exceptions keep the .NET names, watch your imports: the Application layer must import its own exceptions, never Nest's.

---

## 9. Data access with TypeORM

### 9.1 Domain entities stay pure; mapping lives in Infrastructure

The domain classes are plain TypeScript, with no decorators and no ORM imports, like your EF-free Domain project:

```ts
export class Room {
  id: number;
  roomNumber = '';
  pricePerNight = 0;
  reservations?: Reservation[];
}
```

The mapping is an `EntitySchema` in Infrastructure, the counterpart of `IEntityTypeConfiguration<Room>`:

```ts
export const RoomConfiguration = new EntitySchema<Room>({
  name: 'Room',
  target: Room,
  tableName: 'Rooms',
  columns: {
    roomNumber: { name: 'RoomNumber', type: 'nvarchar', length: 50 },
    pricePerNight: { name: 'PricePerNight', type: 'decimal', precision: 18, scale: 2, transformer: decimalTransformer },
  },
  indices: [{ name: 'IX_Rooms_RoomNumber', columns: ['roomNumber'], unique: true }],
});
```

`target: Room` makes TypeORM return real `Room` instances. The explicit table, column, index and foreign-key names reproduce the EF Core schema exactly, so both backends can share one database. → [configurations](src/infrastructure/persistence/configurations)

### 9.2 Repositories and the QueryBuilder

LINQ becomes a fluent SQL builder. In condition strings, `alias.property` is rewritten to the real column name:

```ts
this.reservations.createQueryBuilder('r')
  .where('r.roomId = :roomId', { roomId })
  .andWhere('r.status <> :cancelled', { cancelled: ReservationStatus.Cancelled })
  .andWhere('r.checkInDate < :checkOut', { checkOut })
  .andWhere('r.checkOutDate > :checkIn', { checkIn })
  .getCount();
```

The `:name` placeholders become **SQL parameters**, never string concatenation, so SQL injection is not possible. The search also escapes `%` and `_` (`50%_Guest` matches literally), and the availability search uses a correlated `NOT EXISTS` subquery, the SQL that EF generated for `!r.Reservations.Any(...)`. → [repositories](src/infrastructure/persistence/repositories)

As in .NET, the report calculations (pro-rated revenue, occupancy) live in `ReportRepository`, and the query handlers just delegate. → [report.repository.ts](src/infrastructure/persistence/repositories/report.repository.ts)

### 9.3 Migrations: SQL Server vs SQLite

* With SQL Server, `migrationsRun: true` applies [the migration](src/infrastructure/persistence/migrations/1756836554000-InitialSchema.ts) at startup (like `Database.MigrateAsync()`). It is **idempotent** (`IF OBJECT_ID(...) IS NULL`): on your existing EF database it changes nothing.
* With SQLite, `synchronize: true` builds tables straight from the mappings. That is convenient for development and tests, but **never use it in production**, because it can drop columns.

### 9.4 IUnitOfWork without a scoped DbContext

In .NET, the scoped `DbContext` carries the transaction implicitly. Here, `AsyncLocalStorage` carries the transactional `EntityManager`:

```ts
executeTransaction<T>(action: () => Promise<T>): Promise<T> {
  return this.dataSource.transaction((manager) => this.storage.run(manager, action));
}

get manager(): EntityManager {
  return this.storage.getStore() ?? this.dataSource.manager;
}
```

Every repository asks `unitOfWork.manager`, so it automatically joins the current transaction. If anything throws, everything rolls back; [reservation-overlap.spec.ts](test/reservations/reservation-overlap.spec.ts) proves this by making the audit-log insert fail.

One difference from EF: TypeORM's `save()` writes immediately; there is no change tracker waiting for `SaveChangesAsync()`. That is why `IUnitOfWork` here only has `executeTransaction`.

### 9.5 Pessimistic locking

Two clerks booking the same room at the same moment could both pass the overlap check in the .NET version. Inside the transaction, `getByIdForUpdate` locks the room row first (`WITH (UPDLOCK, ROWLOCK)` on SQL Server), so the second booking waits, then sees the overlap and gets a 409.

---

## 10. JavaScript pitfalls handled in this project

### 10.1 There is no `DateOnly`, and `Date` is an instant

A JS `Date` is a point in time, not a calendar day. `new Date('2026-09-01')` is midnight **UTC**, which is still August 31 in some timezones, and database drivers convert dates with the server's timezone. Calendar dates therefore stay **strings** (`'2026-09-01'`) end to end. ISO strings even compare correctly with `<` and `>`. → [date-only.ts](src/domain/common/date-only.ts)

Reading TypeORM's source (`node_modules/typeorm/driver/sqlserver/SqlServerDriver.js`) showed it converts `date` columns using local time. The mapping therefore declares them as `varchar(10)` and lets SQL Server convert the string. → [value-transformers.ts](src/infrastructure/persistence/configurations/value-transformers.ts)

### 10.2 There is no `decimal`

JavaScript numbers are binary floats: `3 * 85.1 === 255.29999999999998`. Money is rounded to 2 decimals. → [money.ts](src/application/common/utils/money.ts)

### 10.3 `Object.assign(new Room(), {...})`

C# object initializers (`new Room { RoomNumber = "101" }`) have no exact JS equivalent. `Object.assign(new Room(), { roomNumber: '101' })` creates a real `Room` instance (with its defaults) and then copies the values in. Commands accept an `init` object for the same reason: `new CreateReservationCommand({ roomId: 1, guestName: 'Guest', ... })` reads like C# named arguments.

---

## 11. Authentication

* **JWT**: `@nestjs/jwt` signs with HS256 and uses the same key, issuer, audience and claim names (`sub`, `nameid`, `email`, `unique_name`) as .NET. Generating ([jwt-token-generator.ts](src/infrastructure/authentication/jwt-token-generator.ts)) and validating ([jwt-token-validator.ts](src/infrastructure/authentication/jwt-token-validator.ts)) are separate classes; validation is used by both the HTTP guard and the SignalR hub.
* **Password hashing**: the ASP.NET Core Identity V3 format, reimplemented with `crypto.pbkdf2` (section 2.4).
* **Login errors** return the same `Validation Failed` shape as .NET, and never reveal whether the email or the password was wrong.

---

## 12. Real-time: implementing the SignalR protocol yourself

ASP.NET gives you SignalR for free; Node has no SignalR server. The protocol is documented and simple, so it is implemented in [api/hubs/signalr](src/api/hubs/signalr), which keeps the Angular `@microsoft/signalr` client working unchanged:

1. **Negotiate**: the client `POST`s `/hubs/reservations/negotiate` with its JWT and gets a `connectionToken`. → [reservation-hub.controller.ts](src/api/hubs/reservation-hub.controller.ts)
2. **WebSocket upgrade**: the browser opens `ws://.../hubs/reservations?id=<token>&access_token=<jwt>`. Node's HTTP server emits an `upgrade` event; the hub validates both values and hands the socket to the `ws` library.
3. **Handshake**: the client sends `{"protocol":"json","version":1}\x1e`, the server answers `{}\x1e`.
4. **Messages** are JSON terminated by the ASCII record separator `\x1e`. One WebSocket frame can hold several messages, or part of one, so the hub buffers and splits them.
5. **Keep-alive**: both sides send `{"type":6}` pings every 15 seconds. Without them, the client drops the connection after 30 seconds.
6. **Broadcast**: `{"type":1,"target":"reservationCreated","arguments":[dto]}` is sent to every connection, the equivalent of `Clients.All.SendAsync(...)`.

A browser can only pass the token in the query string, but the Node SignalR client sends an `Authorization` header. The hub accepts both, like ASP.NET does.

[SignalRNotificationService](src/api/hubs/signalr-notification.service.ts) implements `ISignalRNotificationService`, and handlers call it **only after the transaction commits**.

---

## 13. Testing

| Concept | xUnit / .NET | Jest / Node |
| :--- | :--- | :--- |
| Test runner | xUnit `[Fact]` | Jest `it(...)` inside `describe(...)` |
| Mocks | `new Mock<ISignalRNotificationService>()` | `jest.fn()` / `jest.spyOn()` |
| Verify a call | `Verify(s => s.X(1), Times.Once)` | `expect(mock.x).toHaveBeenCalledTimes(1)` |
| Expect an exception | `Assert.ThrowsAsync<ConflictException>` | `await expect(p).rejects.toBeInstanceOf(ConflictException)` |
| In-memory database | EF Core InMemory | sql.js (real SQLite compiled to WebAssembly) |
| Test DB factory | `TestDbContextFactory.Create(...)` | `createTestDbContext()` |
| HTTP integration tests | `WebApplicationFactory` | `app.listen(0)` + `supertest` |

The unit tests are written the **same way as yours**: the handler is constructed with `new`, given real repositories over an in-memory database, plus mocks for `ICurrentUserService` and `ISignalRNotificationService`:

```ts
handler = new CreateReservationCommandHandler(
  context.rooms, context.reservations, context.users, context.auditLogs,
  context.unitOfWork, mockCurrentUser(userId), signalR,
);
```

Test names follow the .NET convention (`CreateReservation_WhenDatesAreAdjacent_SucceedsAndCalculatesTotal`). Highlights:

* All 8 xUnit tests are ported: [reservation-overlap.spec.ts](test/reservations/reservation-overlap.spec.ts), [reservation-cancellation.spec.ts](test/reservations/reservation-cancellation.spec.ts), [room-deletion.spec.ts](test/rooms/room-deletion.spec.ts).
* Extra tests cover transaction rollback, reports, the validation pipeline ([validation-behavior.spec.ts](test/validation/validation-behavior.spec.ts)), password-hash compatibility and the SignalR protocol.
* The e2e test drives the whole app over HTTP and uses **Microsoft's official SignalR client** to check that one user receives another user's events. → [test/e2e/app.e2e-spec.ts](test/e2e/app.e2e-spec.ts)

Current result: **39 unit tests and 13 e2e tests pass.**

---

## 14. Configuration and environments: Node best practices

### 14.1 The rule: configuration lives in the environment

.NET teaches you to layer JSON files: `appsettings.json` → `appsettings.Production.json` → environment variables. The Node world follows the **Twelve-Factor App** rule instead: *the code is the same everywhere, and everything that differs between deployments comes from environment variables.*

| Practice | Why |
| :--- | :--- |
| `.env` is for **local development only**, and is git-ignored | It is a convenience for your machine, not a deployment mechanism. Committed `.env` files are one of the most common ways secrets leak to GitHub. |
| `.env.example` is committed | It documents every variable without containing secrets. |
| In production, **no file is read**; the platform injects variables | Docker, Kubernetes, Azure App Service and CI pipelines all have a secure way to inject secrets. |
| A real environment variable **always wins** over `.env` | You can override anything without editing files. Node's built-in loader already behaves this way (verified in this project). |

`NODE_ENV` itself never comes from a file: a file shouldn't decide which environment it is in. The npm scripts set it, through `cross-env` because `NODE_ENV=production node ...` does not work in Windows `cmd`. → [package.json](package.json)

### 14.2 Only three values for NODE_ENV

Use `development`, `test` and `production`, nothing else. Libraries such as Express check `NODE_ENV === 'production'` to enable optimizations, so a value like `staging` silently runs those libraries in development mode. A staging server is deployed with `NODE_ENV=production` plus **different variables** (another database, another CORS origin).

When `NODE_ENV` is missing, this app assumes **production**, like ASP.NET Core does. Forgetting the variable then gives you the strict mode (fails fast) instead of the permissive one (demo keys, Swagger open). Secure defaults are a habit worth keeping.

### 14.3 Validate everything at startup with a schema

Environment variables are untyped strings, and `process.env.PORT` might be `"eighty"`. Instead of reading `process.env` all over the code, the app parses it **once** with **zod**, the de facto schema library of the TypeScript ecosystem → [env.schema.ts](src/config/env.schema.ts):

```ts
PORT: z.coerce.number().int().min(1).max(65_535).default(5001),
DB_ENCRYPT: z.stringbool().optional(),
NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
```

`superRefine` adds the production-only rules: `JWT_KEY` is required, at least 32 bytes, and must not be the public demo key; `CORS_ALLOWED_ORIGINS` and `DB_PASSWORD` are required. The result is converted to a typed `AppConfig` object, the only thing the rest of the app sees. → [app.config.ts](src/config/app.config.ts)

**Fail fast**: if the config is invalid, the process prints every problem at once and exits with code 1 before opening any connection:

```text
Invalid environment configuration:
✖ is required in production
  → at JWT_KEY
✖ is required in production
  → at CORS_ALLOWED_ORIGINS
```

That is much better than a server that starts and then fails on the first login. The orchestrator sees the crash immediately and the deployment is rolled back. → [main.ts](src/main.ts)

### 14.4 Environment-specific behaviour from settings, not from `if (production)` everywhere

The code never asks "am I in production?" in random places. Each behaviour has its own setting, and the environment only chooses its **default**:

| Setting | development default | production default |
| :--- | :--- | :--- |
| `SWAGGER_ENABLED` | `true` | `false` |
| `LOG_FORMAT` / `LOG_LEVEL` | `pretty` / `debug` | `json` / `log` |
| `DB_ENCRYPT` / `DB_TRUST_SERVER_CERTIFICATE` | `false` / `true` | `true` / `false` |

So you can temporarily enable Swagger on a staging server (`SWAGGER_ENABLED=true`) without touching the code, and each behaviour can be tested on its own. → [test/config/app-config.spec.ts](test/config/app-config.spec.ts)

### 14.5 Structured logs in production

In development you read logs with your eyes; in production, machines read them. Nest 11's `ConsoleLogger` can print **one JSON object per line**:

```json
{"level":"log","pid":7092,"timestamp":1792454520274,"message":"Starting Nest application...","context":"NestFactory"}
```

Log platforms (Azure Monitor, Datadog, ELK, Loki) parse that directly, so you can filter by `level` or `context`. → [logger.factory.ts](src/config/logger.factory.ts)

### 14.6 Tests never depend on your machine

`test/setup-env.ts` runs before every test file (Jest `setupFiles`) and sets fixed values: in-memory SQLite, a test-only JWT key, quiet logs. In `test` mode the app never reads `.env`, so a developer whose `.env` points at a real SQL Server cannot accidentally run the e2e tests against it. → [test/setup-env.ts](test/setup-env.ts)

### 14.7 Fewer dependencies, when the platform already does it

Node 20.12+ can read `.env` files itself with `process.loadEnvFile()`, so the project no longer needs `dotenv` or `@nestjs/config`. Every dependency is code you have to trust, update and audit. → [load-environment.ts](src/config/load-environment.ts)

`@nestjs/config` is still a fine choice when you want `ConfigService.get('...')` injection or per-module configuration namespaces. Choose it deliberately, not by default.

### 14.8 Supply-chain hygiene

When `zod` was added, the latest release was only 8 days old, so the project uses `4.6.4`, which had been out for five weeks. Habits worth adopting:

* Pin exact versions and commit `package-lock.json`; use `npm ci` (not `npm install`) on build servers so they install exactly the lockfile.
* Let new releases age a little before adopting them; most broken or malicious versions are caught within days.
* Run `npm audit` regularly and read the advisories before running `npm audit fix --force` (it can apply breaking upgrades).

A practical lesson from your machine: the Node SQL Server driver connects **only over TCP**, while .NET used shared memory. Your instance has TCP/IP disabled, so the local `.env` uses SQLite until you enable it (see [README.md](README.md#using-sql-server)).

---

## 15. Teacher's notes: what idiomatic Node code looks like

This project deliberately mirrors your .NET solution so you can compare the two side by side. When you join a Node team, you will meet some conventions that differ from what is here. Know both:

| In this project | What most NestJS codebases do | Notes |
| :--- | :--- | :--- |
| `IRoomRepository` abstract class | `abstract class RoomRepository` + `class TypeOrmRoomRepository extends RoomRepository` | The `I` prefix is a C# convention; TypeScript style guides avoid it. Abstract classes as DI tokens are idiomatic. |
| Custom `IMediator` over `@nestjs/cqrs` | Inject `CommandBus` / `QueryBus` directly, or skip CQRS and use services | Many Nest apps have plain `RoomsService` classes (like the first version of this project). CQRS pays off in large domains. |
| Separate validator classes | class-validator decorators directly on request DTOs + the global `ValidationPipe` | The DTO approach is the Nest default and needs less code. |
| Folders by layer (`domain/`, `application/`, ...) | Folders by **feature module** (`rooms/`, `reservations/`), sometimes with layers inside each | By-feature scales better when many people work on different features. |

Things in this project that are idiomatic everywhere: kebab-case file names with role suffixes (`rooms.controller.ts`), constructor injection, guards/interceptors/filters for cross-cutting concerns, async I/O everywhere, typed and validated configuration, and tests at both unit and e2e level.

### Best practices this project does not have yet (your next lessons)

| Topic | Tool | Why |
| :--- | :--- | :--- |
| Linting and formatting | ESLint (`typescript-eslint`) + Prettier | Catches bugs such as floating promises, and stops style debates. Every serious Node project has them. |
| Security headers | `helmet` | One line adds HSTS, `X-Content-Type-Options`, etc. |
| Rate limiting | `@nestjs/throttler` | Slows down brute-force login attempts. |
| Health checks | `@nestjs/terminus` | `/health` endpoints for load balancers and Kubernetes probes. |
| Containerization | Multi-stage `Dockerfile`, `node:24-alpine`, non-root user, `npm ci --omit=dev` | Small, reproducible and safer production images. |
| CI pipeline | GitHub Actions: `npm ci` → lint → typecheck → test → build | Every push is verified automatically. |
| Node version | `.nvmrc` / `engines` + an LTS release | Everyone, including CI, uses the same Node version. |

---

## 16. Exercises to go further

1. **Add a query end to end**: `GetRoomReservationsQuery` + handler + a `GET /api/rooms/:id/reservations` action. You will touch the Application interface, the Infrastructure repository and the API controller, the full Clean Architecture flow.
2. **Add a pipeline behavior**: write a `LoggingBehavior` that logs each request name and duration, and register it in `PIPELINE_BEHAVIORS` before `ValidationBehavior`.
3. **Role-based access**: add a `Role` column, put it in the JWT, and write a `@Roles('Admin')` decorator and a `RolesGuard` that protect room deletion (section 8.2 shows the pattern).
4. **Domain events**: `@nestjs/cqrs` also has an `EventBus`. Publish a `ReservationCreatedEvent` from the handler, and move the SignalR broadcast into an `@EventsHandler`.
5. **Concurrency test**: fire 10 parallel `POST /api/reservations` for the same room and dates with `Promise.all`, and verify that exactly one succeeds (needs SQL Server, where the row lock is used).
6. **Rate limiting**: add `@nestjs/throttler` to the login endpoint to slow down password guessing.
