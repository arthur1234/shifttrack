import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Role, EmployeeType } from '@prisma/client';

export function normalizePhone(phone: string): string {
  let p = phone.trim().replace(/[\s\-().]/g, '');
  // Israeli mobile: 05X -> +9725X
  if (/^05\d{8}$/.test(p)) return '+972' + p.slice(1);
  // Already +972
  if (/^\+972\d{9}$/.test(p)) return p;
  // 972XXXXXXXXX without +
  if (/^972\d{9}$/.test(p)) return '+' + p;
  // International with +
  if (p.startsWith('+')) return p;
  return p; // return as-is if unrecognized
}
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string) {
    return this.prisma.employee.findMany({
      where: branchId ? { homeBranchId: branchId } : undefined,
      select: {
        id: true, fullName: true, phone: true, email: true,
        role: true, employeeType: true, isActive: true, createdAt: true,
        homeBranch: { select: { id: true, name: true } },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true, fullName: true, phone: true, email: true,
        role: true, employeeType: true, isActive: true, createdAt: true,
        homeBranch: { select: { id: true, name: true } },
      },
    });
    if (!emp) throw new NotFoundException({ code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found' });
    return emp;
  }

  async create(dto: CreateEmployeeDto) {
    const normalizedPhone = normalizePhone(dto.phone);
    const existing = await this.prisma.employee.findUnique({ where: { phone: normalizedPhone } });
    if (existing) throw new ConflictException({ code: 'PHONE_ALREADY_EXISTS', message: 'Phone number already registered' });

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    return this.prisma.employee.create({
      data: {
        fullName: dto.fullName,
        phone: normalizedPhone,
        email: dto.email ?? null,
        role: (dto.role as Role) ?? Role.EMPLOYEE,
        employeeType: (dto.employeeType as EmployeeType) ?? EmployeeType.REGULAR,
        passwordHash,
        ...(dto.homeBranchId ? { homeBranch: { connect: { id: dto.homeBranchId } } } : {}),
      },
      select: {
        id: true, fullName: true, phone: true, email: true,
        role: true, employeeType: true, isActive: true, createdAt: true,
      },
    });
  }

  async update(id: string, dto: Partial<CreateEmployeeDto>) {
    await this.findOne(id);
    const { password, homeBranchId, ...rest } = dto;
    const data: any = { ...rest };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    if (homeBranchId !== undefined) {
      data.homeBranch = homeBranchId ? { connect: { id: homeBranchId } } : { disconnect: true };
    }
    return this.prisma.employee.update({
      where: { id },
      data,
      select: {
        id: true, fullName: true, phone: true, email: true,
        role: true, employeeType: true, isActive: true,
        homeBranch: { select: { id: true, name: true } },
      },
    });
  }

  async importFromExcel(buffer: Buffer): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    let imported = 0, skipped = 0;
    const errors: string[] = [];

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return; // skip header
      const fullName = row.getCell(1).text?.trim();
      const rawPhone = row.getCell(2).text?.trim();
      const email = row.getCell(3).text?.trim() || undefined;
      const role = row.getCell(4).text?.trim() || 'EMPLOYEE';
      const branchCode = row.getCell(5).text?.trim() || undefined;

      if (!fullName || !rawPhone) { errors.push(`שורה ${rowNum}: חסר שם או טלפון`); skipped++; return; }

      const phone = normalizePhone(rawPhone);

      this.prisma.employee.upsert({
        where: { phone },
        update: { fullName, ...(email ? { email } : {}) },
        create: {
          fullName, phone,
          ...(email ? { email } : {}),
          role: (role.toUpperCase() as Role) || Role.EMPLOYEE,
          employeeType: EmployeeType.REGULAR,
        },
      }).then(() => { imported++; }).catch(e => { errors.push(`שורה ${rowNum}: ${e.message}`); skipped++; });
    });

    // Wait a tick for async ops
    await new Promise(r => setTimeout(r, 500));
    return { imported, skipped, errors };
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.employee.update({
      where: { id },
      data: { isActive: false },
      select: { id: true, isActive: true },
    });
  }

  async getShiftHistory(id: string, limit = 30) {
    await this.findOne(id);
    return this.prisma.shiftRecord.findMany({
      where: { employeeId: id },
      orderBy: { startedAt: 'desc' },
      take: limit,
      select: {
        id: true, startedAt: true, endedAt: true, durationMinutes: true,
        status: true, startLocationType: true, endLocationType: true, isManualOverride: true,
        startBranch: { select: { name: true } },
      },
    });
  }
}
