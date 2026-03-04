import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { ClockInDto } from './dto/clock-in.dto';
import { ClockOutDto } from './dto/clock-out.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/v1/shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('clock-in')
  async clockIn(@Request() req: any, @Body() dto: ClockInDto) {
    const data = await this.shiftsService.clockIn(req.user.id, dto);
    return { success: true, data };
  }

  @Post('clock-out')
  async clockOut(@Request() req: any, @Body() dto: ClockOutDto) {
    const data = await this.shiftsService.clockOut(req.user.id, dto);
    return { success: true, data };
  }

  @Get('active')
  async getActive(@Request() req: any) {
    const data = await this.shiftsService.getActive(req.user.id);
    return { success: true, data };
  }
}
