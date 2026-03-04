-- AlterTable employees
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "position" TEXT;
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "hireDate" TIMESTAMP(3);

-- AlterTable shift_records
ALTER TABLE "shift_records" ADD COLUMN IF NOT EXISTS "breakMinutes" INTEGER;
ALTER TABLE "shift_records" ADD COLUMN IF NOT EXISTS "employeeNote" TEXT;
ALTER TABLE "shift_records" ADD COLUMN IF NOT EXISTS "managerNote" TEXT;
