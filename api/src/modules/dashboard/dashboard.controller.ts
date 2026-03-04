import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('active')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async getActiveNow(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.dashboardService.getActiveNow(branchId) };
  }

  @Get('summary')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async getSummary(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.dashboardService.getSummaryToday(branchId) };
  }

  @Get('shifts')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async getRecentShifts(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.dashboardService.getRecentShifts(branchId) };
  }
}
