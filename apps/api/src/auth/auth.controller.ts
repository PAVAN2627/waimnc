import { Controller, Post, Patch, Delete, Body, Res, Get, UseGuards, Req, Param, ForbiddenException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  portal?: string;
}

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsArray()
  @IsOptional()
  departments?: string[];

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  accessScope?: string;
}

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsArray()
  @IsOptional()
  departments?: string[];

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  accessScope?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  password?: string;
}

export class InitialAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

function extractIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || '127.0.0.1';
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ipAddress = extractIp(req);
    const user = await this.authService.validateUser(dto.email, dto.password, ipAddress);

    // Enforce Portal Role Separation:
    const portal = (dto.portal || '').toLowerCase();
    if (portal === 'employee') {
      if (user.role === 'SUPER_ADMIN') {
        throw new ForbiddenException(
          'हे पोर्टल फक्त विभागीय कर्मचारी व अधिकाऱ्यांसाठी आहे. मुख्य प्रशासकांनी कृपया प्रशासन पोर्टल (Admin Portal) मध्ये लॉगिन करावे.'
        );
      }
    } else if (portal === 'admin') {
      if (user.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException(
          'हे पोर्टल केवळ मुख्य प्रशासकांसाठी (Super Admin) आहे. कर्मचाऱ्यांनी कृपया विभागीय कर्मचारी पोर्टल (Employee Portal) मध्ये लॉगिन करावे.'
        );
      }
    }

    const result = await this.authService.login(user, ipAddress);

    const cookieName = portal === 'employee' ? 'wmc_employee_token' : 'wmc_admin_token';

    // Set secure HttpOnly cookie for XSS protection
    response.cookie(cookieName, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('setup')
  async setupInitialAdmin(@Body() dto: InitialAdminDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.registerInitialAdmin(dto);
    response.cookie('wmc_admin_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const portal = (req.headers['x-portal-type'] || req.query.portal || '').toString().toLowerCase();
    if (portal === 'employee' && req.user.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('मुख्य प्रशासक (Super Admin) कर्मचारी पोर्टल वापरू शकत नाहीत.');
    }
    if (portal === 'admin' && req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('कर्मचारी (Staff) थेट मुख्य प्रशासन पॅनेल वापरू शकत नाहीत.');
    }
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.id, dto.name);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.currentPassword, dto.newPassword);
  }

  // ---------------------------------------------------------------------------
  // Staff / Department Users Management (RBAC)
  // ---------------------------------------------------------------------------
  @UseGuards(JwtAuthGuard)
  @Get('staff')
  async getStaffList(@Req() req: any) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिनला कर्मचारी यादी पाहण्याची परवानगी आहे.');
    }
    return this.authService.getStaffUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Post('staff')
  async createStaff(@Req() req: any, @Body() dto: CreateStaffDto) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिन नवीन कर्मचारी खाते जोडू शकतात.');
    }
    const ipAddress = extractIp(req);
    return this.authService.createStaffUser(dto, req.user, ipAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('staff/:id')
  async updateStaff(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateStaffDto) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिन कर्मचारी खाते बदलू शकतात.');
    }
    const ipAddress = extractIp(req);
    return this.authService.updateStaffUser(id, dto, req.user, ipAddress);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('staff/:id')
  async deleteStaff(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिन कर्मचारी खाते हटवू शकतात.');
    }
    const ipAddress = extractIp(req);
    return this.authService.deleteStaffUser(id, req.user, ipAddress);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('wmc_admin_token');
    response.clearCookie('wmc_employee_token');
    return { success: true, message: 'Logged out successfully' };
  }
}
