import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class OfficialsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async getPublicOfficials() {
    return this.cacheService.wrap('officials:public', () => {
      return this.prisma.official.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      });
    }, 600);
  }

  async getAllAdminOfficials() {
    return this.prisma.official.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getOfficialById(id: string) {
    const official = await this.prisma.official.findUnique({ where: { id } });
    if (!official) throw new NotFoundException('Official not found');
    return official;
  }

  async createOfficial(data: any) {
    const rawPhoto = data.photoUrl || data.photoBase64;
    const photoUrl = await this.storageService.processAndUploadIfBase64(rawPhoto, 'official', 'officials');

    const payload = { ...data };
    delete payload.photoBase64;
    payload.photoUrl = photoUrl;

    const created = await this.prisma.official.create({ data: payload });
    await this.cacheService.delPattern('officials:*');
    return created;
  }

  async updateOfficial(id: string, data: any) {
    const existing = await this.getOfficialById(id);

    const updateData = { ...data };
    if (data.photoUrl !== undefined || data.photoBase64 !== undefined) {
      const rawPhoto = data.photoUrl || data.photoBase64;
      updateData.photoUrl = await this.storageService.processAndUploadIfBase64(rawPhoto, 'official', 'officials');
      delete updateData.photoBase64;

      // Delete old official photo from storage if replaced
      if (existing.photoUrl && existing.photoUrl !== updateData.photoUrl) {
        await this.storageService.deleteFile(existing.photoUrl);
      }
    }

    const updated = await this.prisma.official.update({
      where: { id },
      data: updateData,
    });

    await this.cacheService.delPattern('officials:*');
    return updated;
  }

  async deleteOfficial(id: string) {
    const existing = await this.getOfficialById(id);

    // Delete photo from Cloudflare R2 / storage
    if (existing.photoUrl) {
      await this.storageService.deleteFile(existing.photoUrl);
    }

    const deleted = await this.prisma.official.delete({ where: { id } });
    await this.cacheService.delPattern('officials:*');
    return deleted;
  }
}
