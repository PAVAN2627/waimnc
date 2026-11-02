import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService, StorageFolder } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Upload an asset to Vercel Blob storage.
   * Accepts multipart/form-data with field name 'file' and optional 'folder' query/body.
   * Protected with Admin JWT guard.
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') queryFolder?: StorageFolder,
    @Body('folder') bodyFolder?: StorageFolder,
  ) {
    if (!file) {
      throw new BadRequestException('File is required in multipart form data (field name: "file")');
    }
    const folder = queryFolder || bodyFolder || 'general';
    return this.storageService.uploadFile(file, folder);
  }

  /**
   * Public endpoint for citizens to upload grievance photos/attachments to Vercel Blob.
   * Rate limited to prevent abuse.
   */
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('upload-grievance')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  }))
  async uploadGrievanceAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required in multipart form data (field name: "file")');
    }
    return this.storageService.uploadFile(file, 'grievances');
  }

  /**
   * Request client upload token for direct browser upload up to 500 MB.
   * Completely bypasses any 4.5 MB serverless body limits.
   * Protected with Admin JWT guard.
   */
  @UseGuards(JwtAuthGuard)
  @Post('client-token')
  async getClientUploadToken(
    @Body('filename') filename: string,
    @Body('folder') folder?: StorageFolder,
    @Body('maxSizeBytes') maxSizeBytes?: number,
  ) {
    if (!filename) {
      throw new BadRequestException('filename is required');
    }
    return this.storageService.generateClientUploadToken(filename, folder || 'general', maxSizeBytes);
  }

  /**
   * Stream / View a file from Vercel Blob storage.
   * Used for both public citizen downloads and admin previews.
   */
  @Get('file')
  async viewFile(
    @Query('pathname') pathname: string,
    @Query('url') url: string,
    @Query('download') download: string,
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    const target = pathname || url;
    if (!target) {
      throw new BadRequestException('pathname or url query parameter is required');
    }

    const result = await this.storageService.getFileStream(target);

    res.setHeader('Content-Type', result.blob.contentType || 'application/octet-stream');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const isDownload = Boolean(download === '1' || download === 'true');
    const safeFilename = filename || target.split('/').pop()?.split('?')[0] || 'attachment';
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}"`);
    } else {
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(safeFilename)}"`);
    }

    // Stream file to Express response
    if (result.nodeStream) {
      result.nodeStream.pipe(res);
    } else if (result.stream) {
      const nodeStream = Readable.fromWeb(result.stream as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  }

  /**
   * Delete an asset from Vercel Blob storage.
   * Protected with Admin JWT guard and SuperAdmin guard.
   */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Delete()
  async deleteFile(@Query('url') url?: string, @Body('url') bodyUrl?: string) {
    const target = url || bodyUrl;
    if (!target) {
      throw new BadRequestException('url is required to delete blob');
    }
    return this.storageService.deleteFile(target);
  }

  /**
   * Inspect metadata of a blob file.
   */
  @Get('info')
  async getInfo(@Query('url') url: string) {
    if (!url) {
      throw new BadRequestException('url query parameter is required');
    }
    return this.storageService.getFileMetadata(url);
  }

  /**
   * List files in a given folder prefix.
   */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('list')
  async listFiles(@Query('prefix') prefix?: string) {
    return this.storageService.listFiles(prefix);
  }
}
