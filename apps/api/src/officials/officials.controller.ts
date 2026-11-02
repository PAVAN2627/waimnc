import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OfficialsService } from './officials.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('officials')
export class OfficialsController {
  constructor(private readonly officialsService: OfficialsService) {}

  @Get('public')
  async getPublic() {
    return this.officialsService.getPublicOfficials();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.officialsService.getAllAdminOfficials();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.officialsService.getOfficialById(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.officialsService.createOfficial(body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.officialsService.updateOfficial(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.officialsService.deleteOfficial(id);
  }
}
