import {
  Controller,
  Post,
  Delete,
  Get,
  Query,
  Body,
  Res,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService, StorageFolder } from './storage.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/super-admin.guard';
import { validateFileMagicBytes } from './file-validation';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  /**
   * Upload an asset to Cloudflare R2 or Vercel Blob storage.
   * Accepts multipart/form-data with field name 'file' and optional 'folder' query/body.
   * Protected with Admin JWT guard and strict role + MIME/magic byte validation.
   */
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Query('folder') queryFolder?: StorageFolder,
    @Body('folder') bodyFolder?: StorageFolder,
  ) {
    if (!file) {
      throw new BadRequestException('File is required in multipart form data (field name: "file")');
    }
    const folder = queryFolder || bodyFolder || 'general';

    // Enforce role separation: Only SUPER_ADMIN can upload to municipal admin assets
    const adminFolders: StorageFolder[] = ['tenders', 'officials', 'notices', 'schemes', 'routine', 'sabha', 'gallery'];
    if (adminFolders.includes(folder) && req.user?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ मुख्य प्रशासकाला (Super Admin) या फोल्डरमध्ये फाईल अपलोड करण्याची परवानगी आहे.');
    }

    // Inspect file buffer magic bytes (file signature) - do not trust client MIME type
    const { detectedMime, sanitizedFilename } = validateFileMagicBytes(file.buffer, file.originalname);
    file.mimetype = detectedMime;
    file.originalname = sanitizedFilename;

    return this.storageService.uploadFile(file, folder);
  }

  /**
   * Public endpoint for citizens to upload grievance photos/attachments.
   * Protected with rate limiting and strict magic-byte validation.
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

    // Public citizen upload: Strict magic byte validation
    const { detectedMime, sanitizedFilename } = validateFileMagicBytes(file.buffer, file.originalname);
    file.mimetype = detectedMime;
    file.originalname = sanitizedFilename;

    return this.storageService.uploadFile(file, 'grievances');
  }

  /**
   * Request client upload token for direct browser upload up to 500 MB.
   * Restricted strictly to Super Administrators.
   */
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
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
