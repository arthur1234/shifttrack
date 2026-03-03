import { IsString, Matches, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+[1-9]\d{7,14}$/)
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}
