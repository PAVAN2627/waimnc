import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class TendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async getPublicTenders(status?: string, category?: string) {
    const cacheKey = `tenders:public:${status || 'all'}:${category || 'all'}`;
    return this.cacheService.wrap(cacheKey, () => {
      const statusFilter = status && status !== 'all' ? status : { in: ['ACTIVE', 'CLOSED'] };
      return this.prisma.tender.findMany({
        where: {
          status: statusFilter as any,
          ...(category ? { category } : {}),
        },
        orderBy: { publishDate: 'desc' },
      });
    }, 300);
  }

  async getAllAdminTenders() {
    return this.prisma.tender.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTenderById(id: string) {
    const tender = await this.prisma.tender.findUnique({ where: { id } });
    if (!tender) throw new NotFoundException('Tender not found');
    return tender;
  }

  async createTender(data: any) {
    const rawDoc = data.documentUrl || data.documentBase64;
    const documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'tender_doc', 'tenders');

    const payload = { ...data };
    delete payload.documentBase64;
    payload.documentUrl = documentUrl;

    const created = await this.prisma.tender.create({
      data: {
        ...payload,
        publishDate: new Date(data.publishDate),
        submissionEndDate: new Date(data.submissionEndDate),
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
      },
    });

    await this.cacheService.delPattern('tenders:*');
    return created;
  }

  async updateTender(id: string, data: any) {
    const existing = await this.getTenderById(id);

    const updateData: any = { ...data };
    if (data.documentUrl !== undefined || data.documentBase64 !== undefined) {
      const rawDoc = data.documentUrl || data.documentBase64;
      updateData.documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'tender_doc', 'tenders');
      delete updateData.documentBase64;

      // Delete old tender PDF from storage if replaced
      if (existing.documentUrl && existing.documentUrl !== updateData.documentUrl) {
        await this.storageService.deleteFile(existing.documentUrl);
      }
    }

    const updated = await this.prisma.tender.update({
      where: { id },
      data: {
        ...updateData,
        ...(data.publishDate ? { publishDate: new Date(data.publishDate) } : {}),
        ...(data.submissionEndDate ? { submissionEndDate: new Date(data.submissionEndDate) } : {}),
        ...(data.openingDate ? { openingDate: new Date(data.openingDate) } : {}),
      },
    });

    await this.cacheService.delPattern('tenders:*');
    return updated;
  }

  async deleteTender(id: string) {
    const existing = await this.getTenderById(id);

    // Delete attached tender PDF from Cloudflare R2 / storage
    if (existing.documentUrl) {
      await this.storageService.deleteFile(existing.documentUrl);
    }

    const deleted = await this.prisma.tender.delete({ where: { id } });
    await this.cacheService.delPattern('tenders:*');
    return deleted;
  }
}
