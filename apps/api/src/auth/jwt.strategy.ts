import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminEntity {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role?: string;
  department?: string | null;
  departments?: string[];
  accessScope?: string | null;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret && process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const portal = (request?.headers?.['x-portal-type'] || request?.query?.['portal'] || '').toString().toLowerCase();
          if (portal === 'employee') {
            return request?.cookies?.['wmc_employee_token'] || ExtractJwt.fromAuthHeaderAsBearerToken()(request) || request?.cookies?.['wmc_admin_token'];
          }
          return request?.cookies?.['wmc_admin_token'] || ExtractJwt.fromAuthHeaderAsBearerToken()(request) || request?.cookies?.['wmc_employee_token'];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret || 'wmc_local_dev_jwt_secret_only',
    });
  }

  async validate(payload: { sub: string; email: string; name: string; role?: string; department?: string }) {
    const admin = (await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    })) as AdminEntity | null;

    if (!admin || admin.isActive === false) {
      throw new UnauthorizedException('Admin session invalid, inactive or expired');
    }

    const adminDepts: string[] = Array.isArray(admin.departments) && admin.departments.length > 0
      ? admin.departments
      : (admin.department ? [admin.department] : []);

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role || 'SUPER_ADMIN',
      department: admin.department || (adminDepts[0] || null),
      departments: adminDepts,
      accessScope: admin.accessScope || 'all',
    };
  }
}
