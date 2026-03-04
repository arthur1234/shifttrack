import { Controller, Post, Get, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { ManagerCloseShiftDto, ManagerEditShiftDto } from './dto/manager-edit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('clock-in')
  async clockIn(@Request() req: any, @Body() dto: ClockInDto) {
    return { success: true, data: await this.shiftsService.clockIn(req.user.id, dto) };
  }

  @Post('clock-out')
  async clockOut(@Request() req: any, @Body() dto: ClockOutDto) {
    return { success: true, data: await this.shiftsService.clockOut(req.user.id, dto) };
  }

  @Get('active')
  async getActive(@Request() req: any) {
    return { success: true, data: await this.shiftsService.getActive(req.user.id) };
  }

  @Get('my-history')
  async getMyHistory(@Request() req: any, @Query('limit') limit?: string) {
    return { success: true, data: await this.shiftsService.getMyHistory(req.user.id, limit ? parseInt(limit) : 50) };
  }

  @Post(':id/close')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async managerClose(@Param('id') id: string, @Request() req: any, @Body() dto: ManagerCloseShiftDto) {
    return { success: true, data: await this.shiftsService.managerCloseShift(id, req.user.id, new Date(dto.endTime), dto.reason) };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async managerEdit(@Param('id') id: string, @Request() req: any, @Body() dto: ManagerEditShiftDto) {
    return {
      success: true,
      data: await this.shiftsService.managerEditShift(id, req.user.id, {
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        endedAt: dto.endedAt ? new Date(dto.endedAt) : undefined,
        reason: dto.reason,
      }),
    };
  }
}
