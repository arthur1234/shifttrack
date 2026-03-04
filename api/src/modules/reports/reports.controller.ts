import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('shifts/excel')
  @Roles('ADMIN', 'ACCOUNTING', 'BRANCH_MANAGER')
  async exportShiftsExcel(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('branchId') branchId: string | undefined,
    @Res() res: Response,
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const buffer = await this.reportsService.generateExcel(fromDate, toDate, branchId);

    const dateStr = new Date().toISOString().split('T')[0];
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="shifttrack-report-${dateStr}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('shifts/summary')
  @Roles('ADMIN', 'ACCOUNTING', 'BRANCH_MANAGER')
  async getSummary(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('branchId') branchId: string | undefined,
  ) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const shifts = await this.reportsService.getShiftsForPeriod(fromDate, toDate, branchId);

    const byEmployee: Record<string, { name: string; phone: string; totalMinutes: number; shiftCount: number }> = {};
    for (const s of shifts) {
      const key = s.employeeId;
      if (!byEmployee[key]) {
        byEmployee[key] = { name: s.employee.fullName, phone: s.employee.phone, totalMinutes: 0, shiftCount: 0 };
      }
      byEmployee[key].totalMinutes += s.durationMinutes ?? 0;
      byEmployee[key].shiftCount += 1;
    }

    return {
      success: true,
      data: {
        period: { from: fromDate, to: toDate },
        totalShifts: shifts.length,
        totalHours: +(shifts.reduce((a, s) => a + (s.durationMinutes ?? 0), 0) / 60).toFixed(2),
        byEmployee: Object.values(byEmployee).map(e => ({
          ...e,
          totalHours: +(e.totalMinutes / 60).toFixed(2),
        })).sort((a, b) => b.totalMinutes - a.totalMinutes),
      },
    };
  }
}
