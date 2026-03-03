import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as twilio from 'twilio';

@Injectable()
export class AuthService {
  private twilioClient: twilio.Twilio;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    this.twilioClient = twilio(
      config.get('TWILIO_ACCOUNT_SID'),
      config.get('TWILIO_AUTH_TOKEN'),
    );
  }

  async requestOtp(phone: string): Promise<{ message: string }> {
    // Check employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { phone },
    });

    if (!employee || !employee.isActive) {
      // Don't reveal if user exists - just say OTP sent
      return { message: 'OTP sent if account exists' };
    }

    await this.twilioClient.verify.v2
      .services(this.config.get('TWILIO_VERIFY_SERVICE_SID'))
      .verifications.create({ to: phone, channel: 'sms' });

    return { message: 'OTP sent' };
  }

  async verifyOtp(
    phone: string,
    code: string,
  ): Promise<{ accessToken: string; employee: any }> {
    const employee = await this.prisma.employee.findUnique({
      where: { phone },
      include: { homeBranch: { select: { name: true } } },
    });

    if (!employee || !employee.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.twilioClient.verify.v2
      .services(this.config.get('TWILIO_VERIFY_SERVICE_SID'))
      .verificationChecks.create({ to: phone, code });

    if (result.status !== 'approved') {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_OTP',
        message: 'Invalid or expired OTP code',
      });
    }

    const accessToken = this.generateToken(employee);

    return {
      accessToken,
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        role: employee.role,
        employeeType: employee.employeeType,
        homeBranch: employee.homeBranch?.name ?? null,
      },
    };
  }

  async loginWithPassword(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; employee: any }> {
    const employee = await this.prisma.employee.findUnique({
      where: { email },
      include: { homeBranch: { select: { id: true, name: true } } },
    });

    if (!employee || !employee.isActive || !employee.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(employee);

    return {
      accessToken,
      employee: {
        id: employee.id,
        fullName: employee.fullName,
        role: employee.role,
        branchId: employee.homeBranch?.id ?? null,
        branchName: employee.homeBranch?.name ?? null,
      },
    };
  }

  private generateToken(employee: any): string {
    return this.jwt.sign({
      sub: employee.id,
      role: employee.role,
      branchId: employee.homeBranchId,
    });
  }
}
