import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class NoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async getPublicNotices() {
    return this.cacheService.wrap('notices:public', () => {
      return this.prisma.notice.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
    }, 300); // Cache for 5 minutes
  }

  async getAllAdminNotices() {
    return this.prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNotice(data: any) {
    const rawDoc = data.documentUrl || data.attachmentBase64;
    const documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'notice', 'notices');

    const created = await this.prisma.notice.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        content: data.content,
        contentEn: data.contentEn,
        tag: data.tag,
        tagEn: data.tagEn,
        externalUrl: data.externalUrl,
        documentUrl,
        status: data.status || 'active',
      },
    });

    await this.cacheService.delPattern('notices:*');
    return created;
  }

  async updateNotice(id: string, data: any) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    const updateData: any = { ...data };
    if (data.documentUrl !== undefined || data.attachmentBase64 !== undefined) {
      const rawDoc = data.documentUrl || data.attachmentBase64;
      updateData.documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'notice', 'notices');
      delete updateData.attachmentBase64;

      // Delete old notice PDF from storage if replaced
      if (notice.documentUrl && notice.documentUrl !== updateData.documentUrl) {
        await this.storageService.deleteFile(notice.documentUrl);
      }
    }

    const updated = await this.prisma.notice.update({
      where: { id },
      data: updateData,
    });

    await this.cacheService.delPattern('notices:*');
    return updated;
  }

  async deleteNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    // Delete attached notice PDF from Cloudflare R2 / storage
    if (notice.documentUrl) {
      await this.storageService.deleteFile(notice.documentUrl);
    }

    const deleted = await this.prisma.notice.delete({ where: { id } });
    await this.cacheService.delPattern('notices:*');
    return deleted;
  }
}
