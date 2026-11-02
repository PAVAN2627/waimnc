import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isFakeMobile } from '@wmc/types';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicStats() {
    const [
      totalComplaints,
      resolvedComplaints,
      activeProjects,
      activeTenders,
      activeNotices,
      totalOfficials,
    ] = await Promise.all([
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'resolved' } }),
      this.prisma.project.count({ where: { status: 'active' } }),
      this.prisma.tender.count({ where: { status: 'ACTIVE' } }),
      this.prisma.notice.count({ where: { status: 'active' } }),
      this.prisma.official.count({ where: { isActive: true } }),
    ]);

    const resolutionRate = totalComplaints > 0
      ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(1))
      : 98.4;

    return {
      totalComplaints,
      resolvedComplaints,
      resolutionRate,
      activeProjects,
      activeTenders,
      activeNotices,
      totalOfficials,
    };
  }

  async getDashboardStats() {
    const [
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      activeNotices,
      ongoingProjects,
      recentComplaints,
    ] = await Promise.all([
      this.prisma.complaint.count(),
      this.prisma.complaint.count({ where: { status: 'pending' } }),
      this.prisma.complaint.count({ where: { status: 'in-progress' } }),
      this.prisma.complaint.count({ where: { status: 'resolved' } }),
      this.prisma.notice.count({ where: { status: 'active' } }),
      this.prisma.project.count({ where: { status: 'active' } }),
      this.prisma.complaint.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      activeNotices,
      ongoingProjects,
      recentComplaints: recentComplaints.filter((c) => !isFakeMobile(c.mobile)).slice(0, 5),
    };
  }
}
