import { Controller, Get, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { AuditLogsService, GetAuditLogsQuery } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getLogs(@Req() req: any, @Query() query: GetAuditLogsQuery) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिनला ऑडिट लॉग्ज पाहण्याचा अधिकार आहे.');
    }
    return this.auditLogsService.getLogs(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Req() req: any) {
    if (req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिनला ऑडिट लॉग्ज पाहण्याचा अधिकार आहे.');
    }
    return this.auditLogsService.getStats();
  }
}

