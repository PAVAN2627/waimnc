import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class RoutineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getPublicRoutine() {
    return this.prisma.routineItem.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllAdmin() {
    return this.prisma.routineItem.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const rawImage = data.imageUrl || data.imageBase64;
    const imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'routine', 'routine');

    return this.prisma.routineItem.create({
      data: {
        date: data.date,
        titleMr: data.titleMr || data.title,
        titleEn: data.titleEn,
        descMr: data.descMr || data.desc || data.description,
        descEn: data.descEn,
        imageUrl,
        status: data.status || 'active',
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.routineItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Routine item not found');

    const updateData: any = { ...data };
    if (data.imageUrl !== undefined || data.imageBase64 !== undefined) {
      const rawImage = data.imageUrl || data.imageBase64;
      updateData.imageUrl = await this.storageService.processAndUploadIfBase64(rawImage, 'routine', 'routine');
      delete updateData.imageBase64;

      // Delete old routine image from storage if replaced
      if (existing.imageUrl && existing.imageUrl !== updateData.imageUrl) {
        await this.storageService.deleteFile(existing.imageUrl);
      }
    }

    return this.prisma.routineItem.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.routineItem.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Routine item not found');

    // Delete attached image from Cloudflare R2 / storage
    if (existing.imageUrl) {
      await this.storageService.deleteFile(existing.imageUrl);
    }

    return this.prisma.routineItem.delete({ where: { id } });
  }
}

