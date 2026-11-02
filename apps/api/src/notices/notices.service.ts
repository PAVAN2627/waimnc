import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class NoticesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getPublicNotices() {
    return this.prisma.notice.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAdminNotices() {
    return this.prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNotice(data: any) {
    const rawDoc = data.documentUrl || data.attachmentBase64;
    const documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'notice', 'notices');

    return this.prisma.notice.create({
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

    return this.prisma.notice.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) throw new NotFoundException('Notice not found');

    // Delete attached notice PDF from Cloudflare R2 / storage
    if (notice.documentUrl) {
      await this.storageService.deleteFile(notice.documentUrl);
    }

    return this.prisma.notice.delete({ where: { id } });
  }
}
