-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'BRANCH_MANAGER', 'ACCOUNTING', 'TOP_MANAGEMENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('REGULAR', 'FIELD_WORKER');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'CLOSED', 'CLOSED_MANUAL', 'FLAGGED_UNCLOSED');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('BRANCH', 'HOME', 'FIELD', 'UNKNOWN');

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "employeeType" "EmployeeType" NOT NULL DEFAULT 'REGULAR',
    "homeBranchId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "geofenceRadius" INTEGER NOT NULL DEFAULT 150,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "shortCode" TEXT NOT NULL,
    "maxShiftHours" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "startLatitude" DECIMAL(10,8),
    "startLongitude" DECIMAL(11,8),
    "startLocationType" "LocationType",
    "startBranchId" TEXT,
    "startGpsAccuracy" DOUBLE PRECISION,
    "startIpAddress" TEXT,
    "startUserAgent" TEXT,
    "startIsSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "endLatitude" DECIMAL(10,8),
    "endLongitude" DECIMAL(11,8),
    "endLocationType" "LocationType",
    "endBranchId" TEXT,
    "endGpsAccuracy" DOUBLE PRECISION,
    "endIpAddress" TEXT,
    "endUserAgent" TEXT,
    "isManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "overriddenBy" TEXT,
    "overrideReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,
    "deviceUserAgent" TEXT NOT NULL,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employees_phone_key" ON "employees"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "branches_shortCode_key" ON "branches"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "consent_records_employeeId_key" ON "consent_records"("employeeId");

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_homeBranchId_fkey" FOREIGN KEY ("homeBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_records" ADD CONSTRAINT "shift_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_records" ADD CONSTRAINT "shift_records_startBranchId_fkey" FOREIGN KEY ("startBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shift_records" ADD CONSTRAINT "shift_records_endBranchId_fkey" FOREIGN KEY ("endBranchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
