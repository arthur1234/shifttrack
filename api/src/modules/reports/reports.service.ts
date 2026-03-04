import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getShiftsForPeriod(from: Date, to: Date, branchId?: string) {
    return this.prisma.shiftRecord.findMany({
      where: {
        startedAt: { gte: from, lte: to },
        ...(branchId ? { startBranchId: branchId } : {}),
      },
      include: {
        employee: { select: { fullName: true, phone: true, role: true, employeeType: true } },
        startBranch: { select: { name: true, city: true } },
        endBranch: { select: { name: true } },
      },
      orderBy: [{ startBranch: { name: 'asc' } }, { startedAt: 'asc' }],
    });
  }

  async generateExcel(from: Date, to: Date, branchId?: string): Promise<Buffer> {
    const shifts = await this.getShiftsForPeriod(from, to, branchId);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ShiftTrack';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('דוח משמרות', {
      views: [{ rightToLeft: true }],
    });

    // Header style
    const headerFill: ExcelJS.Fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: 'FFE31837' },
    };
    const headerFont: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };

    sheet.columns = [
      { header: 'שם עובד', key: 'name', width: 22 },
      { header: 'טלפון', key: 'phone', width: 16 },
      { header: 'סניף', key: 'branch', width: 24 },
      { header: 'עיר', key: 'city', width: 14 },
      { header: 'תאריך', key: 'date', width: 12 },
      { header: 'שעת כניסה', key: 'startTime', width: 12 },
      { header: 'שעת יציאה', key: 'endTime', width: 12 },
      { header: 'משך (שעות)', key: 'durationHours', width: 14 },
      { header: 'סטטוס', key: 'status', width: 14 },
      { header: 'הערות', key: 'notes', width: 18 },
    ];

    // Style header row
    sheet.getRow(1).eachCell(cell => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFcccccc' } },
      };
    });
    sheet.getRow(1).height = 24;

    const tz = 'Asia/Jerusalem';
    const toLocal = (dt: Date | null) => {
      if (!dt) return null;
      return new Date(dt.toLocaleString('en-US', { timeZone: tz }));
    };

    const statusMap: Record<string, string> = {
      ACTIVE: 'פעיל', CLOSED: 'סגור', CLOSED_MANUAL: 'סגור ידני', FLAGGED_UNCLOSED: 'לא סגור',
    };

    let rowNum = 2;
    for (const s of shifts) {
      const localStart = toLocal(s.startedAt);
      const localEnd = s.endedAt ? toLocal(s.endedAt) : null;

      const row = sheet.addRow({
        name: s.employee.fullName,
        phone: s.employee.phone,
        branch: s.startBranch?.name ?? '—',
        city: s.startBranch?.city ?? '—',
        date: localStart ? localStart.toLocaleDateString('he-IL') : '—',
        startTime: localStart ? localStart.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '—',
        endTime: localEnd ? localEnd.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) : '—',
        durationHours: s.durationMinutes ? +(s.durationMinutes / 60).toFixed(2) : null,
        status: statusMap[s.status] ?? s.status,
        notes: [
          s.isManualOverride ? '✏️ ידני' : '',
          s.startLocationType === 'UNKNOWN' ? '📍 מיקום לא ידוע' : '',
          s.status === 'FLAGGED_UNCLOSED' ? '⚠️ לא נסגר' : '',
        ].filter(Boolean).join(' '),
      });

      // Alternate row color
      if (rowNum % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
        });
      }

      // Highlight unclosed/flagged
      if (s.status === 'FLAGGED_UNCLOSED' || s.status === 'ACTIVE') {
        row.getCell('status').font = { color: { argb: 'FFE31837' }, bold: true };
      }

      rowNum++;
    }

    // Summary row
    const totalHours = shifts.reduce((acc, s) => acc + (s.durationMinutes ?? 0), 0) / 60;
    sheet.addRow({});
    const sumRow = sheet.addRow({
      name: 'סה"כ',
      durationHours: +totalHours.toFixed(2),
    });
    sumRow.font = { bold: true };
    sumRow.getCell('durationHours').font = { bold: true, color: { argb: 'FF1565C0' } };

    // Freeze header
    sheet.views = [{ state: 'frozen', ySplit: 1, rightToLeft: true }];

    // Auto-filter
    sheet.autoFilter = { from: 'A1', to: 'J1' };

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }
}
