import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

export interface CreateSabhaDto {
  type?: 'upcoming' | 'previous';
  sabhaType?: 'sarvasadharan' | 'vishesh' | 'sthayi_samiti';
  year?: number;
  tharavNumber?: string;
  titleMr: string;
  titleEn?: string;
  date: string;
  time?: string;
  videoUrl?: string;
  minutesUrl?: string;
  minutesBase64?: string;
  minutesName?: string;
  status?: string;
}

@Injectable()
export class SabhaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getPublicSabha(year?: number, sabhaType?: string) {
    const where: any = { status: 'active' };
    if (year) where.year = year;
    if (sabhaType && sabhaType !== 'all') where.sabhaType = sabhaType;

    return (this.prisma.sabhaMeeting as any).findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getAllAdmin(year?: number, sabhaType?: string) {
    const where: any = {};
    if (year) where.year = year;
    if (sabhaType && sabhaType !== 'all') where.sabhaType = sabhaType;

    return (this.prisma.sabhaMeeting as any).findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async create(data: CreateSabhaDto) {
    const rawMinutes = data.minutesUrl || data.minutesBase64;
    const minutesUrl = await this.storageService.processAndUploadIfBase64(rawMinutes, 'minutes', 'sabha');

    // Automatically derive year from date if not specified (e.g. 2026-11-01 -> 2026)
    let year = data.year;
    if (!year && data.date) {
      const match = data.date.match(/^(\d{4})/);
      if (match) year = parseInt(match[1], 10);
    }
    if (!year) year = new Date().getFullYear();

    return (this.prisma.sabhaMeeting as any).create({
      data: {
        type: data.type || 'upcoming',
        sabhaType: data.sabhaType || 'sarvasadharan',
        year,
        tharavNumber: data.tharavNumber || null,
        titleMr: data.titleMr,
        titleEn: data.titleEn || data.titleMr,
        date: data.date,
        time: data.time || null,
        videoUrl: data.videoUrl || null,
        minutesUrl,
        minutesName: data.minutesName || null,
        status: data.status || 'active',
      },
    });
  }

  async update(id: string, data: Partial<CreateSabhaDto>) {
    const existing = await this.prisma.sabhaMeeting.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sabha meeting not found');

    const updateData: any = { ...data };
    if (data.minutesUrl !== undefined || data.minutesBase64 !== undefined) {
      const rawMinutes = data.minutesUrl || data.minutesBase64;
      updateData.minutesUrl = await this.storageService.processAndUploadIfBase64(rawMinutes, 'minutes', 'sabha');
      delete updateData.minutesBase64;

      // Delete old minutes PDF from storage if replaced
      if (existing.minutesUrl && existing.minutesUrl !== updateData.minutesUrl) {
        await this.storageService.deleteFile(existing.minutesUrl);
      }
    }

    if (data.date && !data.year) {
      const match = data.date.match(/^(\d{4})/);
      if (match) updateData.year = parseInt(match[1], 10);
    }

    return (this.prisma.sabhaMeeting as any).update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.sabhaMeeting.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Sabha meeting not found');

    // Delete attached meeting minutes PDF from Cloudflare R2 / storage
    if (existing.minutesUrl) {
      await this.storageService.deleteFile(existing.minutesUrl);
    }

    return this.prisma.sabhaMeeting.delete({ where: { id } });
  }
}
