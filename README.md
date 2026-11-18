# Hotel Management System

A full-stack front-desk system for small and mid-size hotels: bookings, check-in and check-out, guest profiles, payments, printable invoices, reports and a full audit trail, with live updates between staff screens and a complete Arabic (RTL) interface.

**Stack:** ASP.NET Core 8 Web API · Angular 22 · Entity Framework Core (SQL Server) · SignalR · MediatR (CQRS) · FluentValidation · xUnit · Docker

---

## Features

| Area | What it does |
| :--- | :--- |
| **Reservations** | Book a room with live price calculation and double-booking protection. Each booking stores a nightly-rate snapshot, so later price changes don't affect existing bookings. |
| **Stay workflow** | Confirmed → **Checked in** → **Checked out**, plus **No-show** and **Cancelled**. Each step has rules: no check-in before the arrival date, no check-out while money is owed, and only confirmed bookings can be cancelled. |
| **Guests** | Guest profiles with phone, email and ID/passport number. Returning guests are recognised by phone number when booking, and the guest directory shows stays and total paid. |
| **Payments** | Record cash, card or bank-transfer payments (with an optional reference number). The balance is always visible, and overpayments are rejected. |
| **Invoices** | Printable invoice (pro-forma until check-out) that can be saved as PDF from the browser. |
| **Roles** | **Admin**: rooms, staff accounts, reports, audit log. **Front Desk**: bookings, check-in/out, payments, guests. Enforced in the API, not just hidden in the UI. |
| **Dashboard** | Today's arrivals and departures, guests in-house, outstanding balances, occupancy and payments this month. |
| **Reports** | Top rooms, revenue by room type, occupancy per room for any date range. |
| **Audit log** | Every booking, payment, status change, room and staff change is recorded with who did it and when. |
| **Live updates** | SignalR pushes changes to every open screen, with toast notifications. |
| **Arabic / English** | Full translation with right-to-left layout. |
| **Demo mode** | Realistic sample data dated around today, reset automatically every night. |

## Demo accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@hotel.local` | `Admin123!` |
| Front Desk | `staff@hotel.local` | `Staff123!` |

The login page has one-click buttons for both accounts when demo mode is on (and always in development).

---

## Running locally

### Requirements

- .NET 8 SDK (or a newer SDK targeting `net8.0`)
- Node.js 22+ and npm
- SQL Server or SQL Server LocalDB

### 1. Configure secrets

Secrets are **not** stored in the repository. Set them with .NET user secrets:

```powershell
cd backend
dotnet user-secrets set "Jwt:Key" "<a random string of at least 32 characters>" --project HotelManagement.API
```

The development connection string points to LocalDB (`appsettings.Development.json`). To use another SQL Server instance, override it:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=.;Database=HotelManagementDb;Trusted_Connection=True;TrustServerCertificate=True" --project HotelManagement.API
```

### 2. Run the API

```powershell
cd backend
dotnet run --project HotelManagement.API --launch-profile http
```

The API listens on `http://localhost:5001` (Swagger at `/swagger`). It applies migrations and loads sample data on first start.

To regenerate the sample data around today's date, drop the database and start the API again:

```powershell
dotnet tool restore
dotnet dotnet-ef database drop --project HotelManagement.Infrastructure --startup-project HotelManagement.API
```

### 3. Run the frontend

```powershell
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

### Tests

```powershell
cd backend
dotnet test HotelManagement.Tests
```

39 tests cover double-booking protection, the check-in / check-out / no-show / cancellation rules, payment limits and validation, returning-guest matching, room deletion guards and staff account rules.

---

## Configuration

All settings can be set in `appsettings.json`, user secrets, or environment variables (use `__` instead of `:` for environment variables, e.g. `Hotel__Currency`).

| Setting | Default | Purpose |
| :--- | :--- | :--- |
| `ConnectionStrings:DefaultConnection` | *(required)* | SQL Server connection string |
| `Jwt:Key` | *(required, 32+ chars)* | JWT signing key |
| `Hotel:Name`, `Address`, `Phone`, `Email` | Grand Horizon Hotel | Shown in the app and on invoices |
| `Hotel:Currency` | `USD` | ISO currency code used for all amounts |
| `Hotel:TimeZone` | `UTC` | Time zone that decides "today" for arrivals, check-in and no-shows (e.g. `Africa/Cairo`) |
| `Demo:Enabled` | `false` | Resets sample data on startup and every night |
| `Demo:DailyResetHourUtc` | `3` | Hour (UTC) of the nightly reset |
| `Cors:AllowedOrigins` | `[]` | Only needed when the frontend is served from a different origin |

---

## Deployment (Docker)

`docker-compose.yml` runs four containers: SQL Server Express, the API, the Angular app served by nginx (which also proxies `/api` and the SignalR hub), and Caddy for automatic HTTPS.

1. Get a Linux server with Docker installed (SQL Server needs **at least 2 GB of RAM**; 4 GB is comfortable).
2. Point your domain's DNS `A` record at the server.
3. Copy `.env.example` to `.env` and fill in `DOMAIN`, a strong `DB_PASSWORD` and a random `JWT_KEY`.
4. Start everything:

```bash
docker compose up -d --build
```

Caddy requests the HTTPS certificate automatically. With `DEMO_MODE=true`, the sample data resets every night so public visitors always see a clean, realistic hotel.

---

## Architecture

```text
backend/
├── HotelManagement.Domain/          Entities (Room, Guest, Reservation, Payment, User, AuditLog) and enums
├── HotelManagement.Application/     CQRS commands and queries, validators, DTOs, repository interfaces
├── HotelManagement.Infrastructure/  EF Core, repositories, migrations, JWT, clock, seeding, demo reset
├── HotelManagement.API/             Controllers, SignalR hub, error-handling middleware
└── HotelManagement.Tests/           xUnit tests for the business rules

frontend/src/app/
├── core/       Services, models, guards (auth, admin), interceptor, translations
├── features/   Dashboard, reservations, invoice, guests, rooms, reports, staff, audit log, login
└── shared/     UI components, navbar, toasts, translate and money pipes
```

**Key decisions**

- **Thin controllers, business rules in handlers.** Each action (create booking, check in, check out, record payment…) is a MediatR command with its own validator and tests.
- **Double-booking protection inside a transaction.** Only `Confirmed` and `CheckedIn` bookings hold a room; overlap uses half-open date ranges, so a guest can check in on the day the previous guest checks out.
- **Money is never trusted from the client.** Totals, nightly rates and balances are calculated on the server, and payments can't exceed the balance.
- **"Today" comes from an injectable clock** in the hotel's time zone, which keeps date rules correct and testable.
- **Server-side roles.** `[Authorize(Roles = "Admin")]` protects rooms, staff, reports and the audit log; the frontend hides what a role can't use.
- **Events after commit.** SignalR notifications are sent only after the database transaction succeeds.
