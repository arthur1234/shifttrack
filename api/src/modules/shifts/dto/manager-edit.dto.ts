import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ManagerCloseShiftDto {
  @IsDateString()
  endTime: string;

  @IsString()
  reason: string;
}

export class ManagerEditShiftDto {
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @IsOptional()
  @IsDateString()
  endedAt?: string;

  @IsString()
  reason: string;
}
