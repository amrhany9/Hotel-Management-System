# Hotel Management API — Node.js / NestJS

A Node.js port of the ASP.NET Core backend in [`../backend`](../backend), built with **NestJS 11**, **TypeORM**, and a built-in **SignalR-compatible WebSocket hub**.

It is a drop-in replacement: same routes, same JSON shapes, same error format, same port (`5001`), same JWT settings and the same SignalR events, so the Angular app in [`../frontend`](../frontend) works without any change.

## Requirements

* Node.js 20+ (tested on Node 24.17)
* One of:
  * **SQL Server** with TCP/IP enabled (`DB_TYPE=mssql`), or
  * nothing at all: **SQLite** file database (`DB_TYPE=sqlite`)

## Quick start

```powershell
cd backend-node
npm install
copy .env.example .env      # local development settings (DB_TYPE=sqlite needs no setup)
npm run start:dev
```

| Service | URL |
| :--- | :--- |
| API | `http://localhost:5001/api` |
| Swagger UI | `http://localhost:5001/swagger` |
| SignalR hub | `http://localhost:5001/hubs/reservations` |

On startup the database schema is created (if missing) and seeded with the same demo data as the .NET backend:

* `admin@hotel.local` / `Admin123!`
* `staff@hotel.local` / `Staff123!`

> Run either this backend or the .NET backend, not both: they use the same port.

## Scripts

| Command | Environment | Description |
| :--- | :--- | :--- |
| `npm run start:dev` | development | Run with auto-reload |
| `npm run start:debug` | development | Auto-reload + debugger on port 9229 |
| `npm run build` | – | Compile to `dist/` |
| `npm run start:prod` | production | Run the compiled app |
| `npm test` | test | Unit tests (handlers run with real repositories on an in-memory database, like the xUnit tests) |
| `npm run test:e2e` | test | End-to-end tests over HTTP, including the official `@microsoft/signalr` client |
| `npm run typecheck` | – | TypeScript type check |

## Environments and configuration

The environment is selected by `NODE_ENV`, which the npm scripts set (via `cross-env`, so it works on Windows too). It plays the role of `ASPNETCORE_ENVIRONMENT`, and like ASP.NET Core it **defaults to `production`** when nothing is set.

| | development | test | production |
| :--- | :--- | :--- | :--- |
| Settings come from | `.env` file + environment variables | `test/setup-env.ts` | **environment variables only** (`.env` is ignored) |
| Missing secrets | Development defaults are used | Fixed test values | **Startup is refused** with a list of what is missing |
| Swagger | on | – | off |
| Logs | colored text, `debug` level | `error` level | one JSON object per line, `log` level |
| SQL Server TLS | `encrypt=false`, trust any certificate | – | `encrypt=true`, certificate must be valid |
| CORS default | `http://localhost:4200` | – | must be set explicitly |

Environment variables always win over `.env`, so any setting can be overridden on the command line or by the hosting platform. Every value is validated at startup ([src/config/env.schema.ts](src/config/env.schema.ts)): a typo like `PORT=eighty` stops the app with a clear message instead of failing later.

### Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `5001` | HTTP port |
| `CORS_ALLOWED_ORIGINS` | dev: `http://localhost:4200` · prod: **required** | Comma-separated list of allowed origins |
| `DB_TYPE` | `mssql` | `mssql` or `sqlite` |
| `DB_HOST` / `DB_PORT` | `localhost` / `1433` | SQL Server address |
| `DB_INSTANCE` | *(empty)* | Named instance; requires the SQL Server Browser service |
| `DB_USER` / `DB_NAME` | `sa` / `HotelManagementDb` | SQL Server login and database |
| `DB_PASSWORD` | prod: **required** for `mssql` | SQL Server password |
| `DB_ENCRYPT` / `DB_TRUST_SERVER_CERTIFICATE` | dev: `false` / `true` · prod: `true` / `false` | TLS settings |
| `DB_POOL_MAX` | `10` | Connection pool size |
| `DB_LOGGING` | `false` | Log SQL statements |
| `SQLITE_PATH` | `data/hotel.sqlite` | SQLite file (`:memory:` for a throwaway database) |
| `JWT_KEY` | dev: the demo key from `appsettings.json` · prod: **required**, ≥ 32 bytes, not the demo key | Token signing key |
| `JWT_ISSUER` / `JWT_AUDIENCE` / `JWT_EXPIRY_MINUTES` | same as `appsettings.json` | Token settings |
| `LOG_LEVEL` | dev: `debug` · test: `warn` · prod: `log` | `fatal`, `error`, `warn`, `log`, `debug` or `verbose` |
| `LOG_FORMAT` | dev: `pretty` · prod: `json` | Log output format |
| `SWAGGER_ENABLED` | dev: `true` · prod: `false` | Override Swagger availability |

### Running in production

Provide the secrets as real environment variables (in Docker, Kubernetes, Azure App Service, IIS, a systemd unit, ...), never in a file that is deployed with the code. To try production mode locally in PowerShell:

```powershell
npm run build
$env:JWT_KEY = "<a random secret of at least 32 characters>"
$env:CORS_ALLOWED_ORIGINS = "http://localhost:4200"
$env:DB_PASSWORD = "P@ssw0rd"
npm run start:prod
```

### Using SQL Server

The Node.js driver (`tedious`) connects **over TCP only**; it cannot use the shared-memory connection that `Server=AMR\MSSQLSERVER2022` uses from .NET. To use SQL Server:

1. Open **SQL Server Configuration Manager** → *SQL Server Network Configuration* → *Protocols for MSSQLSERVER2022*.
2. Enable **TCP/IP**, and under *IP Addresses* → *IPAll* set **TCP Port** to `1433` (clear *TCP Dynamic Ports*).
3. Restart the SQL Server service.
4. Set `DB_TYPE=mssql`, `DB_HOST=localhost` and `DB_PORT=1433` in `.env`.

Alternatively, keep dynamic ports, start the **SQL Server Browser** service and set `DB_INSTANCE=MSSQLSERVER2022`.

**Sharing the database with the .NET backend**: the tables, columns, indexes and foreign keys are identical to the EF Core migration, and passwords use the ASP.NET Core Identity V3 hash format. Both backends can therefore work on the same `HotelManagementDb`:

* On an existing EF Core database, the TypeORM migration detects the tables and changes nothing (it only adds TypeORM's own `migrations` table).
* On an empty database, it creates the schema **and** registers the EF Core migration in `__EFMigrationsHistory`, so the .NET backend can start on it too.
* Users registered through one backend can log in through the other. Tokens are interchangeable because the key, issuer, audience and claims are the same.

## Project structure

The layout mirrors the .NET Clean Architecture solution folder by folder:

```text
backend-node/
├── src/
│   ├── main.ts                         # Program.cs: create app, Swagger, listen
│   ├── app.module.ts                   # Wires Config, Infrastructure, Application and Api
│   ├── config/                         # appsettings.json equivalent (typed .env configuration)
│   │
│   ├── domain/                         # HotelManagement.Domain (no framework dependencies)
│   │   ├── entities/                   # User, Room, Reservation, AuditLog (plain classes)
│   │   ├── enums/                      # ReservationStatus
│   │   └── common/                     # DateOnly helpers
│   │
│   ├── application/                    # HotelManagement.Application
│   │   ├── commands/                   # auth/, reservations/, rooms/  (command + handler per file)
│   │   ├── queries/                    # audit-logs/, reports/, reservations/, rooms/
│   │   ├── dtos/                       # audit-logs/, auth/, reports/, reservations/, rooms/
│   │   ├── validators/                 # auth/, reports/, reservations/, rooms/
│   │   ├── common/
│   │   │   ├── behaviors/              # ValidationBehavior (pipeline)
│   │   │   ├── exceptions/             # ValidationException, NotFoundException, ConflictException, ...
│   │   │   ├── interfaces/             # ICurrentUserService, IJwtTokenGenerator, IPasswordHasherService, ...
│   │   │   │   └── repositories/       # IRoomRepository, IReservationRepository, IUnitOfWork, ...
│   │   │   ├── mediator/               # IMediator (MediatR equivalent, on top of @nestjs/cqrs)
│   │   │   └── validation/             # Custom validators, @ValidatorFor
│   │   └── application.module.ts       # DependencyInjection.AddApplicationServices()
│   │
│   ├── infrastructure/                 # HotelManagement.Infrastructure
│   │   ├── authentication/             # JwtTokenGenerator, JwtTokenValidator, PasswordHasherService
│   │   ├── persistence/
│   │   │   ├── configurations/         # EntitySchema mappings (IEntityTypeConfiguration equivalent)
│   │   │   ├── migrations/             # Idempotent SQL Server schema migration
│   │   │   ├── repositories/           # Repository implementations + UnitOfWork
│   │   │   └── seed/                   # HotelDbSeeder
│   │   ├── services/                   # CurrentUserService, RequestContext
│   │   └── infrastructure.module.ts    # DependencyInjection.AddInfrastructureServices()
│   │
│   └── api/                            # HotelManagement.API
│       ├── controllers/                # Auth, Rooms, Reservations, Reports, AuditLogs
│       ├── hubs/                       # ReservationHub, SignalRNotificationService, SignalR protocol
│       ├── middleware/                 # Exception handling, JWT guard, [AllowAnonymous], request context
│       ├── binding/                    # Model binding: body → command, query string → typed values
│       └── configure-app.ts            # Program.cs pipeline (CORS, prefix, filters, Swagger)
│
└── test/                               # HotelManagement.Tests
    ├── common/                         # TestDbContextFactory (in-memory database) + mocks
    ├── reservations/                   # ReservationOverlapTests, ReservationCancellationTests
    ├── rooms/                          # RoomDeletionTests, RoomManagementTests
    ├── reports/  validation/  authentication/  hubs/
    └── e2e/                            # Full HTTP + SignalR end-to-end tests
```

A request flows like this:

```text
HTTP → JwtAuthenticationGuard → RequestContextInterceptor → Controller
     → IMediator.send(command) → ValidationBehavior → CommandHandler → IRepository / IUnitOfWork
     → ISignalRNotificationService (after commit) → ExceptionHandlingFilter on errors
```

## Behaviour parity with the .NET backend

| Topic | Implementation |
| :--- | :--- |
| Overlap rule | Half-open interval `existing.checkIn < new.checkOut && existing.checkOut > new.checkIn`; cancelled bookings never block |
| Booking transaction | Room row is locked (`UPDLOCK, ROWLOCK` on SQL Server), overlap re-checked, reservation + audit log written, then commit. The SignalR event is sent **only after commit** |
| Totals | Calculated server-side (`nights × pricePerNight`) |
| Current user | Taken from the JWT, never from the request body |
| Errors | `{ status, title, detail }`, or `{ status: 400, title: "Validation Failed", errors: { Field: [...] } }` |
| SignalR | `/hubs/reservations` with negotiate + WebSockets + JSON hub protocol; events `reservationCreated`, `reservationCancelled`, `roomCreated`, `roomUpdated`, `roomDeleted` |

Differences you may notice:

* Report revenue values are rounded to 2 decimals (.NET returned full `decimal` precision for pro-rated amounts).
* Timestamps end with `Z` (for example `2026-09-02T21:59:42.724Z`), so the UTC timezone is explicit.
* Room-number uniqueness, room creation and room updates run inside a transaction together with their audit log.
* The SignalR hub offers the WebSockets transport only (no long-polling fallback).
* When several query-string values are malformed, only the first binding error is reported (ASP.NET lists them all).
