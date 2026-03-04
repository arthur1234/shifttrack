import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function classifyLocation(
  latitude: number | undefined,
  longitude: number | undefined,
  accuracy: number | undefined,
  branches: { id: string; name: string; latitude: number | null; longitude: number | null; geofenceRadius: number }[],
  isFieldWorker = false
): { type: 'BRANCH' | 'HOME' | 'FIELD' | 'UNKNOWN'; branchId?: string; branchName?: string } {
  if (!latitude || !longitude || accuracy === undefined || accuracy > 500) {
    return { type: 'UNKNOWN' };
  }

  const effectiveRadius = accuracy > 300 ? 200 : 0;

  for (const branch of branches) {
    if (!branch.latitude || !branch.longitude) continue;
    const dist = haversineDistance(latitude, longitude, branch.latitude, branch.longitude);
    if (dist <= branch.geofenceRadius + effectiveRadius) {
      return { type: 'BRANCH', branchId: branch.id, branchName: branch.name };
    }
  }

  if (isFieldWorker) return { type: 'FIELD' };
  return { type: 'HOME' };
}

async function getBranches(prisma: PrismaService) {
  const raw = await prisma.branch.findMany({
    where: { isActive: true },
    select: { id: true, name: true, latitude: true, longitude: true, geofenceRadius: true },
  });
  return raw.map(b => ({
    ...b,
    latitude: b.latitude ? Number(b.latitude) : null,
    longitude: b.longitude ? Number(b.longitude) : null,
  }));
}

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async clockIn(employeeId: string, dto: ClockInDto) {
    const openShift = await this.prisma.shiftRecord.findFirst({
      where: { employeeId, endedAt: null },
    });
    if (openShift) {
      throw new BadRequestException({
        code: 'SHIFT_ALREADY_ACTIVE',
        message: 'יש משמרת פתוחה. סגור אותה לפני פתיחת חדשה.',
      });
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { employeeType: true },
    });
    const isFieldWorker = employee?.employeeType === 'FIELD_WORKER';
    const branches = await getBranches(this.prisma);
    const location = classifyLocation(dto.latitude, dto.longitude, dto.accuracy, branches, isFieldWorker);

    const shift = await this.prisma.shiftRecord.create({
      data: {
        employee: { connect: { id: employeeId } },
        startedAt: new Date(),
        startLatitude: dto.latitude ?? null,
        startLongitude: dto.longitude ?? null,
        startGpsAccuracy: dto.accuracy ?? null,
        startLocationType: location.type,
        ...(location.branchId ? { startBranch: { connect: { id: location.branchId } } } : {}),
        isManualOverride: false,
      },
    });

    return {
      shiftId: shift.id,
      startedAt: shift.startedAt,
      locationType: location.type,
      branchName: location.branchName,
    };
  }

  async clockOut(employeeId: string, dto: ClockOutDto) {
    const openShift = await this.prisma.shiftRecord.findFirst({
      where: { employeeId, endedAt: null },
    });
    if (!openShift) {
      throw new NotFoundException({
        code: 'SHIFT_NOT_FOUND',
        message: 'אין משמרת פתוחה.',
      });
    }

    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { employeeType: true },
    });
    const isFieldWorker = employee?.employeeType === 'FIELD_WORKER';
    const branches = await getBranches(this.prisma);
    const location = classifyLocation(dto.latitude, dto.longitude, dto.accuracy, branches, isFieldWorker);

    const endedAt = new Date();
    const durationMinutes = Math.round((endedAt.getTime() - openShift.startedAt.getTime()) / 60000);

    const shift = await this.prisma.shiftRecord.update({
      where: { id: openShift.id },
      data: {
        endedAt,
        endLatitude: dto.latitude ?? null,
        endLongitude: dto.longitude ?? null,
        endGpsAccuracy: dto.accuracy ?? null,
        endLocationType: location.type,
        ...(location.branchId ? { endBranch: { connect: { id: location.branchId } } } : {}),
        durationMinutes,
        status: 'CLOSED',
      },
    });

    return {
      shiftId: shift.id,
      startedAt: shift.startedAt,
      endedAt: shift.endedAt,
      durationMinutes,
      locationType: location.type,
    };
  }

  async getActive(employeeId: string) {
    const shift = await this.prisma.shiftRecord.findFirst({
      where: { employeeId, endedAt: null },
      include: { startBranch: { select: { name: true } } },
    });
    if (!shift) return null;
    return {
      shiftId: shift.id,
      startedAt: shift.startedAt,
      locationType: shift.startLocationType,
      branchName: shift.startBranch?.name,
    };
  }

  async getMyHistory(employeeId: string, limit = 50) {
    const shifts = await this.prisma.shiftRecord.findMany({
      where: { employeeId },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        startBranch: { select: { name: true } },
        endBranch: { select: { name: true } },
      },
    });

    return shifts.map(s => ({
      shiftId: s.id,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      durationMinutes: s.durationMinutes,
      status: s.status,
      startLocationType: s.startLocationType,
      endLocationType: s.endLocationType,
      startBranch: s.startBranch?.name,
      endBranch: s.endBranch?.name,
      isManualOverride: s.isManualOverride,
    }));
  }

  async managerCloseShift(shiftId: string, managerId: string, endTime: Date, reason: string) {
    const shift = await this.prisma.shiftRecord.findUnique({ where: { id: shiftId } });
    if (!shift) throw new NotFoundException({ code: 'SHIFT_NOT_FOUND', message: 'Shift not found' });
    if (shift.endedAt) throw new BadRequestException({ code: 'SHIFT_ALREADY_CLOSED', message: 'Shift already closed' });

    const durationMinutes = Math.round((endTime.getTime() - shift.startedAt.getTime()) / 60000);

    await this.prisma.shiftRecord.update({
      where: { id: shiftId },
      data: {
        endedAt: endTime,
        durationMinutes,
        status: 'CLOSED_MANUAL',
        isManualOverride: true,
        overriddenBy: managerId,
        overrideReason: reason,
      },
    });

    return { shiftId, endedAt: endTime, durationMinutes, status: 'CLOSED_MANUAL' };
  }

  async managerEditShift(shiftId: string, managerId: string, data: { startedAt?: Date; endedAt?: Date; reason: string }) {
    const shift = await this.prisma.shiftRecord.findUnique({ where: { id: shiftId } });
    if (!shift) throw new NotFoundException({ code: 'SHIFT_NOT_FOUND', message: 'Shift not found' });

    const newStart = data.startedAt ?? shift.startedAt;
    const newEnd = data.endedAt ?? shift.endedAt;
    const durationMinutes = newEnd ? Math.round((newEnd.getTime() - newStart.getTime()) / 60000) : null;

    await this.prisma.shiftRecord.update({
      where: { id: shiftId },
      data: {
        startedAt: newStart,
        endedAt: newEnd,
        durationMinutes,
        status: newEnd ? 'CLOSED_MANUAL' : shift.status,
        isManualOverride: true,
        overriddenBy: managerId,
        overrideReason: data.reason,
      },
    });

    return { shiftId, startedAt: newStart, endedAt: newEnd, durationMinutes };
  }
}
