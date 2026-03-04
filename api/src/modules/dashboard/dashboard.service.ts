import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getActiveNow(branchId?: string) {
    const activeShifts = await this.prisma.shiftRecord.findMany({
      where: {
        endedAt: null,
        ...(branchId ? { startBranchId: branchId } : {}),
      },
      include: {
        employee: { select: { id: true, fullName: true, phone: true, role: true } },
        startBranch: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: 'asc' },
    });

    return activeShifts.map(s => ({
      shiftId: s.id,
      startedAt: s.startedAt,
      durationMinutes: Math.floor((Date.now() - s.startedAt.getTime()) / 60000),
      employee: s.employee,
      branch: s.startBranch,
      locationType: s.startLocationType,
      status: s.status,
    }));
  }

  async getSummaryToday(branchId?: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [activeCount, completedToday, totalEmployees] = await Promise.all([
      this.prisma.shiftRecord.count({
        where: { endedAt: null, ...(branchId ? { startBranchId: branchId } : {}) },
      }),
      this.prisma.shiftRecord.count({
        where: {
          startedAt: { gte: startOfDay },
          endedAt: { not: null },
          ...(branchId ? { startBranchId: branchId } : {}),
        },
      }),
      this.prisma.employee.count({ where: { isActive: true } }),
    ]);

    return { activeCount, completedToday, totalEmployees };
  }

  async getRecentShifts(branchId?: string, limit = 50) {
    const shifts = await this.prisma.shiftRecord.findMany({
      where: {
        ...(branchId ? { startBranchId: branchId } : {}),
      },
      include: {
        employee: { select: { id: true, fullName: true } },
        startBranch: { select: { name: true } },
        endBranch: { select: { name: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return shifts.map(s => ({
      shiftId: s.id,
      employee: s.employee,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationMinutes: s.durationMinutes,
      status: s.status,
      startBranch: s.startBranch?.name ?? null,
      endBranch: s.endBranch?.name ?? null,
      startLocationType: s.startLocationType,
      endLocationType: s.endLocationType,
      isManualOverride: s.isManualOverride,
    }));
  }
}
