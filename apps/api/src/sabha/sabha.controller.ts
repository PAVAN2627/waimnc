import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SabhaService } from './sabha.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('sabha')
export class SabhaController {
  constructor(private readonly sabhaService: SabhaService) {}

  @Get('public')
  async getPublic(@Query('year') year?: string, @Query('sabhaType') sabhaType?: string) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    return this.sabhaService.getPublicSabha(parsedYear, sabhaType);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAdmin(@Query('year') year?: string, @Query('sabhaType') sabhaType?: string) {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    return this.sabhaService.getAllAdmin(parsedYear, sabhaType);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.sabhaService.create(body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.sabhaService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sabhaService.delete(id);
  }
}
