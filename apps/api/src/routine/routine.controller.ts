import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoutineService } from './routine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('routine')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Get('public')
  async getPublic() {
    return this.routineService.getPublicRoutine();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.routineService.getAllAdmin();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.routineService.create(body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.routineService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.routineService.delete(id);
  }
}

