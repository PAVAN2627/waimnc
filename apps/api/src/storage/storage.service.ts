import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del, head, list, get } from '@vercel/blob';
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';

export type StorageFolder = 'tenders' | 'officials' | 'notices' | 'grievances' | 'gallery' | 'sabha' | 'routine' | 'schemes' | 'general';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly token: string;
  private readonly access: 'private' | 'public';

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN') || '';
    // Store is created in private mode (IAD1 store_wR8r8cKpuVEOvQ1m)
    this.access = (this.configService.get<string>('BLOB_ACCESS') as 'private' | 'public') || 'private';

    if (!this.token) {
      this.logger.warn('BLOB_READ_WRITE_TOKEN is not set in .env');
    } else {
      this.logger.log(`Vercel Blob Storage initialized in ${this.access} mode`);
    }
  }

  /**
   * Uploads a file buffer directly to Vercel Blob storage.
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: StorageFolder = 'general',
  ) {
    if (!file) {
      throw new BadRequestException('No file provided for upload');
    }

    return this.uploadBuffer(file.buffer, file.originalname, file.mimetype, folder);
  }

  /**
   * Uploads a raw buffer directly to Vercel Blob storage.
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: StorageFolder = 'general',
  ) {
    if (!this.token) {
      throw new BadRequestException('Vercel Blob Storage token is not configured in .env');
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const pathname = `${folder}/${Date.now()}-${cleanFilename}`;

    this.logger.log(`Uploading buffer to Vercel Blob: ${pathname} (${buffer.length} bytes, ${mimetype})`);

    const blob = await put(pathname, buffer, {
      access: this.access,
      contentType: mimetype,
      token: this.token,
    });

    const viewUrl = `/api/storage/file?pathname=${encodeURIComponent(blob.pathname)}`;
    this.logger.log(`Vercel Blob upload successful: ${blob.url} (viewUrl: ${viewUrl})`);

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      filename,
      contentType: mimetype,
      size: buffer.length,
      viewUrl,
    };
  }

  /**
   * Safety guard: if input string is base64 or a data URI, upload to Vercel Blob immediately
   * and return the Vercel Blob view URL. Prevents storing binary/base64 strings in PostgreSQL.
   */
  async processAndUploadIfBase64(
    input: string | undefined | null,
    filenamePrefix: string,
    folder: StorageFolder = 'general',
  ): Promise<string | null> {
    if (!input || typeof input !== 'string') return null;

    // Already a URL or storage proxy path
    if (
      input.startsWith('http://') ||
      input.startsWith('https://') ||
      input.startsWith('/api/storage/file') ||
      input.startsWith('/assets/')
    ) {
      return input;
    }

    const match = input.match(/^data:([^;]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimetype = 'image/jpeg';
    let ext = 'jpg';

    if (match) {
      mimetype = match[1];
      buffer = Buffer.from(match[2], 'base64');
      if (mimetype.includes('png')) ext = 'png';
      else if (mimetype.includes('webp')) ext = 'webp';
      else if (mimetype.includes('pdf')) ext = 'pdf';
      else if (mimetype.includes('gif')) ext = 'gif';
      else if (mimetype.includes('mp4') || mimetype.includes('video')) ext = 'mp4';
    } else if (input.length > 200 && /^[A-Za-z0-9+/=\r\n]+$/.test(input.trim().slice(0, 100))) {
      buffer = Buffer.from(input.trim(), 'base64');
    } else {
      return input;
    }

    try {
      const res = await this.uploadBuffer(buffer, `${filenamePrefix}.${ext}`, mimetype, folder);
      return res.viewUrl;
    } catch (err) {
      this.logger.error(`Failed to upload base64 asset to Vercel Blob: ${err}`);
      return null;
    }
  }

  /**
   * Retrieves a file stream from Vercel Blob storage.
   */
  async getFileStream(pathnameOrUrl: string): Promise<any> {
    if (!this.token) {
      throw new BadRequestException('Vercel Blob Storage token is not configured');
    }

    // Extract pathname if a full URL was provided
    let cleanPathname = pathnameOrUrl;
    try {
      if (pathnameOrUrl.startsWith('http://') || pathnameOrUrl.startsWith('https://')) {
        const parsed = new URL(pathnameOrUrl);
        cleanPathname = parsed.pathname.replace(/^\/+/, '');
      }
    } catch {
      cleanPathname = pathnameOrUrl;
    }

    const result = await get(cleanPathname, {
      access: this.access,
      token: this.token,
    });

    if (!result || result.statusCode !== 200) {
      throw new NotFoundException(`File not found in Vercel Blob storage: ${cleanPathname}`);
    }

    return result;
  }

  /**
   * Deletes a file from Vercel Blob storage by its full URL or pathname.
   */
  async deleteFile(urlOrPathname: string) {
    if (!this.token) {
      throw new BadRequestException('Vercel Blob Storage token is not configured');
    }
    await del(urlOrPathname, { token: this.token });
    this.logger.log(`Deleted blob: ${urlOrPathname}`);
    return { success: true };
  }

  /**
   * Inspects metadata of a stored blob.
   */
  async getFileMetadata(urlOrPathname: string) {
    if (!this.token) {
      throw new BadRequestException('Vercel Blob Storage token is not configured');
    }
    return head(urlOrPathname, { token: this.token });
  }

  /**
   * Lists stored blobs by folder prefix.
   */
  async listFiles(prefix?: string) {
    if (!this.token) {
      throw new BadRequestException('Vercel Blob Storage token is not configured');
    }
    return list({ prefix, token: this.token });
  }

  /**
   * Generates a client-side upload token for direct browser uploads up to 500 MB.
   * Completely bypasses serverless body size limits.
   */
  async generateClientUploadToken(
    filename: string,
    folder: StorageFolder = 'general',
    maxSizeBytes: number = 50 * 1024 * 1024, // 50 MB default (can go up to 500 MB)
  ) {
    if (!this.token) {
      throw new BadRequestException('Vercel Blob Storage token is not configured in .env');
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const pathname = `${folder}/${Date.now()}-${cleanFilename}`;

    const clientToken = await generateClientTokenFromReadWriteToken({
      token: this.token,
      pathname,
      maximumSizeInBytes: maxSizeBytes,
    });

    return {
      clientToken,
      pathname,
      viewUrl: `/api/storage/file?pathname=${encodeURIComponent(pathname)}`,
    };
  }
}
