import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async getPublicNews() {
    return this.cacheService.wrap('news:public', () => {
      return this.prisma.newsItem.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
    }, 300); // 5 minutes cache
  }

  async getAllAdmin() {
    return this.prisma.newsItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const rawImage = data.imageUrl || data.imageBase64;
    const imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'news', 'general');

    const created = await this.prisma.newsItem.create({
      data: {
        title: data.title,
        titleEn: data.titleEn,
        date: data.date,
        dateEn: data.dateEn,
        tag: data.tag,
        tagEn: data.tagEn,
        externalUrl: data.externalUrl,
        imageUrl,
        status: data.status || 'active',
      },
    });

    await this.cacheService.delPattern('news:*');
    return created;
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.newsItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News item not found');

    const updateData: any = { ...data };
    if (data.imageUrl !== undefined || data.imageBase64 !== undefined) {
      const rawImage = data.imageUrl || data.imageBase64;
      updateData.imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'news', 'general');
      delete updateData.imageBase64;

      // Delete old news image from storage if replaced
      if (existing.imageUrl && existing.imageUrl !== updateData.imageUrl) {
        await this.storageService.deleteFile(existing.imageUrl);
      }
    }

    const updated = await this.prisma.newsItem.update({
      where: { id },
      data: updateData,
    });

    await this.cacheService.delPattern('news:*');
    return updated;
  }

  async delete(id: string) {
    const existing = await this.prisma.newsItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('News item not found');

    // Delete attached image from Cloudflare R2 / storage
    if (existing.imageUrl) {
      await this.storageService.deleteFile(existing.imageUrl);
    }

    const deleted = await this.prisma.newsItem.delete({ where: { id } });
    await this.cacheService.delPattern('news:*');
    return deleted;
  }
}

