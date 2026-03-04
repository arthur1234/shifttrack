import { IsString, IsOptional, IsEmail, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { Role, EmployeeType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(EmployeeType)
  employeeType?: EmployeeType;

  @IsOptional()
  @IsString()
  homeBranchId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  position?: string;    // תפקיד: קופאי, טבח, שליח, מנהל משמרת

  @IsOptional()
  @IsDateString()
  hireDate?: string;    // תאריך תחילת עבודה

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
