import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class R2Service {
  private readonly logger = new Logger(R2Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicDomain: string;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('R2_ACCOUNT_ID') || 'placeholder_account_id';
    const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID') || 'placeholder_access_key';
    const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY') || 'placeholder_secret';

    this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || 'wmc-media';
    this.publicDomain = (this.configService.get<string>('R2_PUBLIC_DOMAIN') || 'https://media.waimunicipalcouncil.org').replace(/\/+$/, '');

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async createPresignedUploadUrl(
    filename: string,
    mimeType: string,
    folder: 'tenders' | 'officials' | 'notices' | 'grievances' | 'gallery' = 'tenders'
  ) {
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: mimeType,
    });

    // 15-minute validity window for upload
    const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    const publicUrl = `${this.publicDomain}/${key}`;

    this.logger.log(`Generated R2 presigned upload URL for key: ${key}`);

    return {
      uploadUrl,
      publicUrl,
      key,
    };
  }
}
