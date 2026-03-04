import { IsString, IsOptional, IsEnum, IsPhoneNumber, IsEmail } from 'class-validator';

export enum Role { ADMIN = 'ADMIN', BRANCH_MANAGER = 'BRANCH_MANAGER', ACCOUNTING = 'ACCOUNTING', EMPLOYEE = 'EMPLOYEE' }
export enum EmployeeType { REGULAR = 'REGULAR', HOURLY = 'HOURLY', PART_TIME = 'PART_TIME' }

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
}
