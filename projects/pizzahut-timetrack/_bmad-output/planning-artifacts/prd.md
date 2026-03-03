---
stepsCompleted: [step-01-init.md, step-02-discovery.md, step-02b-vision.md, step-02c-executive-summary.md, step-03-success.md, step-04-journeys.md, step-05-domain.md, step-07-project-type.md, step-08-scoping.md, step-09-functional.md, step-10-nonfunctional.md, step-11-polish.md, step-12-complete.md]
inputDocuments: [_bmad-output/planning-artifacts/project-brief.md]
workflowType: prd
classification:
  projectType: mobile_web_app + saas_b2b
  domain: workforce_management
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document
# ShiftTrack — Employee Time & Location Tracking

**Client:** Pizza Hut Israel  
**Author:** Beomytech Ltd  
**Date:** 2026-03-03  
**Version:** 1.1 (updated after CTO review)  

---

## Executive Summary

ShiftTrack is a mobile-first workforce management system built for Pizza Hut Israel. It enables 1,000+ employees across 100+ branches to clock in and out via a single-tap PWA interface, with GPS-based automatic location classification (branch / home / field). Managers get real-time attendance visibility per branch; accounting gets accurate hours data with one-click export for payroll.

The core insight: **Pizza Hut's workforce is distributed, multilingual, and mobile-only**. Existing solutions require app installation, support only Hebrew, or lack GPS context. ShiftTrack delivers a zero-install, four-language experience that works from any smartphone — no IT involvement required.

### What Makes This Special

- **Zero install:** Opens from a link in any mobile browser (Chrome/Safari). No App Store, no MDM, no corporate device required.
- **GPS on tap only:** Location is captured once — at button press — with full consent transparency. No continuous tracking, no privacy concerns.
- **Automatic location context:** The system knows whether the employee is at a branch, working remotely, or in the field — without any manual input from the employee.
- **Role-aware dashboard:** Branch manager, accounting, and executive views are completely separate — each person sees exactly what they need, nothing more.

## Project Classification

- **Project Type:** Mobile Web App (PWA) + B2B Management Dashboard  
- **Domain:** Workforce Management / Employee Attendance  
- **Complexity:** Medium (multi-role, multi-language, GPS geofencing, data export)  
- **Context:** Greenfield — new product, no existing system to replace  

---

## Success Criteria

### User Success

- Employee completes clock-in within 10 seconds of opening the app
- First-time consent flow takes under 30 seconds and requires no support
- Employee can view their own shift history without contacting a manager
- GPS location classified automatically — employee never needs to select "branch / home / field" manually

### Business Success

- 90% of employees actively using the system within 60 days of rollout
- Accounting department generates payroll-ready export in under 5 minutes (vs. hours manually)
- Zero GPS consent complaints from employees (clear, honest consent language)
- System stable during peak load: shift-start rush with 500+ simultaneous check-ins

### Technical Success

- 99.5% uptime during working hours (06:00–24:00 Israel time)
- GPS classification responds within 3 seconds of button press
- All employee PII encrypted at rest and in transit
- Audit log for every time record (create / edit / manual override)

### Measurable Outcomes

| Metric | Target | Timeline |
|--------|--------|----------|
| Employee adoption | ≥90% active users | 60 days post-launch |
| Time to clock-in | <10 seconds | Day 1 |
| Payroll export time | <5 minutes | Day 1 |
| System uptime | ≥99.5% | Ongoing |
| Support tickets (GPS consent) | 0 | Ongoing |

## Product Scope

### MVP — Minimum Viable Product (v1)

- Employee PWA: clock in/out with GPS classification
- Consent flow (first use)
- GPS permission request (if disabled)
- Employee shift history (own records only)
- Branch geofence setup (admin)
- Employee management: manual + Excel import
- Role-based dashboard: Branch Manager / Accounting / Top Management
- Hours calculation in dashboard
- Excel + PDF export
- Multi-language: Hebrew, Russian, Arabic, English (employee app)
- Manager dashboard: Hebrew only

### Growth Features (v2)

- Native iOS + Android apps (App Store / Google Play)
- Field worker GPS route tracking during shift (requires native app)
- Push notifications for unclosed shifts
- Priority ERP integration (or other ERP — system-agnostic)
- Manager dashboard multi-language

### Vision (v3+)

- Shift scheduling module
- Advanced analytics and attendance trends
- Manager approval workflow for time corrections
- Payroll system deep integration (not just export)
- Biometric or NFC clock-in option

---

## User Journeys

### Journey 1: Dina — Branch Employee (Clock-In, Happy Path)

Dina works the morning shift at the Pizza Hut branch in Rishon LeZion. It's 08:55 AM, she's just arrived at the branch. Her manager sent her a link to ShiftTrack last week.

She opens her phone, taps the ShiftTrack icon on her home screen (she added it from her browser), and sees the big green **"Start Shift"** button. She taps it. The app asks for location permission — she approves. Three seconds later: *"Shift started — 📍 Branch (Rishon LeZion)"*. Done. She puts her phone in her pocket and starts work.

At the end of her shift, same flow — one tap, shift ends, location confirmed.

**This journey reveals:** One-tap UX, GPS permission request, geofence classification, shift confirmation screen, minimal cognitive load.

---

### Journey 2: Mikhail — Remote Employee (Working from Home)

Mikhail handles customer service for Pizza Hut central and works from home on Tuesdays. He opens ShiftTrack on his laptop browser (PWA works on desktop too), taps **"Start Shift"**. GPS shows he's 14km from the nearest branch. The system classifies him as 🏠 **Home**. He sees his shift start confirmation with the "Home" label. No friction, no questions asked.

**This journey reveals:** Home classification logic, no blocking behavior for off-site workers, desktop browser compatibility.

---

### Journey 3: Yosef — Field Technician (On the Road)

Yosef is a maintenance technician who travels between branches fixing equipment. His employee profile has the **"Field Worker"** flag set by HR. He taps Start Shift from the road. GPS shows he's not near any branch. System classifies him as 🚗 **Field**. His manager can see he started his shift in Haifa, even though his home branch is Tel Aviv.

**This journey reveals:** Field worker employee type, road classification, manager visibility of actual shift branch vs. home branch.

---

### Journey 4: Noa — Branch Manager (Monitoring Attendance)

Noa manages 18 employees at the Beer Sheva branch. It's 09:15 AM and she wants to check who's clocked in. She opens the manager dashboard on her laptop, sees a live table: 14 of 18 employees are shown as "Active", 2 haven't started, 2 are marked "Home". She can click on any employee to see their full shift history. She notices one employee has an unclosed shift from yesterday — she overrides it manually, and the record is marked "Manual Entry — Manager Override".

**This journey reveals:** Real-time attendance table, employee detail view, manual override with audit trail, manager-only scope (can't see other branches).

---

### Journey 5: Rachel — Accounting (Payroll Export)

Rachel is the payroll accountant. It's the 1st of the month. She logs into ShiftTrack, selects all branches, sets the date range to last month, and clicks **"Generate Report"**. She sees a summary table: employee name, branch, total hours worked, breakdown by location type (branch / home / field). She exports to Excel. The file is formatted for their payroll system. Done in 4 minutes.

**This journey reveals:** Multi-branch view, date range filter, hours calculation, location breakdown in reports, Excel/PDF export, accounting-specific role.

---

### Journey 6: Adam — New Employee (First Time Consent)

Adam just joined. His manager sent him the ShiftTrack link. He opens it for the first time. Before anything else, he sees the **Consent Screen**:

> *"ShiftTrack records your location ONLY when you press the Start/End Shift button. We do not track your location continuously. Your location data is used only to classify your shift as: Branch, Home, or Field."*

He sees a checkbox: "I agree to GPS location capture at shift start and end." He checks it, taps **"Continue"**. The consent is recorded with timestamp. He never sees this screen again.

**This journey reveals:** First-run consent flow, consent record storage, clear language about tracking scope, one-time display only.

---

### Journey 7: Top Management (Overview)

The regional director logs in and sees a dashboard with all 100+ branches: total active employees right now, branches with low attendance, total hours this week across the organization. No ability to edit records — view only. Used for operational awareness and spotting branch-level issues.

**This journey reveals:** Executive overview, read-only access, cross-branch aggregation, KPI summary widgets.

### Journey Requirements Summary

| Journey | Key Capabilities Required |
|---------|--------------------------|
| Dina (clock-in) | PWA, GPS, geofence, one-tap UX, shift confirmation |
| Mikhail (remote) | Home classification, no-block policy, desktop support |
| Yosef (field) | Field worker type, road classification, branch vs. home branch |
| Noa (manager) | Real-time table, manual override, audit trail, branch scope |
| Rachel (accounting) | Multi-branch report, date range, hours calc, export |
| Adam (first time) | Consent flow, consent record, clear language |
| Regional director | Executive dashboard, cross-branch view, read-only |

---

## Domain-Specific Requirements

### Privacy & Consent (Israeli Law — חוק הגנת הפרטיות)

- Explicit employee consent required before any GPS data is collected
- Consent record must store: employee ID, timestamp, consent version, IP/device identifier
- Consent screen must clearly state: location captured only at button press, not continuously
- Employees must be able to view their own consent record
- Data retention policy must be defined and enforced (recommended: 7 years for payroll records per Israeli labor law)
- Right to access own data: employee can request export of their own records

### Employment Law Considerations

- Manual override of time records must be attributed to the manager who made the change
- Audit trail is legally required for payroll disputes
- System must support the definition of standard workday hours per branch (for unclosed shift detection)

### Security Requirements

- All data encrypted in transit (HTTPS/TLS 1.3)
- All PII (names, locations, hours) encrypted at rest (AES-256)
- Role-based access: no cross-branch data leakage
- JWT tokens with short expiry (1 hour) + refresh tokens
- Rate limiting on all authentication endpoints (brute force protection)
- Input validation and SQL injection protection throughout
- Audit log for all administrative actions (cannot be deleted)
- Session management: auto-logout after 30 minutes of inactivity (manager dashboard)

---

## Mobile Web App (PWA) Technical Requirements

### Platform Support

- iOS Safari 15+ (iPhone 8 and newer)
- Android Chrome 90+
- Desktop Chrome/Firefox/Edge (secondary, for remote workers)
- Installable to home screen (PWA manifest + service worker)
- Works without app store — accessible via direct URL

### GPS & Geofencing

- Uses browser Geolocation API (`navigator.geolocation.getCurrentPosition`)
- Single location capture per button press (not continuous)
- Server-side geofence validation (client sends coordinates, server classifies)
- Geofence radius: 50–200 meters per branch (configurable by admin)
- GPS accuracy threshold: if `accuracy > 500m`, mark shift as "Location Uncertain"
- If GPS is disabled: show in-app guide to enable location permissions
- If GPS times out (>10 seconds): allow clock-in with "Unknown" location, notify manager

### RTL & Internationalization

- Full RTL layout for Hebrew and Arabic
- Language detection from browser locale (overridable in app settings)
- All UI strings in translation files (no hardcoded text)
- Date/time formatted per locale (Hebrew calendar awareness not required for v1)
- Languages: Hebrew (he), Russian (ru), Arabic (ar), English (en)

### Performance

- First load (cold): < 3 seconds on 4G
- Clock-in action (GPS capture + server response): < 5 seconds
- Works on older Android devices (2GB RAM minimum target)

---

## Functional Requirements

### Employee Shift Management

- FR1: Employee can start a shift with a single button tap
- FR2: Employee can end an active shift with a single button tap
- FR3: System automatically captures GPS coordinates at shift start and end
- FR4: System classifies shift location as Branch, Home, Field, or Unknown
- FR5: Employee can view their own shift history (date, start/end time, location type, branch)
- FR6: If employee already has an open shift, Start Shift button is blocked and system offers "End current shift?" prompt
- FR6b: System auto-flags (does NOT auto-close) shifts exceeding the configured maximum duration; Branch Manager receives notification and must confirm closure with a custom end time

### GPS & Location

- FR7: System compares employee GPS coordinates against all branch geofences to determine branch location
- FR7b: If GPS accuracy > 300m (poor indoor signal), system uses an extended fallback radius (configurable, default 400m) before classifying as Home/Field — reducing false negatives inside buildings and malls
- FR7c: System records per shift: branch_start (GPS at clock-in) and branch_end (GPS at clock-out) separately
- FR8: System determines nearest branch and distance, even if outside geofence
- FR9: System classifies employee as "Field" if their profile has Field Worker flag and they are outside any branch geofence
- FR10: System classifies employee as "Home" if outside all branch geofences and not a Field Worker
- FR11: System marks shift location as "Unknown" if GPS accuracy is too low or GPS request times out
- FR12: App requests GPS permission from the OS if not yet granted, with in-app explanation

### Consent & Onboarding

- FR13: System shows consent screen to new employees before their first clock-in
- FR14: Employee must accept GPS consent before using clock-in functionality
- FR15: System stores consent record with employee ID, timestamp, and consent version
- FR16: Consent screen clearly states location is captured only at button press, not continuously
- FR17: Employee can view their own consent record in their profile
- FR17b: Employee onboarding flow — HR imports employee (name + phone number); system sends SMS with ShiftTrack link; employee opens link, enters phone number, receives OTP code, verifies and activates account. No username/password required.
- FR17c: Each branch has a unique short URL and a printable QR code (generated by admin) that links directly to the ShiftTrack clock-in screen for that branch

### Employee Management (Admin)

- FR18: Admin can create individual employee accounts with: name, role, home branch, employee type (regular / field worker)
- FR19: Admin can bulk-import employees from Excel file
- FR20: Admin can deactivate employees (preserves historical data)
- FR21: Admin can assign employees to a home branch
- FR22: System supports employees working across multiple branches (actual branch determined by GPS per shift)

### Branch Management

- FR23: Admin can create and edit branch records with: name, address, city, GPS coordinates, geofence radius
- FR24: Admin can bulk-import branches from Excel file
- FR25: System auto-geocodes branch address to GPS coordinates during import
- FR26: Admin can deactivate branches (preserves historical data)

### Manual Override & Audit

- FR27: Manager can manually close an unclosed shift with a custom end time
- FR28: Manager can edit start or end time of any shift belonging to their branch
- FR29: All manual overrides are recorded with: manager ID, timestamp, original value, new value
- FR30: Manual overrides are visually distinguished from automatic records in all views

### Manager Dashboard

- FR31: Branch Manager dashboard opens on "Who's Working Now" screen by default — showing all currently active employees with name, shift start time, and location type
- FR31b: Manager can view employees not yet started, employees on shift, and employees with unclosed shifts — all in one view
- FR32: Manager can view shift history for any employee in their branch with date range filter
- FR33: Manager can see: employee name, shift start/end, location type, branch_start, branch_end, duration, manual override flag
- FR34: Manager receives in-dashboard notification of unclosed shifts exceeding configured maximum duration

### Accounting & Reporting

- FR35: Accounting user can view shifts across all branches with date range and branch filters
- FR36: System calculates total hours worked per employee per period
- FR37: System provides breakdown of hours by location type (Branch / Home / Field) per employee
- FR38: Accounting user can export reports to Excel (.xlsx) and PDF
- FR39: Export includes: employee name, employee ID, branch, dates, hours by type, total hours

### Top Management

- FR40: Top Management user can view aggregate attendance across all branches (read-only)
- FR41: Top Management dashboard shows: active employees now, total hours this week, branch-level summary

### Access Control

- FR42: System enforces role-based access: Employee / Branch Manager / Accounting / Top Management / Admin
- FR43: Branch Manager can only access data for their assigned branch(es)
- FR44: Admin with appropriate permission level can create and manage user accounts
- FR45: No user can access data beyond their role scope (enforced server-side)

### Notifications

- FR46: System sends in-dashboard alert to Branch Manager when an employee's shift exceeds the configured maximum duration without being closed

---

## Non-Functional Requirements

### Performance

- Clock-in action (button tap to confirmation): < 5 seconds on 4G connection
- Dashboard page load: < 3 seconds
- Report generation (1 month, all branches): < 10 seconds
- System supports 500+ simultaneous clock-ins without degradation
- GPS geofence calculation: < 1 second server-side

### Security

- All data encrypted in transit: HTTPS/TLS 1.3 minimum
- All PII encrypted at rest: AES-256
- Authentication: phone number + OTP (employees); email + password + 2FA (managers/admin)
- JWT with 1-hour expiry + refresh token rotation
- Brute force protection: rate limiting on login endpoint (max 5 attempts / 15 min)
- SQL injection and XSS protection on all inputs
- Admin audit log: immutable, stores all create/edit/delete/override actions
- OWASP Top 10 compliance
- Session timeout: 30 minutes inactivity on dashboard
- GPS fraud detection: system records IP address, GPS accuracy, and device User-Agent with each clock-in; shifts with suspicious signals (e.g. GPS accuracy = 0, known VPN/proxy IP, or coordinates changing implausibly fast) are flagged as "Suspicious Location" for manager review

### Scalability

- Architecture supports horizontal scaling (stateless backend)
- Database designed for 1,000+ employees, 100+ branches, 3+ years of shift history
- No hard limits on number of branches or employees (soft config limit only)

### Accessibility

- Employee app: meets WCAG 2.1 AA for color contrast and touch target size
- All buttons minimum 44x44px touch target (mobile usability)
- App functional with screen readers (VoiceOver / TalkBack) for key actions

### Reliability

- Target uptime: 99.5% during business hours (06:00–24:00 IST)
- Graceful degradation: if GPS fails, user can still clock in (with Unknown location)
- Data not lost on network interruption: client retries clock-in request up to 3 times

### Reliability (Network Handling)

- Client retries failed clock-in requests up to 3 times with exponential backoff
- If all retries fail, user sees clear error message: "Connection failed — please try again" (no silent failure)
- Full offline mode (queue + sync) is deferred to v2

### Data Retention

- Shift records retained for minimum 7 years per Israeli labor law
- After retention period: data anonymized or deleted per policy to be defined with Pizza Hut legal team *(requires client sign-off)*
- Employees can request export of their own personal data at any time (GDPR-adjacent right)

### Integration (Future-Ready)

- Employee import API designed to be ERP-agnostic (not tightly coupled to Priority)
- Export format documented and stable (Excel/PDF schema versioned)
- REST API with versioning (/api/v1/) for future integrations

---

*Document status: Complete — ready for Architecture phase*  
*Next step: Architecture Document (Architect agent)*
