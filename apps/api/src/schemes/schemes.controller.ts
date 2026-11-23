import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SchemesService } from './schemes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  async getPublicDefault(@Query('category') category?: string) {
    return this.schemesService.getPublicSchemes(category);
  }

  @Get('public')
  async getPublic(@Query('category') category?: string) {
    return this.schemesService.getPublicSchemes(category);
  }

  @Get('public/:id')
  async getPublicById(@Param('id') id: string) {
    return this.schemesService.getPublicSchemeById(id);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.schemesService.getAllAdmin();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.schemesService.create(body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.schemesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.schemesService.delete(id);
  }
}

