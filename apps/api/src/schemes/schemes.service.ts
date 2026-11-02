import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class SchemesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getPublicSchemes(category?: string) {
    return this.prisma.scheme.findMany({
      where: {
        status: 'active',
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAdmin() {
    return this.prisma.scheme.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const rawImage = data.imageUrl || data.imageBase64;
    const imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'scheme', 'schemes');

    return this.prisma.scheme.create({
      data: {
        category: data.category || 'central',
        titleMr: data.titleMr || data.title,
        titleEn: data.titleEn,
        descMr: data.descMr || data.desc || data.description,
        descEn: data.descEn,
        eligibilityMr: data.eligibilityMr || data.eligibility,
        eligibilityEn: data.eligibilityEn,
        benefitsMr: data.benefitsMr || data.benefits,
        benefitsEn: data.benefitsEn,
        externalUrl: data.externalUrl,
        imageUrl,
        status: data.status || 'active',
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.scheme.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Scheme not found');

    const updateData: any = { ...data };
    if (data.imageUrl !== undefined || data.imageBase64 !== undefined) {
      const rawImage = data.imageUrl || data.imageBase64;
      updateData.imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'scheme', 'schemes');
      delete updateData.imageBase64;

      // Delete old scheme image from storage if replaced
      if (existing.imageUrl && existing.imageUrl !== updateData.imageUrl) {
        await this.storageService.deleteFile(existing.imageUrl);
      }
    }

    return this.prisma.scheme.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.scheme.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Scheme not found');

    // Delete attached image from Cloudflare R2 / storage
    if (existing.imageUrl) {
      await this.storageService.deleteFile(existing.imageUrl);
    }

    return this.prisma.scheme.delete({ where: { id } });
  }
}
