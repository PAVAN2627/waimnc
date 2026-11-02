import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async validateUser(rawEmail: string, pass: string, ipAddress?: string) {
    const email = (rawEmail || '').trim().toLowerCase();
    const admin = await (this.prisma.admin as any).findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (!admin) {
      // Record failed login attempt for security monitoring
      await this.auditLogsService.logAction({
        action: 'FAILED_LOGIN',
        resource: 'AUTH',
        adminEmail: email,
        details: { reason: 'User not found' },
        ipAddress,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.isActive === false) {
      await this.auditLogsService.logAction({
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: 'BLOCKED_LOGIN',
        resource: 'AUTH',
        details: { reason: 'Account is deactivated' },
        ipAddress,
      });
      throw new UnauthorizedException('हे खाते निष्क्रिय (Deactivated) केले आहे. कृपया मुख्य प्रशासकाशी संपर्क साधा.');
    }

    const isMatch = await bcrypt.compare(pass, admin.passwordHash);
    if (!isMatch) {
      await this.auditLogsService.logAction({
        adminId: admin.id,
        adminEmail: admin.email,
        adminName: admin.name,
        action: 'FAILED_LOGIN',
        resource: 'AUTH',
        details: { reason: 'Incorrect password' },
        ipAddress,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await (this.prisma.admin as any).update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    return admin;
  }

  async login(admin: any, ipAddress?: string) {
    const role = admin.role || 'SUPER_ADMIN';
    const departments = Array.isArray(admin.departments) && admin.departments.length > 0
      ? admin.departments
      : (admin.department ? admin.department.split(',').map((d: string) => d.trim()).filter(Boolean) : []);
    const department = admin.department || (departments.length > 0 ? departments.join(', ') : null);
    const accessScope = admin.accessScope || 'all';

    const payload = {
      sub: admin.id,
      email: admin.email,
      name: admin.name,
      role,
      department,
      departments,
      accessScope,
    };
    const accessToken = this.jwtService.sign(payload);

    // Record successful login audit log
    await this.auditLogsService.logAction({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'LOGIN',
      resource: 'AUTH',
      details: {
        role,
        department,
        departments,
        accessScope,
        loginTime: new Date().toISOString(),
      },
      ipAddress,
    });

    return {
      accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role,
        department,
        departments,
        accessScope,
      },
    };
  }

  async registerInitialAdmin(data: { name: string; email: string; password: string }) {
    const count = await this.prisma.admin.count();
    if (count > 0) {
      throw new BadRequestException('Administrator already configured.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const admin = await (this.prisma.admin as any).create({
      data: {
        name: data.name || 'System Administrator',
        email: data.email,
        passwordHash,
        role: 'SUPER_ADMIN',
        department: null,
        departments: [],
        accessScope: 'all',
      },
    });

    return this.login(admin);
  }

  async updateProfile(id: string, name: string) {
    const admin = await (this.prisma.admin as any).update({
      where: { id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        departments: true,
        accessScope: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    return admin;
  }

  async changePassword(id: string, currentPass: string, newPass: string) {
    const admin = await (this.prisma.admin as any).findUnique({ where: { id } });
    if (!admin) throw new NotFoundException('Admin user not found');

    const isMatch = await bcrypt.compare(currentPass, admin.passwordHash);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await (this.prisma.admin as any).update({
      where: { id },
      data: { passwordHash },
    });

    await this.auditLogsService.logAction({
      adminId: admin.id,
      adminEmail: admin.email,
      adminName: admin.name,
      action: 'CHANGE_PASSWORD',
      resource: 'AUTH',
      details: { timestamp: new Date().toISOString() },
    });

    return { success: true, message: 'Password updated successfully' };
  }

  // ---------------------------------------------------------------------------
  // Staff & Role-Based Access Control (RBAC) Management
  // ---------------------------------------------------------------------------
  async getStaffUsers() {
    return (this.prisma.admin as any).findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        departments: true,
        accessScope: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaffUser(
    data: {
      name: string;
      email: string;
      password: string;
      department?: string;
      departments?: string[];
      role?: string;
      accessScope?: string;
    },
    creator?: any,
    ipAddress?: string,
  ) {
    const existing = await (this.prisma.admin as any).findUnique({ where: { email: data.email.trim().toLowerCase() } });
    if (existing) {
      throw new BadRequestException('या ईमेल आयडीचे खाते आधीपासून अस्तित्वात आहे.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Multi-department handling
    let deptList: string[] = [];
    if (Array.isArray(data.departments) && data.departments.length > 0) {
      deptList = data.departments.filter(Boolean).map((d) => d.trim());
    } else if (data.department) {
      deptList = data.department.split(',').map((d) => d.trim()).filter(Boolean);
    }
    const joinedDept = deptList.length > 0 ? deptList.join(', ') : (data.department?.trim() || null);

    const user = await (this.prisma.admin as any).create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        passwordHash,
        department: joinedDept,
        departments: deptList,
        role: data.role || 'DEPT_OFFICER',
        accessScope: data.accessScope || 'all',
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        departments: true,
        accessScope: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Record audit log
    await this.auditLogsService.logAction({
      adminId: creator?.id,
      adminEmail: creator?.email,
      adminName: creator?.name,
      action: 'CREATE_STAFF',
      resource: 'STAFF',
      resourceId: user.id,
      details: {
        createdStaffName: user.name,
        createdStaffEmail: user.email,
        role: user.role,
        departments: deptList,
        department: joinedDept,
        accessScope: user.accessScope,
      },
      ipAddress,
    });

    return user;
  }

  async updateStaffUser(
    id: string,
    data: {
      name?: string;
      department?: string;
      departments?: string[];
      role?: string;
      accessScope?: string;
      isActive?: boolean;
      password?: string;
    },
    updater?: any,
    ipAddress?: string,
  ) {
    const existing = await (this.prisma.admin as any).findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('कर्मचारी खाते सापडले नाही.');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();

    if (data.departments !== undefined && Array.isArray(data.departments)) {
      updateData.departments = data.departments.filter(Boolean).map((d) => d.trim());
      updateData.department = updateData.departments.join(', ');
    } else if (data.department !== undefined) {
      updateData.department = data.department.trim();
      updateData.departments = data.department.split(',').map((d) => d.trim()).filter(Boolean);
    }

    if (data.role !== undefined) updateData.role = data.role;
    if (data.accessScope !== undefined) updateData.accessScope = data.accessScope;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (data.password && data.password.trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password.trim(), salt);
    }

    const updated = await (this.prisma.admin as any).update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        departments: true,
        accessScope: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Record audit log
    await this.auditLogsService.logAction({
      adminId: updater?.id,
      adminEmail: updater?.email,
      adminName: updater?.name,
      action: 'UPDATE_STAFF',
      resource: 'STAFF',
      resourceId: id,
      details: {
        staffEmail: updated.email,
        staffName: updated.name,
        changes: {
          role: updateData.role,
          departments: updateData.departments,
          accessScope: updateData.accessScope,
          isActive: updateData.isActive,
          passwordChanged: !!updateData.passwordHash,
        },
      },
      ipAddress,
    });

    return updated;
  }

  async deleteStaffUser(id: string, currentAdmin: any, ipAddress?: string) {
    if (id === currentAdmin?.id) {
      throw new BadRequestException('स्वतःचे खाते हटवता येणार नाही.');
    }

    const existing = await (this.prisma.admin as any).findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('कर्मचारी खाते सापडले नाही.');

    const deleted = await (this.prisma.admin as any).delete({ where: { id } });

    // Record audit log
    await this.auditLogsService.logAction({
      adminId: currentAdmin?.id,
      adminEmail: currentAdmin?.email,
      adminName: currentAdmin?.name,
      action: 'DELETE_STAFF',
      resource: 'STAFF',
      resourceId: id,
      details: {
        deletedStaffName: existing.name,
        deletedStaffEmail: existing.email,
        role: existing.role,
        department: existing.department,
      },
      ipAddress,
    });

    return deleted;
  }
}
