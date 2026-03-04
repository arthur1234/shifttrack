import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsNumber()
  @Min(-90) @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180) @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(50) @Max(500)
  geofenceRadius?: number;

  @IsOptional()
  @IsNumber()
  maxShiftHours?: number;

  @IsString()
  shortCode: string;
}
