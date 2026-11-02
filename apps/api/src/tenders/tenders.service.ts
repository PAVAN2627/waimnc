import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class TendersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async getPublicTenders(status?: string, category?: string) {
    const statusFilter = status && status !== 'all' ? status : { in: ['ACTIVE', 'CLOSED'] };
    return this.prisma.tender.findMany({
      where: {
        status: statusFilter as any,
        ...(category ? { category } : {}),
      },
      orderBy: { publishDate: 'desc' },
    });
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

    return this.prisma.tender.create({
      data: {
        ...payload,
        publishDate: new Date(data.publishDate),
        submissionEndDate: new Date(data.submissionEndDate),
        openingDate: data.openingDate ? new Date(data.openingDate) : null,
      },
    });
  }

  async updateTender(id: string, data: any) {
    await this.getTenderById(id);

    const updateData: any = { ...data };
    if (data.documentUrl !== undefined || data.documentBase64 !== undefined) {
      const rawDoc = data.documentUrl || data.documentBase64;
      updateData.documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'tender_doc', 'tenders');
      delete updateData.documentBase64;
    }

    return this.prisma.tender.update({
      where: { id },
      data: {
        ...updateData,
        ...(data.publishDate ? { publishDate: new Date(data.publishDate) } : {}),
        ...(data.submissionEndDate ? { submissionEndDate: new Date(data.submissionEndDate) } : {}),
        ...(data.openingDate ? { openingDate: new Date(data.openingDate) } : {}),
      },
    });
  }

  async deleteTender(id: string) {
    await this.getTenderById(id);
    return this.prisma.tender.delete({ where: { id } });
  }
}
