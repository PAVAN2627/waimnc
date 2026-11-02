import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('public')
  async getPublic() {
    return this.newsService.getPublicNews();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.newsService.getAllAdmin();
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.newsService.create(body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.newsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}

