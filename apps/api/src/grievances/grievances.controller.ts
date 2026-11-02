import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { GrievancesService } from './grievances.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'मोबाईल क्रमांक बरोबर १० अंकांचा व ६, ७, ८ किंवा ९ ने सुरू होणारा असावा (उदा. 98XXXXXXXX)',
  })
  mobile: string;

  @IsString()
  @IsOptional()
  ward?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  department: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  attachments?: any;
}

@Controller('complaints')
export class GrievancesController {
  constructor(private readonly grievancesService: GrievancesService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('submit')
  async submit(@Body() dto: CreateComplaintDto) {
    return this.grievancesService.submitGrievance(dto);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('track/:token')
  async track(@Param('token') token: string, @Query('mobile') mobile?: string) {
    return this.grievancesService.trackByToken(token, mobile);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAdmin(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    return this.grievancesService.getAllAdmin(status, department, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.grievancesService.updateStatus(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.grievancesService.deleteGrievance(id, req.user);
  }
}
