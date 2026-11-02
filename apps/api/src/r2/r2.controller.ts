import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { R2Service } from './r2.service';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsIn(['tenders', 'officials', 'notices', 'grievances', 'gallery'])
  folder: 'tenders' | 'officials' | 'notices' | 'grievances' | 'gallery';
}

@Controller('r2')
export class R2Controller {
  constructor(private readonly r2Service: R2Service) {}

  @UseGuards(JwtAuthGuard)
  @Post('presigned-url')
  async getPresignedUrl(@Body() dto: GeneratePresignedUrlDto) {
    return this.r2Service.createPresignedUploadUrl(dto.filename, dto.mimeType, dto.folder);
  }
}
