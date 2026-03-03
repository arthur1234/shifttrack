import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, homeBranchId: true, isActive: true },
    });

    if (!employee || !employee.isActive) {
      throw new UnauthorizedException();
    }

    return {
      id: employee.id,
      role: employee.role,
      branchId: employee.homeBranchId,
    };
  }
}
