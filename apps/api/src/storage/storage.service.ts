import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del, head, list, get } from '@vercel/blob';
import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export type StorageFolder = 'tenders' | 'officials' | 'notices' | 'grievances' | 'gallery' | 'sabha' | 'routine' | 'schemes' | 'general';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly token: string;
  private readonly access: 'private' | 'public';
  private readonly s3Client?: S3Client;
  private readonly r2BucketName: string;
  private readonly r2PublicDomain: string;
  private readonly useR2: boolean;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN') || '';
    this.access = (this.configService.get<string>('BLOB_ACCESS') as 'private' | 'public') || 'private';

    const r2AccountId = this.configService.get<string>('R2_ACCOUNT_ID');
    const r2AccessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID');
    const r2SecretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY');
    this.r2BucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'waimuncipal';
    this.r2PublicDomain = (this.configService.get<string>('R2_PUBLIC_DOMAIN') || '').replace(/\/+$/, '');

    if (
      r2AccountId &&
      r2AccessKeyId &&
      r2SecretAccessKey &&
      !r2AccessKeyId.includes('placeholder') &&
      !r2AccessKeyId.includes('your_')
    ) {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: r2AccessKeyId,
          secretAccessKey: r2SecretAccessKey,
        },
      });
      this.useR2 = true;
      this.logger.log(`Cloudflare R2 Storage initialized for bucket: ${this.r2BucketName}`);
    } else {
      this.useR2 = false;
      if (!this.token) {
        this.logger.warn('Neither Cloudflare R2 nor Vercel Blob is configured');
      } else {
        this.logger.log(`Vercel Blob Storage initialized in ${this.access} mode`);
      }
    }
  }

  /**
   * Uploads a file buffer directly to Cloudflare R2 or Vercel Blob storage.
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
   * Uploads a raw buffer directly to Cloudflare R2 or Vercel Blob storage.
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    mimetype: string,
    folder: StorageFolder = 'general',
  ) {
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const pathname = `${folder}/${Date.now()}-${cleanFilename}`;

    // Prefer Cloudflare R2 S3 storage
    if (this.useR2 && this.s3Client) {
      this.logger.log(`Uploading buffer to Cloudflare R2: ${pathname} (${buffer.length} bytes, ${mimetype})`);
      const command = new PutObjectCommand({
        Bucket: this.r2BucketName,
        Key: pathname,
        Body: buffer,
        ContentType: mimetype,
      });
      await this.s3Client.send(command);

      const viewUrl = `/api/storage/file?pathname=${encodeURIComponent(pathname)}`;
      const publicUrl = this.r2PublicDomain ? `${this.r2PublicDomain}/${pathname}` : viewUrl;

      this.logger.log(`Cloudflare R2 upload successful: ${pathname} (viewUrl: ${viewUrl})`);

      return {
        url: publicUrl,
        downloadUrl: publicUrl,
        pathname,
        filename,
        contentType: mimetype,
        size: buffer.length,
        viewUrl,
      };
    }

    // Fallback to Vercel Blob
    if (!this.token) {
      throw new BadRequestException('Storage service is not configured in .env');
    }

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

  private extractCleanPathname(urlOrPathname: string): string {
    if (!urlOrPathname || typeof urlOrPathname !== 'string') return '';
    let clean = urlOrPathname.trim();

    if (clean.includes('pathname=')) {
      const match = clean.match(/pathname=([^&]+)/);
      if (match) {
        clean = decodeURIComponent(match[1]);
      }
    } else if (clean.startsWith('http://') || clean.startsWith('https://')) {
      try {
        const parsed = new URL(clean);
        if (parsed.searchParams.has('pathname')) {
          clean = parsed.searchParams.get('pathname') || clean;
        } else {
          clean = parsed.pathname.replace(/^\/+/, '');
        }
      } catch {
        // fallback to original
      }
    }

    return clean.replace(/^\/+/, '');
  }

  /**
   * Retrieves a file stream from Cloudflare R2 or Vercel Blob storage.
   */
  async getFileStream(pathnameOrUrl: string): Promise<any> {
    const cleanPathname = this.extractCleanPathname(pathnameOrUrl);
    if (!cleanPathname) {
      throw new BadRequestException('Invalid file path or URL');
    }

    // Try Cloudflare R2 first if enabled
    if (this.useR2 && this.s3Client) {
      try {
        const s3Obj = await this.s3Client.send(
          new GetObjectCommand({
            Bucket: this.r2BucketName,
            Key: cleanPathname,
          }),
        );

        if (s3Obj && s3Obj.Body) {
          return {
            blob: {
              contentType: s3Obj.ContentType || 'application/octet-stream',
              size: s3Obj.ContentLength || 0,
            },
            nodeStream: s3Obj.Body as Readable,
          };
        }
      } catch (err: any) {
        this.logger.warn(`File not found in R2 (${cleanPathname}): ${err.message}. Trying Vercel Blob fallback...`);
      }
    }

    if (!this.token) {
      throw new NotFoundException(`File not found in storage: ${cleanPathname}`);
    }

    const result = await get(cleanPathname, {
      access: this.access,
      token: this.token,
    });

    if (!result || result.statusCode !== 200) {
      throw new NotFoundException(`File not found in storage: ${cleanPathname}`);
    }

    return result;
  }

  /**
   * Deletes a file from Cloudflare R2 or Vercel Blob storage by its full URL or pathname.
   */
  async deleteFile(urlOrPathname: string | null | undefined) {
    if (!urlOrPathname || typeof urlOrPathname !== 'string') {
      return { success: true };
    }

    const cleanPathname = this.extractCleanPathname(urlOrPathname);
    if (!cleanPathname) return { success: true };

    this.logger.log(`Deleting file from storage: ${cleanPathname}`);

    if (this.useR2 && this.s3Client) {
      try {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: this.r2BucketName,
            Key: cleanPathname,
          }),
        );
        this.logger.log(`Deleted from Cloudflare R2: ${cleanPathname}`);
      } catch (err: any) {
        this.logger.warn(`Failed to delete from R2 (${cleanPathname}): ${err.message}`);
      }
    }

    if (this.token) {
      try {
        await del(urlOrPathname, { token: this.token });
        this.logger.log(`Deleted blob: ${urlOrPathname}`);
      } catch {
        // ignore if not found in Vercel blob
      }
    }

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
