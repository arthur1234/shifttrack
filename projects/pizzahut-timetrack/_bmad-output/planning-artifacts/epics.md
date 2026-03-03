---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/project-brief.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
workflowType: epics-and-stories
project: ShiftTrack
client: Pizza Hut Israel
version: 1.0
date: 2026-03-03
---

# Epics & User Stories
# ShiftTrack — Employee Time & Location Tracking

**Client:** Pizza Hut Israel  
**Author:** Beomytech Ltd  
**Date:** 2026-03-03  
**Version:** 1.0  

---

## Requirements Inventory

### Functional Requirements

- FR1: Employee can start a shift with a single button tap
- FR2: Employee can end an active shift with a single button tap
- FR3: System automatically captures GPS coordinates at shift start and end
- FR4: System classifies shift location as Branch, Home, Field, or Unknown
- FR5: Employee can view their own shift history
- FR6: If employee has an open shift, Start Shift button is blocked with "End current shift?" prompt
- FR6b: System auto-flags shifts exceeding configured max duration; manager receives notification
- FR7: System compares employee GPS against all branch geofences
- FR7b: Extended fallback radius when GPS accuracy > 300m
- FR7c: System records branch_start and branch_end separately per shift
- FR8: System determines nearest branch and distance even outside geofence
- FR9: Field Worker flag triggers "Field" classification outside geofences
- FR10: "Home" classification for non-field workers outside all geofences
- FR11: "Unknown" classification when GPS accuracy too low or timeout
- FR12: App requests GPS permission if not granted, with in-app guide
- FR13: Consent screen shown on first clock-in attempt
- FR14: Employee must accept GPS consent before using clock-in
- FR15: Consent record stored with employee ID, timestamp, version
- FR16: Consent screen states location captured only at button press
- FR17: Employee can view own consent record in profile
- FR17b: Onboarding via SMS OTP — HR imports employee, system sends link, employee verifies phone
- FR17c: Each branch has unique short URL and printable QR code
- FR18: Admin can create employee accounts (name, role, home branch, type)
- FR19: Admin can bulk-import employees from Excel
- FR20: Admin can deactivate employees (preserves history)
- FR21: Admin can assign employees to home branch
- FR22: System supports employees working across multiple branches (GPS-determined per shift)
- FR23: Admin can create/edit branch records (name, address, city, GPS, geofence radius)
- FR24: Admin can bulk-import branches from Excel
- FR25: System auto-geocodes branch address to GPS coordinates during import
- FR26: Admin can deactivate branches
- FR27: Manager can manually close unclosed shift with custom end time
- FR28: Manager can edit start/end time of any shift in their branch
- FR29: All manual overrides recorded with manager ID, timestamp, original/new values
- FR30: Manual overrides visually distinguished from automatic records
- FR31: Branch Manager dashboard opens on "Who's Working Now" as default screen
- FR31b: Manager sees: active employees, not-yet-started, unclosed shifts — all in one view
- FR32: Manager can view shift history per employee with date range filter
- FR33: Manager can see shift details: name, start/end, location type, branch_start/end, duration, override flag
- FR34: Manager notified in-dashboard when shift exceeds max configured duration
- FR35: Accounting can view shifts across all branches with date range and branch filters
- FR36: System calculates total hours worked per employee per period
- FR37: Hours breakdown by location type (Branch/Home/Field) per employee
- FR38: Accounting can export to Excel (.xlsx) and PDF
- FR39: Export includes: employee name, ID, branch, dates, hours by type, total hours
- FR40: Top Management can view aggregate attendance across all branches (read-only)
- FR41: Top Management dashboard shows: active now, total hours this week, branch-level summary
- FR42: Role-based access: Employee / Branch Manager / Accounting / Top Management / Admin
- FR43: Branch Manager can only access data for their assigned branch(es)
- FR44: Admin with permissions can create and manage user accounts
- FR45: No user can access data beyond their role scope (server-side enforced)
- FR46: In-dashboard alert when employee shift exceeds configured max duration

### Non-Functional Requirements

- NFR1: Clock-in action < 5 seconds on 4G connection
- NFR2: Dashboard page load < 3 seconds
- NFR3: Report generation < 10 seconds (1 month, all branches)
- NFR4: System supports 500+ simultaneous clock-ins without degradation
- NFR5: GPS geofence calculation < 1 second server-side
- NFR6: HTTPS/TLS 1.3 minimum for all traffic
- NFR7: All PII encrypted at rest (AES-256 / pgcrypto)
- NFR8: JWT access token 1-hour expiry + refresh token rotation
- NFR9: Rate limiting: max 5 OTP attempts / 15 min; 100 req/min per IP
- NFR10: OWASP Top 10 compliance
- NFR11: Session timeout 30 minutes inactivity on dashboard
- NFR12: 99.5% uptime during business hours (06:00–24:00 IST)
- NFR13: Client retries failed clock-in up to 3 times
- NFR14: Full RTL layout for Hebrew and Arabic
- NFR15: PWA installable to home screen (iOS Safari 15+, Android Chrome 90+)
- NFR16: All buttons minimum 44x44px touch target
- NFR17: WCAG 2.1 AA color contrast compliance
- NFR18: Shift records retained minimum 7 years
- NFR19: Audit log immutable (append-only, no delete)
- NFR20: Horizontal scaling architecture (stateless backend)

### Additional Requirements (from Architecture)

- Deployment: Docker Compose on Contabo VPS (single server)
- Reverse proxy: Nginx with Let's Encrypt SSL
- CI/CD: GitHub Actions auto-deploy on push to main
- Database: PostgreSQL 16 in Docker
- Cache: Redis 7 in Docker
- OTP delivery: Twilio SMS integration
- Geocoding: Google Maps Geocoding API for branch import
- PWA: vite-plugin-pwa for manifest + service worker
- SMS onboarding: phone number + OTP, no password for employees
- QR code generation for branches
- GPS fraud detection: store accuracy, IP, user-agent, suspicious flag

---

## FR Coverage Map

| FR | Epic | Story |
|----|------|-------|
| FR17b (OTP onboarding) | Epic 1 | 1.3 |
| FR42, FR44, FR45 | Epic 1 | 1.4 |
| FR13, FR14, FR15, FR16, FR17 | Epic 2 | 2.2 |
| FR12 | Epic 2 | 2.3 |
| FR1, FR2, FR3, FR4 | Epic 3 | 3.1, 3.2 |
| FR6, FR6b | Epic 3 | 3.3 |
| FR7, FR7b, FR7c, FR8, FR9, FR10, FR11 | Epic 3 | 3.2 |
| FR46, FR34 | Epic 3 | 3.4 |
| FR5 | Epic 4 | 4.1 |
| FR17 | Epic 4 | 4.2 |
| FR17c | Epic 5 | 5.3 |
| FR23, FR24, FR25, FR26 | Epic 5 | 5.1, 5.2 |
| FR18, FR19, FR20, FR21, FR22 | Epic 6 | 6.1, 6.2 |
| FR31, FR31b, FR32, FR33, FR30 | Epic 7 | 7.1, 7.2 |
| FR27, FR28, FR29 | Epic 7 | 7.3 |
| FR35, FR36, FR37, FR38, FR39 | Epic 8 | 8.1, 8.2 |
| FR40, FR41 | Epic 9 | 9.1 |
| FR43 | Epic 7 | 7.1 (branch scope guard) |

---

## Epic List

### Epic 1: Foundation & Infrastructure
Project scaffold, Docker environment, database, CI/CD, authentication API, and role system. Enables all future epics.
**FRs covered:** FR17b, FR42, FR44, FR45 (infrastructure for all)

### Epic 2: Employee Onboarding & Consent
Employee opens PWA for first time, sees consent screen, verifies phone via OTP, and is ready to clock in.
**FRs covered:** FR12, FR13, FR14, FR15, FR16, FR17

### Epic 3: Shift Clock-In / Clock-Out (Core Feature)
Employee taps Start/End Shift. GPS captures location, server classifies it. Shift recorded. Manager alerted if shift too long.
**FRs covered:** FR1, FR2, FR3, FR4, FR6, FR6b, FR7, FR7b, FR7c, FR8, FR9, FR10, FR11, FR34, FR46

### Epic 4: Employee Self-Service
Employee can view their own shift history and consent record.
**FRs covered:** FR5, FR17

### Epic 5: Branch Management
Admin creates, edits, imports, and manages branches. Each branch gets a QR code.
**FRs covered:** FR23, FR24, FR25, FR26, FR17c

### Epic 6: Employee Management
Admin creates, imports, and manages employee accounts. Assigns roles and home branches.
**FRs covered:** FR18, FR19, FR20, FR21, FR22

### Epic 7: Manager Dashboard
Branch Manager sees who is working now, views shift history, and makes manual overrides with audit trail.
**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR31b, FR32, FR33, FR43

### Epic 8: Accounting & Reports
Accounting sees all branches, calculates hours, exports Excel/PDF for payroll.
**FRs covered:** FR35, FR36, FR37, FR38, FR39

### Epic 9: Top Management Overview
Top Management sees aggregate attendance dashboard across all branches (read-only).
**FRs covered:** FR40, FR41

---

## Epic 1: Foundation & Infrastructure

**Goal:** Set up the complete technical foundation — Docker Compose environment, database, NestJS API scaffold, authentication with OTP, and role-based access control. Every future epic builds on this.

---

### Story 1.1: Docker Compose Project Setup

As a **developer (me)**,
I want the full project scaffold with Docker Compose running locally,
So that development can begin with a consistent, reproducible environment.

**Acceptance Criteria:**

**Given** an empty project directory
**When** `docker compose up` is run
**Then** the following services start successfully:
- PostgreSQL 16 on port 5432
- Redis 7 on port 6379
- NestJS API on port 3000 (returns 200 on GET /api/v1/health)
- Nginx on port 80 and 443

**And** the project structure matches the architecture document:
- `apps/employee-pwa/` (Vite + React, TypeScript)
- `apps/manager-dashboard/` (Vite + React, TypeScript)
- `api/` (NestJS, TypeScript, Prisma)
- `shared/` (shared TypeScript types)

**And** Prisma schema is initialized with base tables:
- `employees` (id, phone, full_name, role, is_active, created_at, updated_at)
- `audit_logs` (id, action, actor_id, target_id, target_type, before, after, ip_address, created_at)

**And** environment variables are loaded from `.env` file (`.env.example` committed to git)

**And** `GET /api/v1/health` returns:
```json
{ "success": true, "data": { "status": "ok", "timestamp": "..." } }
```

---

### Story 1.2: GitHub Actions CI/CD Pipeline

As a **developer**,
I want automatic deployment to the Contabo server when I push to main branch,
So that new code is live within minutes without manual SSH.

**Acceptance Criteria:**

**Given** a GitHub repository is connected to the project
**When** code is pushed to the `main` branch
**Then** GitHub Actions workflow triggers automatically

**And** the workflow:
1. Runs linting and type checks
2. Builds Docker images
3. SSHs to Contabo server
4. Pulls latest images and restarts containers with zero downtime
5. Runs `prisma migrate deploy` to apply any new DB migrations

**And** if any step fails, deployment is aborted and previous version remains running

**And** Nginx is configured with Let's Encrypt SSL for the domain (auto-renewing)

**And** the API is accessible at `https://[subdomain]/api/v1/health` returning 200

---

### Story 1.3: Employee OTP Authentication

As an **employee**,
I want to verify my phone number via SMS code,
So that I can access my account without remembering a password.

**Acceptance Criteria:**

**Given** an employee record exists with a phone number
**When** employee submits their phone number on the login screen
**Then** system sends a 6-digit OTP via Twilio SMS to that number

**And** OTP is valid for 10 minutes

**And** OTP is rate-limited: max 5 attempts per phone number per 15 minutes

**And** when employee submits the correct OTP:
- System returns JWT access token (1 hour expiry)
- System returns refresh token stored in httpOnly cookie (30 days)
- Response includes employee role and name

**And** when OTP is incorrect:
- System returns error: `{ "success": false, "error": { "code": "AUTH_INVALID_OTP" } }`

**And** `POST /api/v1/auth/otp/request` — accepts `{ phone: "+972501234567" }`
**And** `POST /api/v1/auth/otp/verify` — accepts `{ phone, code }`
**And** `POST /api/v1/auth/refresh` — uses httpOnly cookie, returns new access token
**And** `POST /api/v1/auth/logout` — invalidates refresh token in Redis

---

### Story 1.4: Manager Email Authentication & RBAC

As a **manager / admin**,
I want to log in with my email and password,
So that I can access the management dashboard securely.

**Acceptance Criteria:**

**Given** a manager account exists (created by admin)
**When** manager submits email + password
**Then** system validates credentials and returns JWT with role claim

**And** JWT payload includes: `{ employeeId, role, branchId (if Branch Manager), iat, exp }`

**And** all API endpoints are protected by `JwtAuthGuard`

**And** role-based access is enforced via `RolesGuard` + `@Roles()` decorator:
- `EMPLOYEE` → can only access own data endpoints
- `BRANCH_MANAGER` → branch-scoped data only (enforced by branchId in JWT)
- `ACCOUNTING` → read access to all branches
- `TOP_MANAGEMENT` → read-only aggregate access
- `ADMIN` → full access

**And** attempting to access an unauthorized endpoint returns:
```json
{ "success": false, "error": { "code": "PERMISSION_DENIED", "statusCode": 403 } }
```

**And** `POST /api/v1/auth/login` — accepts `{ email, password }`
**And** session timeout: dashboard auto-logs out after 30 minutes inactivity

---

## Epic 2: Employee Onboarding & Consent

**Goal:** A new employee opens ShiftTrack for the first time, sees a clear GPS consent screen, verifies their phone number, and is ready to clock in. Zero support required.

---

### Story 2.1: Employee PWA — Home Screen & Language Selection

As an **employee**,
I want to open ShiftTrack from a link and see it in my language,
So that I can use the app comfortably without language barriers.

**Acceptance Criteria:**

**Given** an employee opens the ShiftTrack link in their mobile browser
**When** the PWA loads for the first time
**Then** the app detects browser language and displays in: Hebrew (default), Russian, Arabic, or English

**And** employee can manually switch language from the app (persisted in localStorage)

**And** RTL layout is applied automatically for Hebrew and Arabic

**And** the app prompts "Add to Home Screen" banner (PWA install prompt) on Android Chrome

**And** on iOS Safari, instructions "Tap Share → Add to Home Screen" are shown

**And** the app works without internet after first load (service worker caches shell)

**And** app icon, name "ShiftTrack", and splash screen appear when launched from home screen

---

### Story 2.2: GPS Consent Screen (First Use)

As a **new employee**,
I want to understand exactly how my location is used before I agree,
So that I can trust the app and give informed consent.

**Acceptance Criteria:**

**Given** an employee opens ShiftTrack for the first time (no consent record exists)
**When** they reach the main screen
**Then** they are shown the consent screen BEFORE any other content

**And** the consent screen clearly states (in employee's language):
> *"ShiftTrack records your location ONLY when you press the Start Shift or End Shift button. We do not track your location continuously. Your location is used only to classify your shift as: At Branch, Working from Home, or Field Work."*

**And** the screen shows a checkbox: "I understand and agree to GPS location recording at shift start and end"

**And** employee cannot proceed without checking the checkbox

**And** when employee taps "Continue":
- `POST /api/v1/consent/accept` is called with: `{ consentVersion: "1.0", ipAddress, userAgent }`
- Consent record is created: `{ employeeId, consentVersion, consentedAt, ipAddress, deviceUserAgent }`
- Consent record is immutable (no update endpoint)

**And** consent screen is NEVER shown again to this employee

**And** consent record structure:
```prisma
ConsentRecord {
  id, employeeId (unique), consentVersion, consentedAt, ipAddress, deviceUserAgent
}
```

---

### Story 2.3: GPS Permission Request Flow

As an **employee**,
I want to be guided to enable GPS if it's turned off,
So that I can clock in without confusion or technical support.

**Acceptance Criteria:**

**Given** an employee has given consent and taps "Start Shift"
**When** the browser's location permission is "denied" or "prompt"
**Then** system calls `navigator.geolocation.getCurrentPosition()` which triggers OS permission dialog

**And** if employee denies GPS permission:
- App shows a clear in-app guide: "Location access is needed to record your shift. Please enable it in your phone settings."
- Guide includes step-by-step instructions for iOS and Android
- Clock-in is blocked until permission is granted

**And** if employee grants GPS permission:
- App proceeds with clock-in flow
- No additional prompts shown on future clock-ins (permission remembered by OS)

**And** if GPS times out (>10 seconds with no response):
- App allows clock-in with "Unknown" location
- Manager is notified in dashboard that this shift has Unknown location

---

## Epic 3: Shift Clock-In / Clock-Out

**Goal:** The core product feature. Employee taps one button, GPS fires, server classifies location, shift is recorded. Manager sees alert if shift goes too long.

---

### Story 3.1: Start Shift — Happy Path

As an **employee**,
I want to start my shift with a single tap,
So that my work hours are recorded accurately and effortlessly.

**Acceptance Criteria:**

**Given** an employee has consented and GPS is enabled
**When** employee taps the "Start Shift" button
**Then** app calls `navigator.geolocation.getCurrentPosition()` with `{ enableHighAccuracy: true, timeout: 10000 }`

**And** app sends `POST /api/v1/shifts/clock-in` with:
```json
{
  "latitude": 32.0853,
  "longitude": 34.7818,
  "accuracy": 15,
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-03-03T07:00:00.000Z"
}
```

**And** server creates ShiftRecord:
```
status: ACTIVE
startedAt: [timestamp]
startLatitude, startLongitude, startGpsAccuracy
startLocationType: [BRANCH / HOME / FIELD / UNKNOWN]
startBranchId: [if classified as BRANCH]
startIpAddress, startUserAgent
startIsSuspicious: false (default)
```

**And** server responds within 5 seconds with:
```json
{
  "success": true,
  "data": {
    "shiftId": "uuid",
    "startedAt": "2026-03-03T07:00:00.000Z",
    "locationType": "BRANCH",
    "branchName": "Pizza Hut Tel Aviv Dizengoff"
  }
}
```

**And** employee sees confirmation screen:
- ✅ "Shift started at 07:00"
- 📍 "📍 At Branch — Pizza Hut Tel Aviv Dizengoff"
- Button changes to red "End Shift"

---

### Story 3.2: GPS Geofence Classification Engine

As the **system**,
I want to classify employee GPS coordinates into Branch/Home/Field/Unknown,
So that managers have accurate location context for every shift.

**Acceptance Criteria:**

**Given** a clock-in request arrives with GPS coordinates and accuracy
**When** `GeofenceService.classify(lat, lon, accuracy, employeeType)` is called
**Then** classification logic runs:

```
1. If accuracy > 500m → return UNKNOWN

2. effectiveRadius = branch.geofenceRadius (default: 150m)
   if accuracy > 300m → effectiveRadius += 200m (indoor fallback)

3. For each active branch:
   distance = haversine(lat, lon, branch.lat, branch.lon)
   if distance <= effectiveRadius → return BRANCH(branch.id, branch.name)

4. If no branch matched AND employee.type == FIELD_WORKER → return FIELD
5. If no branch matched AND employee.type == REGULAR → return HOME
```

**And** nearest branch and distance are always stored regardless of classification

**And** `branch_start` and `branch_end` are stored separately (clock-in branch vs clock-out branch)

**And** fraud detection flags are set:
- `startIsSuspicious = true` if: accuracy == 0, OR coordinates are (0,0), OR known VPN IP range

**And** suspicious shifts are flagged with ⚠️ in the manager dashboard

**And** geofence calculation completes in < 1 second for 100+ branches

---

### Story 3.3: End Shift & Double-Shift Protection

As an **employee**,
I want to end my shift and be protected from accidentally starting two shifts,
So that my time records are always accurate.

**Acceptance Criteria:**

**Given** an employee has an ACTIVE shift
**When** employee taps "End Shift"
**Then** app sends `POST /api/v1/shifts/clock-out` with GPS payload (same structure as clock-in)

**And** server updates ShiftRecord:
```
status: CLOSED
endedAt: [timestamp]
endLatitude, endLongitude, endGpsAccuracy
endLocationType: [classified]
endBranchId: [if classified as BRANCH]
durationMinutes: calculated (endedAt - startedAt in minutes)
```

**And** employee sees: "✅ Shift ended — 8h 15m worked"

**And** if employee taps "Start Shift" while already having an ACTIVE shift:
- Button shows "⚠️ You have an open shift"
- Prompt appears: "End your current shift first, or continue it?"
- Two options: [End Current Shift] [Keep Open]
- Clock-in is BLOCKED until current shift is resolved

**And** `POST /api/v1/shifts/clock-in` returns error if active shift exists:
```json
{ "success": false, "error": { "code": "SHIFT_ALREADY_ACTIVE", "statusCode": 409 } }
```

---

### Story 3.4: Unclosed Shift Alert for Manager

As a **branch manager**,
I want to be alerted when an employee's shift has been open too long,
So that I can close it manually and keep payroll records accurate.

**Acceptance Criteria:**

**Given** a branch has a configured maximum shift duration (e.g., 10 hours)
**When** an employee's ACTIVE shift exceeds that duration
**Then** the shift status changes to `FLAGGED_UNCLOSED`

**And** in the Manager Dashboard, the shift appears highlighted in red with label "⚠️ Unclosed shift (12h)"

**And** a notification banner appears at the top of the manager dashboard: "3 employees have unclosed shifts"

**And** the maximum shift duration is configurable per branch by Admin (default: 10 hours)

**And** a background job runs every 30 minutes to check and flag overdue shifts

**And** the employee's clock-in button shows "You have an unclosed shift from yesterday" and does NOT block them — they can start a new shift (previous one stays FLAGGED_UNCLOSED for manager to resolve)

---

## Epic 4: Employee Self-Service

**Goal:** Employee can check their own shift history and view their consent record — no need to ask a manager.

---

### Story 4.1: Employee Shift History

As an **employee**,
I want to see my own shift history,
So that I can verify my hours are recorded correctly.

**Acceptance Criteria:**

**Given** an employee is logged in
**When** they navigate to "My Shifts" tab
**Then** they see a list of their past 30 days of shifts

**And** each shift shows:
- Date
- Start time and End time (or "Open" if still active)
- Duration (hours and minutes)
- Location type badge: 🏢 Branch / 🏠 Home / 🚗 Field / ❓ Unknown
- Branch name (if BRANCH type)
- ✏️ icon if manually edited by manager

**And** employee can scroll to load older shifts (pagination, 30 per page)

**And** `GET /api/v1/shifts/my?page=1&limit=30` returns paginated results

**And** employee CANNOT edit or delete any shift records — view only

---

### Story 4.2: Employee Profile & Consent Record

As an **employee**,
I want to see my profile and my consent record,
So that I know what data is stored about me.

**Acceptance Criteria:**

**Given** an employee is logged in
**When** they open "My Profile" screen
**Then** they see:
- Full name
- Phone number (masked: +972 ***-***-1234)
- Home branch name
- Employee type (Regular / Field Worker)
- Language preference selector

**And** they see "GPS Consent" section showing:
- Date and time consent was given
- Consent version accepted ("Version 1.0")
- Text: "You agreed that ShiftTrack captures your location only at shift start and end"

**And** `GET /api/v1/consent/mine` returns their consent record

**And** employee can change their preferred language (saved to localStorage)

---

## Epic 5: Branch Management

**Goal:** Admin can create, import, and manage all Pizza Hut branches. Each branch has GPS coordinates and a QR code for employees to scan and clock in.

---

### Story 5.1: Create & Edit Branches (Manual)

As an **admin**,
I want to create and edit branch records with GPS coordinates,
So that the geofence system knows where each branch is located.

**Acceptance Criteria:**

**Given** an admin is logged in to the dashboard
**When** they navigate to "Branches" and click "Add Branch"
**Then** a form appears with fields:
- Branch name (required)
- Address (required)
- City (required)
- GPS Latitude and Longitude (auto-filled from geocoding OR manual entry)
- Geofence radius in meters (default: 150, range: 50–500)

**And** when admin enters address and clicks "Auto-detect coordinates":
- Google Maps Geocoding API is called
- Coordinates are filled in automatically
- A map preview shows the branch location with geofence circle

**And** on save: `POST /api/v1/branches` creates the branch record

**And** admin can edit any branch via `PUT /api/v1/branches/:id`

**And** admin can deactivate a branch (soft delete — shifts history preserved)

**And** branch table has columns: Name, City, Geofence Radius, Active employees today, Status, Actions

---

### Story 5.2: Bulk Branch Import from Excel

As an **admin**,
I want to import all 100+ branches from an Excel file,
So that I don't have to create them one by one.

**Acceptance Criteria:**

**Given** an admin has an Excel file with branch data
**When** they click "Import Branches" and upload the file
**Then** system reads the file and displays a preview table of branches to be imported

**And** the Excel file format is documented and an example template is downloadable

**And** required columns: `name`, `address`, `city`
**And** optional columns: `geofence_radius`, `latitude`, `longitude`

**And** if latitude/longitude are not provided:
- System calls Google Maps Geocoding API for each branch
- Progress bar shown during geocoding (can take 10–30 seconds for 100 branches)

**And** system validates each row:
- Missing required fields → row marked red with error
- Duplicate branch name → warning shown

**And** admin reviews preview, then clicks "Import [N] branches"

**And** `POST /api/v1/branches/import` processes the file server-side

**And** import result shows: "98 branches imported, 2 errors (shown below)"

---

### Story 5.3: Branch QR Code & Short URL

As a **branch manager**,
I want each branch to have a QR code that employees can scan to open ShiftTrack,
So that employees always have easy access without losing the link.

**Acceptance Criteria:**

**Given** a branch exists in the system
**When** admin or manager clicks "Get QR Code" for a branch
**Then** a QR code image is displayed that encodes the branch's unique short URL

**And** the short URL format is: `https://[domain]/b/[shortCode]`
**And** shortCode is auto-generated (6 characters, alphanumeric)

**And** when an employee scans the QR code:
- ShiftTrack opens in their browser pre-filled with branch context
- If already logged in → goes directly to clock-in screen
- If not logged in → goes to login screen, then clock-in

**And** admin can download the QR code as PNG for printing (A4 poster size option)

**And** `GET /api/v1/branches/:id/qr` returns QR code image (PNG)

---

## Epic 6: Employee Management

**Goal:** Admin can create employee accounts manually or import from Excel. Employees get SMS with their ShiftTrack link and can activate their account.

---

### Story 6.1: Create Employees (Manual) & SMS Invitation

As an **admin or branch manager**,
I want to create employee accounts and send them an SMS invitation,
So that employees can start using ShiftTrack without IT involvement.

**Acceptance Criteria:**

**Given** an admin is logged in
**When** they click "Add Employee" and fill in the form
**Then** a new employee account is created with:
- Full name (required)
- Phone number (required, with +972 format validation)
- Role: Employee (default) / Branch Manager / Accounting / Top Management
- Home Branch (dropdown from active branches)
- Employee Type: Regular / Field Worker

**And** after saving, system sends an SMS via Twilio:
> *"Hi [Name]! You've been added to ShiftTrack. Open the app here: https://[domain]/b/[branchShortCode]. Your login: [phone number]."*

**And** admin can resend the SMS invitation from the employee detail page

**And** `POST /api/v1/employees` creates the employee record

**And** branch managers can only create employees for their own branch

---

### Story 6.2: Bulk Employee Import from Excel

As an **admin**,
I want to import employees from an Excel file,
So that I can onboard 1,000 employees quickly without manual entry.

**Acceptance Criteria:**

**Given** an admin has an Excel file with employee data
**When** they click "Import Employees" and upload the file
**Then** system reads the file and shows a preview table

**And** required Excel columns: `full_name`, `phone`
**And** optional columns: `role` (default: EMPLOYEE), `home_branch_name`, `employee_type` (default: REGULAR)

**And** system validates each row:
- Invalid phone format → row marked red
- Unknown branch name → warning
- Duplicate phone number → row marked red with "already exists"

**And** admin reviews preview and clicks "Import [N] employees"

**And** after import, system sends SMS invitations to all successfully imported employees

**And** import result shows: "985 employees imported, 15 errors"

**And** error rows are downloadable as Excel for correction and re-import

**And** `POST /api/v1/employees/import` handles file upload server-side

---

## Epic 7: Manager Dashboard

**Goal:** Branch manager opens dashboard and immediately sees who is working right now. Can view history, make manual overrides, and see suspicious GPS flags.

---

### Story 7.1: "Who's Working Now" — Live Attendance Screen

As a **branch manager**,
I want to see who is currently working in my branch as the first thing I see,
So that I can instantly know the attendance status without searching.

**Acceptance Criteria:**

**Given** a branch manager is logged in
**When** the dashboard loads
**Then** the default screen is "Active Shifts" showing the current status of all branch employees

**And** the screen is divided into sections:
- 🟢 **On Shift** (N employees) — with name, start time, location badge, duration so far
- 🔴 **Not Started** (N employees) — employees expected today but no shift
- ⚠️ **Unclosed Shifts** (N employees) — FLAGGED_UNCLOSED status, shown prominently

**And** data refreshes automatically every 30 seconds

**And** branch manager ONLY sees employees from their assigned branch(es) — server enforces this

**And** each row shows: name, start time, location type badge (🏢/🏠/🚗/❓), duration, ⚠️ if suspicious GPS

**And** `GET /api/v1/dashboard/active` returns only branch-scoped data (enforced server-side by JWT branchId claim)

---

### Story 7.2: Shift History View (per Employee)

As a **branch manager**,
I want to view any employee's full shift history with date filters,
So that I can review attendance for payroll or dispute resolution.

**Acceptance Criteria:**

**Given** a branch manager is on the dashboard
**When** they click on an employee name or navigate to "Shift History"
**Then** they see a table of all shifts for that employee (or all employees in their branch)

**And** filters available:
- Date range (from/to date picker)
- Employee (dropdown, all employees in branch)
- Location type (All / Branch / Home / Field / Unknown)
- Status (All / Closed / Unclosed / Manual Override)

**And** each shift row shows:
- Employee name
- Date
- Start time and end time
- Duration
- Location type (start and end)
- Branch name (start and end)
- Duration in hours
- ✏️ badge if manually edited

**And** `GET /api/v1/dashboard/shifts?branchId=&startDate=&endDate=&employeeId=` returns filtered results

**And** manager CANNOT see shifts from other branches

---

### Story 7.3: Manual Shift Override (Close/Edit)

As a **branch manager**,
I want to manually close or edit a shift record,
So that I can fix mistakes when an employee forgot to clock out.

**Acceptance Criteria:**

**Given** a branch manager sees an unclosed or incorrect shift
**When** they click "Edit" on a shift record
**Then** a modal opens with editable fields:
- Start time (date + time)
- End time (date + time, can be set even if shift was never closed)
- Reason for edit (text field, required)

**And** manager clicks "Save Override"

**And** system updates the shift record with:
- New start/end times
- `isManualOverride: true`
- `overriddenBy: [managerId]`

**And** an AuditLog entry is created:
```json
{
  "action": "SHIFT_MANUAL_OVERRIDE",
  "actorId": "managerId",
  "targetId": "shiftId",
  "before": { "startedAt": "...", "endedAt": null },
  "after": { "startedAt": "...", "endedAt": "...", "reason": "Employee forgot to clock out" },
  "ipAddress": "..."
}
```

**And** the edited shift displays ✏️ "Manually edited by [Manager Name] on [date]" in all views

**And** `PATCH /api/v1/dashboard/shifts/:id` handles the override

**And** manager CANNOT edit shifts from other branches (server enforces)

---

## Epic 8: Accounting & Reports

**Goal:** Accounting user sees all employees across all branches, calculates hours, and exports payroll-ready reports.

---

### Story 8.1: Accounting Dashboard — Hours Summary

As an **accounting user**,
I want to see total hours worked by all employees across all branches for a date range,
So that I have the data needed to calculate payroll.

**Acceptance Criteria:**

**Given** an accounting user is logged in
**When** they open the Reports page and select a date range
**Then** they see a summary table with:

| Employee | Branch | Branch Hours | Home Hours | Field Hours | Total Hours |
|----------|--------|--------------|-----------|-------------|-------------|
| Name | Branch Name | 80h | 8h | 0h | 88h |

**And** filters available:
- Date range (from/to, required)
- Branch (dropdown: "All Branches" or specific branch)
- Employee type (All / Regular / Field Worker)

**And** table shows totals row at the bottom: total hours across all employees

**And** accounting user can drill down into any employee to see their individual shifts

**And** `GET /api/v1/reports/hours?startDate=&endDate=&branchId=` returns hours data

**And** query runs in < 10 seconds for 1,000 employees, 1 month of data

**And** manual override records are included with ✏️ indicator

---

### Story 8.2: Export to Excel & PDF

As an **accounting user**,
I want to export the hours report to Excel and PDF,
So that I can send it to payroll processing or keep it as a record.

**Acceptance Criteria:**

**Given** an accounting user has a filtered report on screen
**When** they click "Export Excel" or "Export PDF"
**Then** a file download starts immediately (within 10 seconds)

**And** the Excel file (.xlsx) contains:
- Sheet 1: Summary (one row per employee: name, ID, branch, total hours by type)
- Sheet 2: Detail (one row per shift: employee, date, start, end, duration, location, manual flag)

**And** the PDF file contains:
- Header: "Pizza Hut Israel — Hours Report [date range]"
- Summary table formatted for printing
- Footer: "Generated on [date] by [accounting user name]"

**And** both exports respect the current filters applied on screen

**And** `GET /api/v1/reports/export/excel?startDate=&endDate=&branchId=` streams Excel file
**And** `GET /api/v1/reports/export/pdf?startDate=&endDate=&branchId=` streams PDF file

**And** response headers include proper `Content-Type` and `Content-Disposition: attachment; filename=...`

---

## Epic 9: Top Management Overview

**Goal:** Top Management sees a read-only aggregate view of attendance across all 100+ branches — no editing, just awareness.

---

### Story 9.1: Executive Attendance Dashboard

As a **top management user**,
I want to see an aggregate attendance overview of all branches,
So that I can spot branches with issues and have an operational pulse.

**Acceptance Criteria:**

**Given** a top management user is logged in
**When** they open the dashboard
**Then** they see a top-level KPI bar:
- 🟢 **Currently on shift:** [total employees across all branches]
- 📊 **Hours this week:** [total hours, all branches]
- ⚠️ **Unclosed shifts:** [count across all branches]

**And** below the KPIs: a branch list table showing:
| Branch | Active Now | Expected | Unclosed | Hours Today |
|--------|-----------|----------|----------|-------------|
| Tel Aviv Dizengoff | 8 | 10 | 1 | 64h |

**And** top management CANNOT click into individual employee records — branch level only

**And** top management CANNOT edit any records — view only (enforced server-side)

**And** data shows real-time (refreshes every 60 seconds)

**And** `GET /api/v1/overview/summary` returns aggregate data (role: TOP_MANAGEMENT only)

---

## Implementation Notes for Developers

### Story Execution Order

Stories must be implemented in epic order. Do not start Epic 2 until Epic 1 is complete. Within each epic, stories are numbered in implementation order.

### Key Patterns (from Architecture doc)

- All API responses: `{ "success": true/false, "data": ... }` or `{ "success": false, "error": { "code": "...", "statusCode": ... } }`
- All timestamps: UTC ISO 8601 in API, displayed in Asia/Jerusalem timezone on frontend
- All DB primary keys: UUID v4
- Branch manager scope: enforced by `branchId` claim in JWT, filtered on every query
- Audit log: every manual override writes to `audit_logs` table via `AuditService.record()`
- GPS fraud detection: every clock-in checks and stores accuracy + IP + user-agent

### Definition of Done (per story)

- [ ] API endpoint implemented with proper DTO validation
- [ ] Unit tests written for service logic
- [ ] Frontend component implemented and connected to API
- [ ] RTL layout works for Hebrew/Arabic (employee-facing stories)
- [ ] Role guard enforced (unauthorized access returns 403)
- [ ] Docker Compose stack starts successfully with the new code
- [ ] Deployed to Contabo server via GitHub Actions

---

*Document status: Complete — ready for development*  
*Start with Epic 1, Story 1.1*
