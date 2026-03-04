import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { Role, EmployeeType } from '@prisma/client';
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
    const existing = await this.prisma.employee.findUnique({ where: { phone: dto.phone } });
    if (existing) throw new ConflictException({ code: 'PHONE_ALREADY_EXISTS', message: 'Phone number already registered' });

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    return this.prisma.employee.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
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
