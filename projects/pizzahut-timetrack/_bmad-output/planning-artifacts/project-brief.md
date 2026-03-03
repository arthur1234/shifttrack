# Project Brief: Employee Time Tracking System
**Client:** Pizza Hut Israel  
**Project:** ShiftTrack — Employee Time & Location Tracking  
**Date:** 2026-03-03  
**Version:** 1.0  

---

## Executive Summary

Pizza Hut Israel operates 100+ branches across the country with 1,000+ employees. The company needs a modern, mobile-first system for tracking employee work hours with GPS-based location context. The solution will replace manual timekeeping, provide real-time visibility for branch managers, and give accounting/HR accurate data for payroll calculation — all accessible from any smartphone without requiring app installation.

---

## Problem Statement

Pizza Hut Israel currently lacks a centralized, reliable system to:
- Track when employees start and end their shifts
- Verify employee location at shift start (branch, home, or field)
- Give branch managers visibility into their team's attendance
- Give accounting/HR accurate hours data for payroll across 100+ branches
- Handle compliance requirements around employee location consent

Manual tracking leads to inaccurate records, payroll disputes, and significant administrative overhead across a large distributed workforce.

---

## Goals & Success Metrics

### Business Goals
- Eliminate manual timekeeping across all 100+ branches
- Reduce payroll calculation time for accounting department
- Give management real-time visibility into workforce attendance
- Create audit trail for all time records

### Success Metrics
- 90%+ employee adoption within 60 days of launch
- Payroll export ready within minutes (vs. hours manually)
- Zero GPS consent complaints (proper consent flow)
- System handles 1,000+ concurrent check-ins without downtime

---

## Target Users

### 1. Employee (Field / Branch Worker)
- Uses mobile web app on personal or company phone
- Speaks Hebrew, Russian, Arabic, or English
- Not necessarily tech-savvy
- Primary action: press start/end shift button

### 2. Branch Manager
- Manages one branch, needs to see their team only
- Web dashboard (Hebrew)
- Monitors attendance, approves records, reviews hours

### 3. Accounting / HR
- Accesses all branches
- Calculates salaries based on hours worked
- Exports data to Excel/PDF
- Reviews hours across the entire organization

### 4. Top Management
- Overview of all branches
- Attendance trends and summary reports
- No operational actions needed

---

## Core Features (v1)

### Employee Mobile Web App (PWA)
- **Single-button UX:** Big "Start Shift" / "End Shift" button
- **GPS consent flow:** First-time users see consent screen explaining location is only captured on button press (not continuously tracked)
- **GPS permission request:** If location is disabled, app guides user to enable it
- **Location classification:** On button press, GPS coordinates are compared against known branch locations:
  - 🏢 At branch (within geofence radius)
  - 🏠 At home / remote
  - 🚗 On the road / field visit
- **Shift history:** Employee can view their own past shifts
- **Multi-language:** Hebrew (default), Russian, Arabic, English — with full RTL support for Hebrew and Arabic

### Web Management Dashboard (Hebrew only, v1)
- **Role-based access:** Branch Manager / Accounting / Top Management
- **Branch Manager view:** Real-time attendance for their branch, shift history per employee
- **Accounting view:** All branches, hours calculation per employee, date range filters
- **Top Management view:** All-branches summary, attendance overview
- **Export:** Excel and PDF reports for payroll periods
- **Employee management:** Add/edit employees manually or import via Excel

### Admin / System
- Excel import for employee roster (bulk onboarding)
- Branch location setup (GPS coordinates + geofence radius per branch)
- User account management (create managers, accounting users)

---

## Technical Constraints

- Must support **1,000+ concurrent users** (peak: shift start times)
- **RTL layout** required for Hebrew and Arabic interfaces
- Mobile web must work on **iOS Safari and Android Chrome** (no app install)
- GPS accuracy sufficient for geofence radius of ~100-200 meters per branch
- **Data privacy compliance:** Israeli privacy law (location data, employee consent)
- Consent record must be stored per employee with timestamp

---

## Out of Scope (v1)

- Native iOS / Android apps (planned for v2)
- Priority ERP integration (planned, not in v1)
- Biometric authentication
- Shift scheduling / planning
- Payroll calculation engine (export only — calculation is done in external systems)
- Push notifications
- Offline mode
- Manager dashboard in languages other than Hebrew

---

## Future Roadmap

### v2
- Native iOS + Android apps (submit to App Store / Google Play)
- Push notifications for missed check-ins
- Priority ERP integration (sync employee list automatically)

### v3+
- Shift scheduling module
- Advanced analytics and attendance trends
- Manager approval workflow for time corrections
- Integration with payroll systems
- Multi-language manager dashboard

---

## Assumptions & Open Questions

| # | Assumption / Question | Owner |
|---|----------------------|-------|
| 1 | Geofence radius per branch is ~100-200m — needs confirmation | Client |
| 2 | Employee uses personal phone (BYOD) — app must work with no install | Confirmed |
| 3 | Priority ERP will be the employee data source in future — format TBD | Client |
| 4 | How are time corrections handled? (employee forgot to check out) | TBD |
| 5 | Is there a maximum shift duration after which auto-checkout triggers? | TBD |
| 6 | Who creates manager accounts initially — IT or HR? | Client |
| 7 | What is the data retention period for time records? | Client / Legal |

---

## Recommended Tech Stack (preliminary)

| Layer | Technology |
|-------|-----------|
| Frontend (PWA) | React + i18next (RTL support) |
| Backend | Node.js / NestJS or Python FastAPI |
| Database | PostgreSQL |
| Hosting | Cloud (AWS / GCP / Azure Israel region) |
| GPS / Geofencing | Browser Geolocation API + server-side validation |
| Auth | JWT + role-based access control |
| Export | ExcelJS + PDF generation |

---

*Next step: Create PRD (Product Requirements Document) with detailed user stories and acceptance criteria.*
