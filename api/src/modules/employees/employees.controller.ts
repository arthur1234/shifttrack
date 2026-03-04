import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async findAll(@Query('branchId') branchId?: string) {
    return { success: true, data: await this.employeesService.findAll(branchId) };
  }

  @Get(':id')
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.employeesService.findOne(id) };
  }

  @Post()
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async create(@Body() dto: CreateEmployeeDto) {
    return { success: true, data: await this.employeesService.create(dto) };
  }

  @Put(':id')
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateEmployeeDto>) {
    return { success: true, data: await this.employeesService.update(id, dto) };
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deactivate(@Param('id') id: string) {
    return { success: true, data: await this.employeesService.deactivate(id) };
  }

  @Get(':id/shifts')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async getShiftHistory(@Param('id') id: string) {
    return { success: true, data: await this.employeesService.getShiftHistory(id) };
  }

  @Post('import/excel')
  @Roles('ADMIN', 'BRANCH_MANAGER')
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) return { success: false, error: { message: 'No file uploaded' } };
    const result = await this.employeesService.importFromExcel(file.buffer);
    return { success: true, data: result };
  }

  @Get('export/template')
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async downloadTemplate() {
    return {
      success: true,
      data: {
        message: 'Excel template format',
        columns: ['שם מלא (A)', 'טלפון (B)', 'אימייל (C)', 'תפקיד (D): EMPLOYEE/BRANCH_MANAGER/ACCOUNTING/ADMIN', 'קוד סניף (E)'],
        example: [['ישראל ישראלי', '0501234567', 'israel@example.com', 'EMPLOYEE', 'tlv-1']],
      }
    };
  }
}
