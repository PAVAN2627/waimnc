import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly cacheService: CacheService,
  ) {}

  async getPublicProjects() {
    return this.cacheService.wrap('projects:public', () => {
      return this.prisma.project.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
      });
    }, 300);
  }

  async getAllAdmin() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any) {
    const rawDoc = data.documentUrl || data.documentBase64;
    const documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'project_doc', 'general');

    const created = await this.prisma.project.create({
      data: {
        titleMr: data.titleMr || data.title,
        titleEn: data.titleEn,
        descMr: data.descMr || data.desc || data.description,
        descEn: data.descEn,
        progress: typeof data.progress === 'number' ? data.progress : parseInt(data.progress || '0', 10),
        iconName: data.iconName || 'FolderOpen',
        documentUrl: documentUrl || data.documentUrl || null,
        documentName: data.documentName || null,
        status: data.status || 'active',
      },
    });

    await this.cacheService.delPattern('projects:*');
    return created;
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    const updatePayload: any = { ...data };
    if (updatePayload.progress !== undefined) {
      updatePayload.progress = typeof updatePayload.progress === 'number'
        ? updatePayload.progress
        : parseInt(updatePayload.progress || '0', 10);
    }
    if (data.documentUrl !== undefined || data.documentBase64 !== undefined) {
      const rawDoc = data.documentUrl || data.documentBase64;
      updatePayload.documentUrl = await this.storageService.processAndUploadIfBase64(rawDoc, 'project_doc', 'general');
      delete updatePayload.documentBase64;

      if (existing.documentUrl && existing.documentUrl !== updatePayload.documentUrl) {
        await this.storageService.deleteFile(existing.documentUrl);
      }
    }
    if (data.documentName !== undefined) {
      updatePayload.documentName = data.documentName || null;
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: updatePayload,
    });

    await this.cacheService.delPattern('projects:*');
    return updated;
  }

  async delete(id: string) {
    const existing = await this.prisma.project.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Project not found');

    // Delete attached document from Cloudflare R2 / storage
    if (existing.documentUrl) {
      await this.storageService.deleteFile(existing.documentUrl);
    }

    const deleted = await this.prisma.project.delete({ where: { id } });
    await this.cacheService.delPattern('projects:*');
    return deleted;
  }
}

