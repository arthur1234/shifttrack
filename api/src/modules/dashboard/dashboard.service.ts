import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getFullStatus(branchId?: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // All active employees
    const allEmployees = await this.prisma.employee.findMany({
      where: {
        isActive: true,
        ...(branchId ? { homeBranchId: branchId } : {}),
      },
      select: {
        id: true, fullName: true, phone: true, role: true, employeeType: true,
        homeBranch: { select: { id: true, name: true } },
      },
    });

    // Open shifts (ACTIVE)
    const openShifts = await this.prisma.shiftRecord.findMany({
      where: { endedAt: null, ...(branchId ? { startBranchId: branchId } : {}) },
      include: {
        employee: { select: { id: true, fullName: true, phone: true } },
        startBranch: { select: { id: true, name: true } },
      },
    });

    // Shifts started today (for "worked today" list)
    const todayShifts = await this.prisma.shiftRecord.findMany({
      where: {
        startedAt: { gte: startOfDay },
        endedAt: { not: null },
        ...(branchId ? { startBranchId: branchId } : {}),
      },
      select: { employeeId: true },
    });

    const workingNowIds = new Set(openShifts.map(s => s.employee.id));
    const workedTodayIds = new Set(todayShifts.map(s => s.employeeId));
    const unclosedOld = openShifts.filter(s => {
      const hoursOpen = (Date.now() - s.startedAt.getTime()) / 3600000;
      return hoursOpen > 12; // flag if open > 12h
    });

    const working = openShifts.map(s => ({
      shiftId: s.id,
      startedAt: s.startedAt,
      durationMinutes: Math.floor((Date.now() - s.startedAt.getTime()) / 60000),
      employee: s.employee,
      branch: s.startBranch,
      locationType: s.startLocationType,
      isUnclosedFlag: (Date.now() - s.startedAt.getTime()) / 3600000 > 12,
    }));

    const notStarted = allEmployees.filter(e =>
      !workingNowIds.has(e.id) && !workedTodayIds.has(e.id)
    );

    const unclosed = unclosedOld.map(s => ({
      shiftId: s.id,
      startedAt: s.startedAt,
      hoursOpen: +((Date.now() - s.startedAt.getTime()) / 3600000).toFixed(1),
      employee: s.employee,
      branch: s.startBranch,
    }));

    return { working, notStarted, unclosed };
  }

  async getActiveNow(branchId?: string) {
    const shifts = await this.prisma.shiftRecord.findMany({
      where: { endedAt: null, ...(branchId ? { startBranchId: branchId } : {}) },
      include: {
        employee: { select: { id: true, fullName: true, phone: true, role: true } },
        startBranch: { select: { id: true, name: true } },
      },
      orderBy: { startedAt: 'asc' },
    });

    return shifts.map(s => ({
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

    const [activeCount, completedToday, totalEmployees, totalHoursToday] = await Promise.all([
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
      this.prisma.shiftRecord.aggregate({
        where: {
          startedAt: { gte: startOfDay },
          endedAt: { not: null },
          ...(branchId ? { startBranchId: branchId } : {}),
        },
        _sum: { durationMinutes: true },
      }),
    ]);

    return {
      activeCount,
      completedToday,
      totalEmployees,
      totalHoursToday: +((totalHoursToday._sum.durationMinutes ?? 0) / 60).toFixed(1),
    };
  }

  async getRecentShifts(branchId?: string, limit = 100) {
    const shifts = await this.prisma.shiftRecord.findMany({
      where: branchId ? { startBranchId: branchId } : undefined,
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

  async getMonthlyReport(year: number, month: number, branchId?: string) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59);

    const shifts = await this.prisma.shiftRecord.findMany({
      where: {
        startedAt: { gte: from, lte: to },
        endedAt: { not: null },
        ...(branchId ? { startBranchId: branchId } : {}),
      },
      include: {
        employee: { select: { id: true, fullName: true, phone: true } },
        startBranch: { select: { name: true } },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Group by employee
    const byEmployee: Record<string, any> = {};
    for (const s of shifts) {
      const key = s.employeeId;
      if (!byEmployee[key]) {
        byEmployee[key] = {
          employee: s.employee,
          branch: s.startBranch?.name ?? '—',
          totalMinutes: 0,
          shiftCount: 0,
          minutesByType: { BRANCH: 0, HOME: 0, FIELD: 0, UNKNOWN: 0 },
        };
      }
      byEmployee[key].totalMinutes += s.durationMinutes ?? 0;
      byEmployee[key].shiftCount += 1;
      const type = (s.startLocationType ?? 'UNKNOWN') as string;
      byEmployee[key].minutesByType[type] = (byEmployee[key].minutesByType[type] ?? 0) + (s.durationMinutes ?? 0);
    }

    return {
      period: { year, month, from, to },
      totalShifts: shifts.length,
      totalHours: +((shifts.reduce((a, s) => a + (s.durationMinutes ?? 0), 0)) / 60).toFixed(2),
      employees: Object.values(byEmployee).map((e: any) => ({
        ...e,
        totalHours: +(e.totalMinutes / 60).toFixed(2),
        hoursByType: {
          branch: +(e.minutesByType.BRANCH / 60).toFixed(2),
          home: +(e.minutesByType.HOME / 60).toFixed(2),
          field: +(e.minutesByType.FIELD / 60).toFixed(2),
          unknown: +(e.minutesByType.UNKNOWN / 60).toFixed(2),
        },
      })).sort((a: any, b: any) => b.totalMinutes - a.totalMinutes),
    };
  }
}
