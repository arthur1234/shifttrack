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
  branches: { id: string; name: string; latitude: number | null; longitude: number | null; geofenceRadius: number }[]
): { type: 'BRANCH' | 'UNKNOWN'; branchId?: string; branchName?: string } {
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

  return { type: 'UNKNOWN' };
}

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async clockIn(employeeId: string, dto: ClockInDto) {
    // Check for existing open shift
    const openShift = await this.prisma.shiftRecord.findFirst({
      where: { employeeId, endedAt: null },
    });
    if (openShift) {
      throw new BadRequestException({
        code: 'SHIFT_ALREADY_ACTIVE',
        message: 'יש משמרת פתוחה. סגור אותה לפני פתיחת חדשה.',
      });
    }

    // Classify location
    const branchesRaw = await this.prisma.branch.findMany({
      select: { id: true, name: true, latitude: true, longitude: true, geofenceRadius: true },
    });
    const branches = branchesRaw.map(b => ({
      ...b,
      latitude: b.latitude ? Number(b.latitude) : null,
      longitude: b.longitude ? Number(b.longitude) : null,
    }));

    const location = classifyLocation(dto.latitude, dto.longitude, dto.accuracy, branches);

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

    const branchesRaw2 = await this.prisma.branch.findMany({
      select: { id: true, name: true, latitude: true, longitude: true, geofenceRadius: true },
    });
    const branches = branchesRaw2.map(b => ({
      ...b,
      latitude: b.latitude ? Number(b.latitude) : null,
      longitude: b.longitude ? Number(b.longitude) : null,
    }));

    const location = classifyLocation(dto.latitude, dto.longitude, dto.accuracy, branches);
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
}
