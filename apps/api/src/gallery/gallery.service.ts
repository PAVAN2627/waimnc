import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class GalleryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getPublicGallery(type?: string) {
    return this.prisma.galleryItem.findMany({
      where: {
        status: 'active',
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAdmin() {
    return this.prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const rawImage = data.imageUrl || data.imageBase64;
    const imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'gallery', 'gallery');

    return this.prisma.galleryItem.create({
      data: {
        type: data.type || 'photo',
        titleMr: data.titleMr || data.title,
        titleEn: data.titleEn,
        date: data.date,
        imageUrl,
        videoUrl: data.videoUrl,
        status: data.status || 'active',
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gallery item not found');

    const updateData: any = { ...data };
    if (data.imageUrl !== undefined || data.imageBase64 !== undefined) {
      const rawImage = data.imageUrl || data.imageBase64;
      updateData.imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'gallery', 'gallery');
      delete updateData.imageBase64;

      // Delete old gallery image from storage if replaced
      if (existing.imageUrl && existing.imageUrl !== updateData.imageUrl) {
        await this.storageService.deleteFile(existing.imageUrl);
      }
    }

    return this.prisma.galleryItem.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.galleryItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Gallery item not found');

    // Delete attached image from Cloudflare R2 / storage
    if (existing.imageUrl) {
      await this.storageService.deleteFile(existing.imageUrl);
    }

    return this.prisma.galleryItem.delete({ where: { id } });
  }
}
