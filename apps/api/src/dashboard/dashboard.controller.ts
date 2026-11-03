import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('public-stats')
  async getPublicStats() {
    return this.dashboardService.getPublicStats();
  }

  @Get('visitor-count')
  async getVisitorCount(@Query('track') track?: string) {
    const shouldTrack = track === 'true' || track === '1';
    return this.dashboardService.recordVisitor(shouldTrack);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
