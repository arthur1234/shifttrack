import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/branches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async findAll() {
    return { success: true, data: await this.branchesService.findAll() };
  }

  @Get(':id')
  @Roles('ADMIN', 'BRANCH_MANAGER', 'ACCOUNTING')
  async findOne(@Param('id') id: string) {
    return { success: true, data: await this.branchesService.findOne(id) };
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateBranchDto) {
    return { success: true, data: await this.branchesService.create(dto) };
  }

  @Put(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateBranchDto>) {
    return { success: true, data: await this.branchesService.update(id, dto) };
  }

  @Delete(':id')
  @Roles('ADMIN')
  async deactivate(@Param('id') id: string) {
    return { success: true, data: await this.branchesService.deactivate(id) };
  }

  @Get(':id/active-shifts')
  @Roles('ADMIN', 'BRANCH_MANAGER')
  async getActiveShifts(@Param('id') id: string) {
    return { success: true, data: await this.branchesService.getActiveShifts(id) };
  }
}
