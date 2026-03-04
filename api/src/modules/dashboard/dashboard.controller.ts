import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('status')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING', 'TOP_MANAGEMENT')
  async getFullStatus(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.dashboardService.getFullStatus(branchId) };
  }

  @Get('active')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING', 'TOP_MANAGEMENT')
  async getActiveNow(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.dashboardService.getActiveNow(branchId) };
  }

  @Get('summary')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING', 'TOP_MANAGEMENT')
  async getSummary(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.dashboardService.getSummaryToday(branchId) };
  }

  @Get('shifts')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING', 'TOP_MANAGEMENT')
  async getRecentShifts(@Query('branchId') branchId?: string, @Query('limit') limit?: string) {
    return { success: true, data: await this.dashboardService.getRecentShifts(branchId, limit ? parseInt(limit) : 100) };
  }

  @Get('monthly')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING', 'TOP_MANAGEMENT')
  async getMonthly(@Query('year') year: string, @Query('month') month: string, @Query('branchId') branchId?: string) {
    const y = year ? parseInt(year) : new Date().getFullYear();
    const m = month ? parseInt(month) : new Date().getMonth() + 1;
    return { success: true, data: await this.dashboardService.getMonthlyReport(y, m, branchId) };
  }
}
