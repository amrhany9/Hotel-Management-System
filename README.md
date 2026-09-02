# Hotel Management System

A full-stack Hotel Management System built with **ASP.NET Core 8 Web API**, **Angular 20**, **Entity Framework Core Code First**, and **SignalR** real-time updates.

---

## 1. System Requirements

* **.NET SDK**: .NET 8 (or .NET 10 SDK targeting `net8.0`)
* **Node.js**: v18+ (tested on Node v24.17.0)
* **npm**: v9+ (tested on npm 11.13.0)
* **Angular CLI**: v19+ / v20 (tested with Angular CLI 22.1.6)
* **Database**: Microsoft SQL Server or SQL Server LocalDB (`(localdb)\mssqllocaldb`)

---

## 2. Default URLs & Demo Credentials

| Service | URL |
| :--- | :--- |
| **Backend Web API** | `http://localhost:5001` (or `https://localhost:7008`) |
| **Swagger UI** | `http://localhost:5001/swagger` |
| **SignalR Hub** | `http://localhost:5001/hubs/reservations` |
| **Angular Frontend** | `http://localhost:4200` |

### Default Demo Accounts

The database is automatically initialized and seeded with demo accounts on startup:

* **Administrator**:
  * **Email**: `admin@hotel.local`
  * **Password**: `Admin123!`
* **Front Desk Staff**:
  * **Email**: `staff@hotel.local`
  * **Password**: `Staff123!`

---

## 3. Project Architecture

The backend follows a clean, decoupled CQRS and Repository architecture with MediatR:

```text
/
├── .gitignore                           # Single root gitignore for entire repository (Backend & Frontend)
├── README.md                            # Comprehensive project documentation
│
├── backend/
│   ├── HotelManagement.sln
│   ├── HotelManagement.Domain/          # Core Domain Entities (User, Room, Reservation, AuditLog, Enums)
│   ├── HotelManagement.Application/     # CQRS Commands, Queries, Validators, DTOs, Repository Interfaces
│   │   ├── Commands/                    # Feature subfolders: Auth/, Reservations/, Rooms/
│   │   ├── Queries/                     # Feature subfolders: AuditLogs/, Reports/, Reservations/, Rooms/
│   │   ├── DTOs/                        # Feature subfolders: AuditLogs/, Auth/, Reports/, Reservations/, Rooms/
│   │   ├── Validators/                  # Feature subfolders: Auth/, Reports/, Reservations/, Rooms/
│   │   └── Common/                      # Repository Interfaces, UnitOfWork, Behaviors, Exceptions
│   ├── HotelManagement.Infrastructure/  # EF Core DbContext, Repositories, Migrations, Seed, Auth (JWT, Hashing)
│   ├── HotelManagement.API/             # Controllers, SignalR Hubs, Middleware, launchSettings.json
│   └── HotelManagement.Tests/           # xUnit Automated Unit Tests for critical business rules
│
└── frontend/                            # Standalone Angular 20 SPA
    ├── src/app/core/                    # AuthService, AuthGuard, AuthInterceptor, SignalRService, ApiServices
    ├── src/app/features/
    │   ├── auth/                        # Login & Staff Registration
    │   ├── dashboard/                   # Operations metrics dashboard with real-time sync
    │   ├── rooms/                       # Room CRUD & Date-range Availability search
    │   ├── reservations/                # Bookings table, cancellation, & modal booking dialog
    │   ├── audit-logs/                  # User activity audit trails
    │   └── reports/                     # LINQ-based Top Rooms, Revenue Analysis, & Occupancy reports
    └── src/app/shared/                  # Navbar with live sync status indicator & Toast notification system
```

---

## 4. Setup & Running Instructions

### Step 1: Clone the repository and configure database

Open `backend/HotelManagement.API/appsettings.json` to verify the connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=AMR\\MSSQLSERVER2022;Database=HotelManagementDb;User ID=sa;Password=P@ssw0rd;MultipleActiveResultSets=true;TrustServerCertificate=True"
}
```

*Update `DefaultConnection` if you are using SQL Server LocalDB or another instance:*
```text
Server=(localdb)\mssqllocaldb;Database=HotelManagementDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True
```

### Step 2: Apply Database Migrations

You can apply the EF Core Code First migrations using the dotnet CLI:

```powershell
cd backend
dotnet tool restore
dotnet dotnet-ef database update --project HotelManagement.Infrastructure --startup-project HotelManagement.API
```

*(Note: The Web API also auto-migrates and seeds initial rooms, reservations, and demo accounts on first startup if connected to SQL Server).*

### Step 3: Run the Backend API

```powershell
cd backend
dotnet run --project HotelManagement.API/HotelManagement.API.csproj --launch-profile http
```

The API will start listening at: `http://localhost:5001`.
Swagger UI documentation is available at: `http://localhost:5001/swagger`.

### Step 4: Run the Angular Frontend

In a separate terminal:

```powershell
cd frontend
npm install
npx ng serve --port 4200
```

Open your browser and navigate to: `http://localhost:4200`.

---

## 5. Automated Unit Tests

Run the test suite covering reservation overlap protection, total calculation, cancellation rules, and room deletion guards:

```powershell
cd backend
dotnet test HotelManagement.Tests/HotelManagement.Tests.csproj
```

### Verified Test Cases:
1. **Overlap Protection**: Overlapping date range for the same room throws `ConflictException` (409 Conflict).
2. **Adjacent Bookings**: Check-in on the exact date of previous check-out is permitted.
3. **Cancelled Reservations**: Cancelled bookings do not block new reservations for the same dates.
4. **Date Validation**: Check-out date before or equal to check-in date is rejected.
5. **Total Calculation**: `TotalAmount` is calculated server-side as `nights * pricePerNight`.
6. **Cancellation Rule**: Already cancelled reservation cannot be cancelled again.
7. **Room Deletion Guard**: Rooms with active or future confirmed reservations cannot be deleted.

---

## 6. Two-Browser SignalR Real-Time Test

To test real-time SignalR synchronization between concurrent users:

1. Open **Browser A** (e.g. Chrome) and navigate to `http://localhost:4200`.
2. Log in using `admin@hotel.local` / `Admin123!`.
3. Notice the green **"Live Sync"** pulsing indicator in the navbar.
4. Open **Browser B** (e.g. Chrome Incognito or Edge) and navigate to `http://localhost:4200`.
5. Log in using `staff@hotel.local` / `Staff123!`.
6. In **Browser A**, navigate to **Reservations** and click **New Reservation**. Select Room `102`, enter a guest name, choose dates, and submit.
7. In **Browser B**, observe:
   * A toast notification instantly slides in: *"Another user created a reservation for [Guest Name] (Room 102)"*.
   * The reservations table and dashboard metrics update automatically without refreshing the page.
8. In **Browser A**, click **Cancel** on a confirmed reservation.
9. In **Browser B**, observe the status badge update to **Cancelled** with a real-time toast notification.

---

## 7. Key Architectural Decisions

### CQRS, MediatR & Repository Pattern
* **Separation of Concerns**: Controllers remain strictly thin dispatchers. All business rules live in isolated `Commands` and `Queries`.
* **Decoupled Data Access**: The Application layer has zero references to Entity Framework Core. Data operations are abstracted via domain repositories (`IUserRepository`, `IRoomRepository`, `IReservationRepository`, `IAuditLogRepository`, `IReportRepository`) and `IUnitOfWork`.
* **Validation Pipeline**: FluentValidation rules in feature-based folders are executed via an open generic MediatR `IPipelineBehavior`, catching invalid models before reaching handlers.

### Reservation Overlap Logic
Standard half-open interval logic is enforced:
```csharp
existing.CheckInDate < requestedCheckOutDate && existing.CheckOutDate > requestedCheckInDate
```
This guarantees that check-out day is free for incoming guests on the same afternoon (e.g., checkout Sept 5, new checkin Sept 5 does not conflict).

### Transactional Integrity
`CreateReservationCommandHandler` executes in an atomic database transaction using `IUnitOfWork`:
1. Verifies room exists.
2. Re-checks date overlap against the database within the transaction.
3. Computes stay duration (`DateOnly` day difference) and total price.
4. Inserts `Reservation` entity.
5. Inserts `AuditLog` entity.
6. Saves changes atomically.
7. Commits the transaction.
8. **Only after successful commit**, broadcasts the SignalR event. If an error occurs, the transaction rolls back with no partial changes.

### Current User Attribution via JWT
* The authenticated user's ID is extracted server-side using `ICurrentUserService` from the JWT `NameIdentifier` / `sub` claims.
* Client-supplied user IDs in request bodies are never trusted.

### LINQ-Based Reports
* **R1 Top Rooms**: Uses LINQ grouping and aggregation to calculate booking counts and revenue generated per room.
* **R2 Revenue Analysis**: Groups reservations overlapping the requested interval by `RoomType`, computing pro-rated revenue and nights sold.
* **R3 Occupancy Rates**: Accurately computes available room nights in the interval vs. booked nights (check-in included, check-out excluded) and calculates occupancy percentage. No hard-coded JSON.