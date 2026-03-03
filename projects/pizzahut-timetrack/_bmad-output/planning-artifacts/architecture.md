---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/project-brief.md
  - _bmad-output/planning-artifacts/prd.md
workflowType: architecture
project: ShiftTrack
client: Pizza Hut Israel
version: 1.0
date: 2026-03-03
---

# Architecture Document
# ShiftTrack — Employee Time & Location Tracking

**Client:** Pizza Hut Israel  
**Author:** Beomytech Ltd (Architect: Winston / BMAD)  
**Date:** 2026-03-03  
**Version:** 1.1 (MVP on Contabo VPS, no AWS)  

---

## Project Context Analysis

### Requirements Overview

**Scale:**
- 1,000+ employees, 100+ branches
- 500+ simultaneous clock-ins during shift-start peaks
- Multi-role system: Employee / Branch Manager / Accounting / Top Management / Admin
- Multi-language PWA: Hebrew (RTL), Arabic (RTL), Russian, English
- Manager dashboard: Hebrew only (v1)

**Functional Requirements (46 FRs) — Architectural Implications:**

| FR Category | Count | Complexity | Key Architectural Implication |
|-------------|-------|-----------|------------------------------|
| Shift Management | FR1–FR6b | Medium | State machine for shift lifecycle |
| GPS & Location | FR7–FR12 | High | Geofence engine, fallback logic, fraud detection |
| Consent & Onboarding | FR13–FR17c | Medium | SMS/OTP flow, consent record immutability |
| Employee Management | FR18–FR22 | Low-Medium | Excel import, ERP-agnostic design |
| Branch Management | FR23–FR26 | Low | Geocoding integration, bulk import |
| Manual Override & Audit | FR27–FR30 | Medium | Immutable audit log, override attribution |
| Manager Dashboard | FR31–FR34 | Medium | Real-time attendance (WebSocket or polling) |
| Accounting & Reports | FR35–FR39 | Medium | Heavy query optimization, export generation |
| Top Management | FR40–FR41 | Low | Aggregate views, read-only |
| Access Control | FR42–FR45 | High | RBAC enforced server-side on every endpoint |
| Notifications | FR46 | Low | In-dashboard alerts (polling or WS) |

**Non-Functional Requirements — Architectural Constraints:**

- **Performance:** 500+ concurrent clock-ins, <5s response
- **Security:** OWASP Top 10, AES-256 at rest, TLS 1.3, GPS fraud detection
- **Scalability:** Stateless backend, horizontal scaling
- **Compliance:** Israeli Privacy Law, 7-year data retention, immutable audit log
- **Reliability:** 99.5% uptime, retry on network failure
- **RTL:** Full right-to-left layout support for Hebrew and Arabic

### Complexity Assessment

- **Complexity Level:** Medium-High
- **Primary Domain:** Full-Stack (Mobile PWA + REST API + Admin Dashboard)
- **Cross-Cutting Concerns:** Auth/RBAC, i18n/RTL, Audit Log, GPS Geofencing, Rate Limiting, Data Export

---

## Technology Stack Decisions

### Guiding Principle

> "Embrace boring technology for stability." — BMAD Architect persona

We choose proven, production-battle-tested tools over cutting-edge ones. Pizza Hut's workforce cannot afford downtime or instability.

### Selected Stack

#### Frontend — Employee PWA

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Framework | **React** | 18.x | Mature ecosystem, RTL support, wide talent pool |
| Build Tool | **Vite** | 5.x | Fast HMR, excellent PWA plugin support |
| PWA Plugin | **vite-plugin-pwa** | latest | Manifest + Service Worker generation, installable |
| Styling | **Tailwind CSS** | 3.x | Utility-first, RTL support via `rtl:` variant |
| i18n | **react-i18next** | latest | Industry standard, lazy loading, RTL-aware |
| HTTP Client | **Axios** | latest | Interceptors for retry logic, token refresh |
| Language | **TypeScript** | 5.x | Type safety reduces runtime errors |

#### Frontend — Manager Dashboard

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Framework | **React + Vite** | same | Consistent codebase, shared components |
| UI Components | **shadcn/ui** | latest | Accessible, customizable, no styling conflicts |
| Data Tables | **TanStack Table** | v8 | Powerful, headless, works with shadcn |
| Charts | **Recharts** | latest | Simple, composable, good for attendance graphs |
| State | **Zustand** | 4.x | Lightweight, no boilerplate, React 18 compatible |
| Excel Export | **xlsx (SheetJS)** | latest | De-facto standard for Excel generation |
| PDF Export | **jsPDF + autoTable** | latest | Client-side PDF, no server load |

#### Backend — API Server

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Runtime | **Node.js** | 22 LTS | Already on server, LTS stability |
| Framework | **NestJS** | 10.x | Opinionated structure = consistency across agents, DI, decorators |
| Language | **TypeScript** | 5.x | Full type safety end-to-end |
| ORM | **Prisma** | 5.x | Type-safe queries, excellent migration tooling |
| Validation | **class-validator + class-transformer** | latest | NestJS native, DTO validation |
| Auth | **Passport.js + @nestjs/jwt** | latest | OTP + JWT strategy |
| SMS (OTP) | **Twilio** | latest | Industry standard, Israel supported |
| Geocoding | **Google Maps Geocoding API** | v1 | Address → coordinates for branch import |
| Rate Limiting | **@nestjs/throttler** | latest | Built-in NestJS throttler |

#### Database

| Decision | Choice | Version | Rationale |
|----------|--------|---------|-----------|
| Primary DB | **PostgreSQL** | 16 | Relational data fits perfectly, ACID, proven at scale |
| ORM | **Prisma** | 5.x | Type-safe, migration tracking, schema-first |
| Caching | **Redis** | 7.x | Session tokens, rate limiting counters, active shift cache |
| Search/Index | PostgreSQL indexes | — | Sufficient for current scale, no Elasticsearch needed |

#### Infrastructure & Deployment (MVP)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Hosting | **Contabo VPS** (vmi3107651) | Already running, 4 CPU / 8GB RAM / 145GB SSD — sufficient for MVP |
| Containerization | **Docker Compose** | Single-server orchestration, simple, portable to AWS later |
| Reverse Proxy | **Nginx** | SSL termination, routing to containers, static file serving |
| SSL | **Let's Encrypt (Certbot)** | Free, auto-renewing certificates |
| Database | **PostgreSQL in Docker** | Managed by Docker Compose, daily backups to remote storage |
| Cache | **Redis in Docker** | Same Docker Compose stack |
| Static Files | **Nginx** | Serves built PWA and dashboard directly |
| SMS | **Twilio** | OTP delivery |
| CI/CD | **GitHub Actions** | Auto-deploy to server on push to main (SSH deploy) |
| Secrets | **.env file + GitHub Secrets** | Env vars managed on server, CI secrets in GitHub |
| Monitoring | **Docker logs + UptimeRobot** | Free uptime monitoring, logs via docker compose logs |
| Backups | **pg_dump → remote storage** | Daily automated backup script |
| **Future Migration** | **AWS ECS** | Docker containers migrate as-is — minimal effort |

---

## Core Architectural Decisions

### 1. Authentication Architecture

**Employees (mobile PWA):**
- Phone number + OTP (SMS via Twilio)
- No username/password — eliminates "forgot password" support tickets
- JWT access token (1 hour) + refresh token (30 days) stored in httpOnly cookie
- Device fingerprint stored with each session for fraud detection

**Managers / Accounting / Admin (dashboard):**
- Email + password + optional 2FA (TOTP)
- JWT access token (1 hour) + refresh token (8 hours)
- Auto-logout after 30 minutes inactivity

**Token Strategy:**
```
POST /auth/otp/request   → sends SMS
POST /auth/otp/verify    → returns { accessToken, refreshToken }
POST /auth/refresh       → returns new { accessToken }
POST /auth/logout        → invalidates refresh token in Redis
```

### 2. RBAC (Role-Based Access Control)

Roles enforced **server-side** on every API endpoint via NestJS Guards:

```
EMPLOYEE      → own shifts only, own profile, own consent record
BRANCH_MANAGER → shifts of their assigned branch(es), manual overrides
ACCOUNTING    → all branches, read-only shifts, export
TOP_MANAGEMENT → all branches, read-only aggregate, no exports
ADMIN         → everything, user management, branch management
```

**Guard Implementation:**
- `@Roles(Role.BRANCH_MANAGER)` decorator on controller methods
- `RolesGuard` validates against JWT payload + DB role check
- Branch scope enforced: `branchId` from JWT claim, all queries filtered by it

### 3. GPS & Geofence Architecture

**Client-side (browser):**
```
navigator.geolocation.getCurrentPosition(
  success,
  error,
  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
)
```

**Server-side classification (stateless, fast):**
```
classify(lat, lon, accuracy):
  if accuracy > 500m → return UNKNOWN
  
  for each branch in all_branches:
    distance = haversine(lat, lon, branch.lat, branch.lon)
    effective_radius = branch.geofence_radius
    if accuracy > 300m: effective_radius += 200m  // fallback for indoor
    if distance <= effective_radius → return BRANCH(branch.id)
  
  if employee.type == FIELD_WORKER → return FIELD
  return HOME
```

**Fraud Detection flags (stored per clock-in record):**
- `gps_accuracy` — raw accuracy in meters
- `ip_address` — server captures from request
- `user_agent` — device/browser fingerprint
- `is_suspicious` — auto-flagged if: accuracy = 0, known VPN IP range, or impossibly fast location change
- Suspicious records shown with ⚠️ flag in manager dashboard

### 4. Shift State Machine

```
NONE
  │ (Start Shift pressed)
  ▼
ACTIVE ──── (End Shift pressed) ──────────────────► CLOSED
  │
  │ (max duration exceeded without close)
  ▼
FLAGGED_UNCLOSED ─── (manager manually closes) ──► CLOSED_MANUAL
```

**Rules:**
- Employee cannot have 2 ACTIVE shifts simultaneously (FR6)
- FLAGGED_UNCLOSED: in-dashboard alert to manager (FR46)
- CLOSED_MANUAL: audit record created with manager_id + original_end = null + new_end = manually set time

### 5. Real-Time Attendance

Manager dashboard "Who's Working Now" screen:
- **Polling every 30 seconds** (not WebSocket for v1 — simpler, sufficient)
- `GET /dashboard/branches/:id/active-shifts` — returns current active employees
- Redis cache: active shifts cached for 15 seconds to reduce DB load during peak

WebSocket upgrade → v2 if polling proves insufficient.

### 6. Data Retention & Audit

- Shift records: never deleted, retained ≥7 years
- Audit log table: append-only, no UPDATE/DELETE permissions at application level
- Consent records: immutable after creation
- PII fields encrypted at rest using PostgreSQL column-level encryption (pgcrypto)

---

## Implementation Patterns & Consistency Rules

### Naming Conventions

**Database (Prisma schema):**
```
Tables:    snake_case, plural        → users, shift_records, branch_locations
Columns:   snake_case                → employee_id, started_at, is_suspicious
PKs:       id (UUID v4)             → id String @id @default(uuid())
FKs:       {table_singular}_id      → employee_id, branch_id
Timestamps: created_at, updated_at  → always present on every table
Booleans:  is_ prefix               → is_active, is_suspicious, is_field_worker
```

**API Endpoints (REST):**
```
Resources: plural, kebab-case        → /shift-records, /branch-locations
Nesting:   max 2 levels              → /branches/:id/employees (ok)
Params:    camelCase in query        → ?startDate=&endDate=&branchId=
Versions:  /api/v1/                  → always prefix
```

**TypeScript / NestJS:**
```
Files:     kebab-case                → shift-record.service.ts, auth.guard.ts
Classes:   PascalCase                → ShiftRecordService, RolesGuard
Methods:   camelCase                 → findActiveShifts(), createClockIn()
DTOs:      suffix DTO                → CreateShiftDto, ClockInResponseDto
Constants: UPPER_SNAKE               → MAX_SHIFT_DURATION_HOURS
```

**React Components:**
```
Files:     PascalCase                → ShiftButton.tsx, AttendanceTable.tsx
Hooks:     use prefix                → useShiftStatus(), useCurrentEmployee()
Utils:     camelCase                 → formatDuration(), classifyLocation()
i18n keys: dot notation              → shift.start_button, error.gps_denied
```

### API Response Format

**All API responses follow this wrapper:**
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 234
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "SHIFT_ALREADY_ACTIVE",
    "message": "You already have an active shift",
    "statusCode": 409
  }
}
```

**Error Codes (all uppercase snake_case):**
```
AUTH_INVALID_OTP
AUTH_TOKEN_EXPIRED
SHIFT_ALREADY_ACTIVE
SHIFT_NOT_FOUND
GPS_ACCURACY_TOO_LOW
BRANCH_NOT_FOUND
PERMISSION_DENIED
RATE_LIMIT_EXCEEDED
```

### Date/Time Standards

- All timestamps stored in UTC in the database
- All API responses return ISO 8601 UTC: `"2026-03-03T21:00:00.000Z"`
- Frontend converts to Israel local time (Asia/Jerusalem) for display
- Duration stored as integer minutes in DB (not calculated on the fly)

### Validation Pattern

Every incoming request validated via NestJS DTO:
```typescript
// Always validate at DTO level, never in service/controller directly
@IsUUID() employeeId: string;
@IsNumber() @Min(-90) @Max(90) latitude: number;
@IsEnum(LocationType) locationType: LocationType;
```

### Error Handling Pattern

```typescript
// Services throw domain exceptions
throw new ShiftAlreadyActiveException();

// Global exception filter catches and formats response
// Never expose stack traces or DB errors to client
```

### Audit Log Pattern

Every write operation that affects shift records or user data:
```typescript
await this.auditLog.record({
  action: 'SHIFT_MANUAL_CLOSE',
  actorId: managerId,
  targetId: shiftId,
  before: { endedAt: null },
  after: { endedAt: newEndTime },
  timestamp: new Date(),
  ipAddress: req.ip,
});
```

---

## Project Structure

```
shifttrack/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml                 # Local dev: Postgres + Redis
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Test + lint on PR
│       └── deploy.yml                 # Deploy to AWS on main merge
│
├── apps/
│   ├── employee-pwa/                  # Employee mobile PWA (React + Vite)
│   │   ├── package.json
│   │   ├── vite.config.ts             # PWA plugin configured
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   ├── public/
│   │   │   ├── manifest.webmanifest   # PWA manifest
│   │   │   └── icons/                 # App icons (192x192, 512x512)
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── i18n/
│   │       │   ├── index.ts
│   │       │   └── locales/
│   │       │       ├── he.json        # Hebrew (default)
│   │       │       ├── ar.json        # Arabic
│   │       │       ├── ru.json        # Russian
│   │       │       └── en.json        # English
│   │       ├── pages/
│   │       │   ├── OnboardingPage.tsx # Consent flow
│   │       │   ├── ClockInPage.tsx    # Main shift button
│   │       │   ├── HistoryPage.tsx    # Own shift history
│   │       │   └── ProfilePage.tsx    # Consent record view
│   │       ├── components/
│   │       │   ├── ShiftButton/
│   │       │   │   ├── ShiftButton.tsx
│   │       │   │   └── ShiftButton.test.tsx
│   │       │   ├── ConsentScreen/
│   │       │   ├── GpsPermissionGuide/
│   │       │   └── LocationBadge/     # Branch/Home/Field indicator
│   │       ├── hooks/
│   │       │   ├── useShift.ts        # Clock in/out logic
│   │       │   ├── useGps.ts          # GPS capture + error handling
│   │       │   └── useAuth.ts         # OTP auth flow
│   │       ├── services/
│   │       │   ├── api.ts             # Axios instance + interceptors
│   │       │   ├── shift.service.ts
│   │       │   └── auth.service.ts
│   │       └── utils/
│   │           ├── rtl.ts             # RTL direction helpers
│   │           ├── time.ts            # Duration formatting, timezone
│   │           └── retry.ts           # Network retry logic
│   │
│   └── manager-dashboard/             # Manager/Accounting/Admin dashboard
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── pages/
│           │   ├── LoginPage.tsx
│           │   ├── ActiveShiftsPage.tsx   # "Who's working now" (default)
│           │   ├── ShiftHistoryPage.tsx
│           │   ├── ReportsPage.tsx        # Accounting: hours + export
│           │   ├── OverviewPage.tsx       # Top management aggregate
│           │   ├── EmployeesPage.tsx      # Employee management
│           │   └── BranchesPage.tsx       # Branch management + QR codes
│           ├── components/
│           │   ├── layout/
│           │   │   ├── AppShell.tsx
│           │   │   └── Sidebar.tsx
│           │   ├── attendance/
│           │   │   ├── ActiveShiftsTable.tsx
│           │   │   └── UnclosedShiftAlert.tsx
│           │   ├── shifts/
│           │   │   ├── ShiftHistoryTable.tsx
│           │   │   └── ManualOverrideModal.tsx
│           │   ├── reports/
│           │   │   ├── HoursSummaryTable.tsx
│           │   │   └── ExportButton.tsx
│           │   └── employees/
│           │       ├── EmployeeTable.tsx
│           │       └── ExcelImportModal.tsx
│           ├── hooks/
│           │   ├── useActiveShifts.ts    # Polling every 30s
│           │   ├── useAuth.ts
│           │   └── useExport.ts
│           ├── store/
│           │   ├── auth.store.ts         # Zustand: current user + role
│           │   └── ui.store.ts           # Zustand: sidebar, modals
│           └── services/
│               ├── api.ts
│               ├── shifts.service.ts
│               └── reports.service.ts
│
├── api/                               # NestJS Backend
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma              # Full DB schema
│   │   ├── seed.ts                    # Dev seed data
│   │   └── migrations/               # Auto-generated by Prisma
│   └── src/
│       ├── main.ts                    # Bootstrap, CORS, global pipes
│       ├── app.module.ts
│       ├── config/
│       │   ├── database.config.ts
│       │   ├── jwt.config.ts
│       │   └── redis.config.ts
│       ├── modules/
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── auth.controller.ts  # /auth/otp/request, /auth/otp/verify
│       │   │   ├── auth.service.ts
│       │   │   ├── strategies/
│       │   │   │   └── jwt.strategy.ts
│       │   │   └── dto/
│       │   │       ├── request-otp.dto.ts
│       │   │       └── verify-otp.dto.ts
│       │   ├── shifts/
│       │   │   ├── shifts.module.ts
│       │   │   ├── shifts.controller.ts   # /api/v1/shifts
│       │   │   ├── shifts.service.ts
│       │   │   ├── geofence.service.ts    # GPS classification engine
│       │   │   ├── fraud-detection.service.ts
│       │   │   └── dto/
│       │   │       ├── clock-in.dto.ts
│       │   │       └── manual-close.dto.ts
│       │   ├── employees/
│       │   │   ├── employees.module.ts
│       │   │   ├── employees.controller.ts
│       │   │   ├── employees.service.ts
│       │   │   ├── excel-import.service.ts
│       │   │   └── dto/
│       │   ├── branches/
│       │   │   ├── branches.module.ts
│       │   │   ├── branches.controller.ts
│       │   │   ├── branches.service.ts
│       │   │   ├── geocoding.service.ts   # Google Maps integration
│       │   │   ├── qr-code.service.ts     # QR generation
│       │   │   └── dto/
│       │   ├── reports/
│       │   │   ├── reports.module.ts
│       │   │   ├── reports.controller.ts  # /api/v1/reports
│       │   │   └── reports.service.ts     # Hours calculation + export
│       │   ├── consent/
│       │   │   ├── consent.module.ts
│       │   │   ├── consent.controller.ts
│       │   │   └── consent.service.ts     # Immutable consent records
│       │   └── notifications/
│       │       ├── notifications.module.ts
│       │       └── notifications.service.ts  # Unclosed shift alerts
│       ├── common/
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── roles.guard.ts
│       │   ├── decorators/
│       │   │   ├── roles.decorator.ts
│       │   │   └── current-user.decorator.ts
│       │   ├── filters/
│       │   │   └── http-exception.filter.ts   # Global error format
│       │   ├── interceptors/
│       │   │   ├── response-transform.interceptor.ts  # Wrap in {success, data}
│       │   │   └── audit-log.interceptor.ts
│       │   └── utils/
│       │       ├── haversine.ts           # GPS distance calculation
│       │       └── pagination.ts
│       └── audit/
│           ├── audit.module.ts
│           ├── audit.service.ts
│           └── audit-log.entity.ts        # Append-only audit table
│
└── shared/                            # Shared TypeScript types
    ├── package.json
    └── src/
        ├── types/
        │   ├── shift.types.ts         # ShiftStatus, LocationType enums
        │   ├── user.types.ts          # Role enum, UserProfile
        │   └── api.types.ts           # ApiResponse<T>, ErrorCode
        └── constants/
            └── roles.ts
```

---

## Database Schema (Prisma)

```prisma
// Key tables — full schema in prisma/schema.prisma

model Employee {
  id              String   @id @default(uuid())
  phone           String   @unique
  fullName        String
  role            Role     @default(EMPLOYEE)
  employeeType    EmployeeType @default(REGULAR)
  homeBranchId    String?
  homeBranch      Branch?  @relation(fields: [homeBranchId], references: [id])
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  shifts          ShiftRecord[]
  consentRecord   ConsentRecord?
}

model Branch {
  id              String   @id @default(uuid())
  name            String
  address         String
  city            String
  latitude        Decimal  @db.Decimal(10, 8)
  longitude       Decimal  @db.Decimal(11, 8)
  geofenceRadius  Int      @default(150)  // meters
  isActive        Boolean  @default(true)
  shortCode       String   @unique        // for QR code URL
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  shifts          ShiftRecord[]
}

model ShiftRecord {
  id              String      @id @default(uuid())
  employeeId      String
  employee        Employee    @relation(fields: [employeeId], references: [id])
  
  startedAt       DateTime
  endedAt         DateTime?
  durationMinutes Int?        // calculated on close
  status          ShiftStatus @default(ACTIVE)
  
  startLatitude   Decimal?    @db.Decimal(10, 8)
  startLongitude  Decimal?    @db.Decimal(11, 8)
  startLocationType LocationType?
  startBranchId   String?     // branch detected at start
  
  endLatitude     Decimal?    @db.Decimal(10, 8)
  endLongitude    Decimal?    @db.Decimal(11, 8)
  endLocationType LocationType?
  endBranchId     String?     // branch detected at end
  
  isManualOverride Boolean    @default(false)
  overriddenBy    String?     // manager employee_id
  
  // Fraud detection fields
  startGpsAccuracy   Float?
  startIpAddress     String?
  startUserAgent     String?
  startIsSuspicious  Boolean  @default(false)
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model ConsentRecord {
  id              String   @id @default(uuid())
  employeeId      String   @unique
  employee        Employee @relation(fields: [employeeId], references: [id])
  consentVersion  String
  consentedAt     DateTime @default(now())
  ipAddress       String
  deviceUserAgent String
  // No updatedAt — immutable
}

model AuditLog {
  id          String   @id @default(uuid())
  action      String   // e.g. SHIFT_MANUAL_CLOSE
  actorId     String
  targetId    String
  targetType  String   // ShiftRecord, Employee, etc.
  before      Json?
  after       Json?
  ipAddress   String?
  createdAt   DateTime @default(now())
  // No updatedAt — append-only
}

enum Role {
  EMPLOYEE
  BRANCH_MANAGER
  ACCOUNTING
  TOP_MANAGEMENT
  ADMIN
}

enum EmployeeType {
  REGULAR
  FIELD_WORKER
}

enum ShiftStatus {
  ACTIVE
  CLOSED
  CLOSED_MANUAL
  FLAGGED_UNCLOSED
}

enum LocationType {
  BRANCH
  HOME
  FIELD
  UNKNOWN
}
```

---

## API Endpoints Overview

```
Auth:
POST   /api/v1/auth/otp/request       Employee requests OTP
POST   /api/v1/auth/otp/verify        Verify OTP, get tokens
POST   /api/v1/auth/login             Manager email+password login
POST   /api/v1/auth/refresh           Refresh access token
POST   /api/v1/auth/logout            Invalidate refresh token

Shifts (Employee):
POST   /api/v1/shifts/clock-in        Start shift (GPS payload)
POST   /api/v1/shifts/clock-out       End shift (GPS payload)
GET    /api/v1/shifts/my              Own shift history

Dashboard (Manager):
GET    /api/v1/dashboard/active        Active shifts for branch
GET    /api/v1/dashboard/shifts        Shift history with filters
PATCH  /api/v1/dashboard/shifts/:id    Manual override (close/edit)

Reports (Accounting):
GET    /api/v1/reports/hours           Hours summary all branches
GET    /api/v1/reports/export/excel    Generate Excel export
GET    /api/v1/reports/export/pdf      Generate PDF export

Overview (Top Management):
GET    /api/v1/overview/summary        Aggregate attendance stats

Employees (Admin/Manager):
GET    /api/v1/employees               List employees
POST   /api/v1/employees               Create employee
PUT    /api/v1/employees/:id           Update employee
POST   /api/v1/employees/import        Excel bulk import
DELETE /api/v1/employees/:id           Deactivate (soft delete)

Branches (Admin):
GET    /api/v1/branches                List branches
POST   /api/v1/branches                Create branch
PUT    /api/v1/branches/:id            Update branch
POST   /api/v1/branches/import         Excel bulk import
GET    /api/v1/branches/:id/qr         Get QR code image

Consent:
GET    /api/v1/consent/mine            Employee's own consent record
POST   /api/v1/consent/accept          Record consent on first use
```

---

## Deployment Architecture (MVP — Contabo VPS)

```
Internet (employees + managers)
        │ HTTPS (Let's Encrypt SSL)
        ▼
┌─────────────────────────────────────────────┐
│          Contabo VPS — vmi3107651           │
│          Ubuntu 24.04 / 4CPU / 8GB RAM      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         Nginx (reverse proxy)       │   │
│  │  /        → employee-pwa (static)   │   │
│  │  /dashboard → manager-dashboard     │   │
│  │  /api/*   → api:3000               │   │
│  └──────────────────┬──────────────────┘   │
│                     │                       │
│  ┌──────────────────▼──────────────────┐   │
│  │   Docker Compose Stack              │   │
│  │                                     │   │
│  │  ┌─────────┐  ┌──────────────────┐ │   │
│  │  │   api   │  │   postgres:16    │ │   │
│  │  │ NestJS  │──│  (port 5432)    │ │   │
│  │  │ :3000   │  └──────────────────┘ │   │
│  │  └────┬────┘  ┌──────────────────┐ │   │
│  │       │       │   redis:7        │ │   │
│  │       └───────│  (port 6379)    │ │   │
│  │               └──────────────────┘ │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

External Services:
  Twilio              → SMS/OTP delivery
  Google Maps API     → Branch geocoding
  GitHub Actions      → Auto-deploy on push to main
  UptimeRobot (free)  → Uptime monitoring + alerts
  Remote storage      → Daily pg_dump backups

Future (v2 → AWS migration):
  Same Docker images → ECS Fargate
  PostgreSQL dump   → RDS restore
  ~1-2 days work, no code changes needed
```

---

## Security Architecture Summary

| Layer | Control |
|-------|---------|
| Transport | TLS 1.3 via CloudFront + ACM |
| Authentication | OTP (employees), JWT + optional 2FA (managers) |
| Authorization | NestJS RolesGuard on every endpoint, branch-scoped queries |
| Data at rest | RDS encryption enabled, PII fields encrypted with pgcrypto |
| API protection | @nestjs/throttler — 5 OTP attempts/15min, 100 req/min per IP |
| Input validation | class-validator DTOs on all endpoints |
| Error handling | Global filter — no stack traces exposed to client |
| Audit trail | Append-only AuditLog table, DB-level no DELETE permission |
| GPS fraud | Per-request flags stored: accuracy, IP, user-agent, suspicious flag |
| Secrets | .env file on server + GitHub Secrets for CI — no credentials in codebase |
| OWASP Top 10 | Covered via: input validation, parameterized queries (Prisma), CORS config, HTTPS-only, rate limiting |

---

*Document status: Complete — ready for Epics & Stories phase*  
*Next step: PM agent creates Epics and User Stories from PRD + Architecture*
