import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Role, EmployeeType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export function normalizePhone(phone: string): string {
  let p = phone.trim().replace(/[\s\-().]/g, '');
  if (/^05\d{8}$/.test(p)) return '+972' + p.slice(1);
  if (/^\+972\d{9}$/.test(p)) return p;
  if (/^972\d{9}$/.test(p)) return '+' + p;
  if (p.startsWith('+')) return p;
  return p;
}

const EMPLOYEE_SELECT = {
  id: true, fullName: true, phone: true, email: true,
  role: true, employeeType: true, isActive: true,
  position: true, hireDate: true, createdAt: true,
  homeBranch: { select: { id: true, name: true } },
};

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId?: string) {
    return this.prisma.employee.findMany({
      where: branchId ? { homeBranchId: branchId } : undefined,
      select: EMPLOYEE_SELECT,
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id }, select: EMPLOYEE_SELECT });
    if (!emp) throw new NotFoundException({ code: 'EMPLOYEE_NOT_FOUND', message: 'Employee not found' });
    return emp;
  }

  async create(dto: CreateEmployeeDto) {
    const normalizedPhone = normalizePhone(dto.phone);
    const existing = await this.prisma.employee.findUnique({ where: { phone: normalizedPhone } });
    if (existing) throw new ConflictException({ code: 'PHONE_ALREADY_EXISTS', message: 'Phone already registered' });

    const passwordHash = (dto as any).password ? await bcrypt.hash((dto as any).password, 10) : null;

    return this.prisma.employee.create({
      data: {
        fullName: dto.fullName,
        phone: normalizedPhone,
        email: dto.email ?? null,
        role: (dto.role as Role) ?? Role.EMPLOYEE,
        employeeType: (dto.employeeType as EmployeeType) ?? EmployeeType.REGULAR,
        position: dto.position ?? null,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        passwordHash,
        ...(dto.homeBranchId ? { homeBranch: { connect: { id: dto.homeBranchId } } } : {}),
      },
      select: EMPLOYEE_SELECT,
    });
  }

  async update(id: string, dto: Partial<CreateEmployeeDto>) {
    await this.findOne(id);
    const { homeBranchId, hireDate, ...rest } = dto as any;
    const data: any = { ...rest };
    if (data.password) { data.passwordHash = await bcrypt.hash(data.password, 10); delete data.password; }
    if (data.phone) data.phone = normalizePhone(data.phone);
    if (hireDate !== undefined) data.hireDate = hireDate ? new Date(hireDate) : null;
    if (homeBranchId !== undefined) {
      data.homeBranch = homeBranchId ? { connect: { id: homeBranchId } } : { disconnect: true };
    }
    return this.prisma.employee.update({ where: { id }, data, select: EMPLOYEE_SELECT });
  }

  async importFromExcel(buffer: Buffer): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.default.Workbook();
    await workbook.xlsx.load(buffer as any);
    const sheet = workbook.worksheets[0];

    let imported = 0, skipped = 0;
    const errors: string[] = [];
    const promises: Promise<any>[] = [];

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const fullName = row.getCell(1).text?.trim();
      const rawPhone = row.getCell(2).text?.trim();
      const email = row.getCell(3).text?.trim() || undefined;
      const role = (row.getCell(4).text?.trim() || 'EMPLOYEE').toUpperCase() as Role;
      const position = row.getCell(5).text?.trim() || undefined;

      if (!fullName || !rawPhone) { errors.push(`שורה ${rowNum}: חסר שם או טלפון`); skipped++; return; }

      const phone = normalizePhone(rawPhone);
      const p = this.prisma.employee.upsert({
        where: { phone },
        update: { fullName, ...(email ? { email } : {}), ...(position ? { position } : {}) },
        create: { fullName, phone, ...(email ? { email } : {}), role, employeeType: EmployeeType.REGULAR, ...(position ? { position } : {}) },
      }).then(() => { imported++; }).catch(e => { errors.push(`שורה ${rowNum}: ${e.message}`); skipped++; });
      promises.push(p);
    });

    await Promise.allSettled(promises);
    return { imported, skipped, errors };
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.employee.update({ where: { id }, data: { isActive: false }, select: { id: true, isActive: true } });
  }

  async getShiftHistory(id: string, limit = 50) {
    await this.findOne(id);
    return this.prisma.shiftRecord.findMany({
      where: { employeeId: id },
      orderBy: { startedAt: 'desc' },
      take: limit,
      select: {
        id: true, startedAt: true, endedAt: true, durationMinutes: true,
        status: true, startLocationType: true, endLocationType: true,
        isManualOverride: true, overrideReason: true,
        breakMinutes: true, employeeNote: true, managerNote: true,
        startBranch: { select: { name: true } },
        endBranch: { select: { name: true } },
      },
    });
  }
}
