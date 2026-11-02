import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogParams {
  adminId?: string;
  adminEmail?: string;
  adminName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
}

export interface GetAuditLogsQuery {
  search?: string;
  action?: string;
  resource?: string;
  adminEmail?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(params: CreateAuditLogParams) {
    try {
      return await (this.prisma as any).auditLog.create({
        data: {
          adminId: params.adminId || null,
          adminEmail: params.adminEmail || null,
          adminName: params.adminName || null,
          action: params.action,
          resource: params.resource,
          resourceId: params.resourceId || null,
          details: params.details || null,
          ipAddress: params.ipAddress || null,
        },
      });
    } catch (err: any) {
      this.logger.error(`Failed to record audit log: ${err.message}`, err.stack);
      return null;
    }
  }

  async getLogs(query: GetAuditLogsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.action && query.action !== 'all') {
      where.action = query.action;
    }

    if (query.resource && query.resource !== 'all') {
      where.resource = query.resource;
    }

    if (query.adminEmail && query.adminEmail !== 'all') {
      where.adminEmail = { contains: query.adminEmail, mode: 'insensitive' };
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { adminName: { contains: term, mode: 'insensitive' } },
        { adminEmail: { contains: term, mode: 'insensitive' } },
        { action: { contains: term, mode: 'insensitive' } },
        { resource: { contains: term, mode: 'insensitive' } },
        { resourceId: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, logs] = await Promise.all([
      (this.prisma as any).auditLog.count({ where }),
      (this.prisma as any).auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getStats() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalLogs, todayLogs, loginCountToday, recentAdmins] = await Promise.all([
      (this.prisma as any).auditLog.count(),
      (this.prisma as any).auditLog.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      (this.prisma as any).auditLog.count({
        where: {
          action: 'LOGIN',
          createdAt: { gte: startOfToday },
        },
      }),
      (this.prisma as any).auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        distinct: ['adminEmail'],
        select: {
          adminName: true,
          adminEmail: true,
          createdAt: true,
          action: true,
        },
      }),
    ]);

    return {
      totalLogs,
      todayLogs,
      loginCountToday,
      recentAdmins,
    };
  }
}

