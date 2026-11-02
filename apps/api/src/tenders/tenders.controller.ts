import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('tenders')
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Get('public')
  async getPublic(@Query('status') status?: string, @Query('category') category?: string) {
    return this.tendersService.getPublicTenders(status, category);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.tendersService.getAllAdminTenders();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.tendersService.getTenderById(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.tendersService.createTender(body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.tendersService.updateTender(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tendersService.deleteTender(id);
  }
}
