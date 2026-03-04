import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.branch.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { employees: true, shiftsStarted: true } },
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        employees: { select: { id: true, fullName: true, role: true, isActive: true } },
        _count: { select: { shiftsStarted: true } },
      },
    });
    if (!branch) throw new NotFoundException({ code: 'BRANCH_NOT_FOUND', message: 'Branch not found' });
    return branch;
  }

  async create(dto: CreateBranchDto) {
    const existing = await this.prisma.branch.findUnique({ where: { shortCode: dto.shortCode } });
    if (existing) throw new ConflictException({ code: 'BRANCH_CODE_EXISTS', message: 'Short code already in use' });

    return this.prisma.branch.create({ data: { ...dto, geofenceRadius: dto.geofenceRadius ?? 150 } });
  }

  async update(id: string, dto: Partial<CreateBranchDto>) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data: dto });
  }

  async deactivate(id: string) {
    await this.findOne(id);
    return this.prisma.branch.update({ where: { id }, data: { isActive: false } });
  }

  async getActiveShifts(id: string) {
    return this.prisma.shiftRecord.findMany({
      where: { startBranchId: id, endedAt: null },
      include: {
        employee: { select: { fullName: true, phone: true } },
      },
      orderBy: { startedAt: 'asc' },
    });
  }
}
