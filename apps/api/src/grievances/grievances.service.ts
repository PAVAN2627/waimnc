import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { randomBytes } from 'crypto';
import { isFakeMobile } from '@wmc/types';

function matchesDepartment(c: any, targetDept: string): boolean {
  const target = targetDept.toLowerCase().trim();
  const itemDept = (c.department || '').toLowerCase().trim();
  const itemDesc = (c.description || '').toLowerCase();
  const itemType = (c.type || '').toLowerCase();

  if (itemDept.includes(target) || target.includes(itemDept)) return true;

  if (target.includes('पाणी') || target.includes('water')) {
    return itemDept.includes('पाणी') || itemDept.includes('water') || itemType.includes('पाणी') || itemType.includes('नळ');
  }
  if (target.includes('आरोग्य') || target.includes('स्वच्छता') || target.includes('health') || target.includes('sanitation')) {
    return itemDept.includes('आरोग्य') || itemDept.includes('स्वच्छता') || itemDept.includes('कचरा') || itemType.includes('कचरा');
  }
  if (target.includes('बांधकाम') || target.includes('रस्ते') || target.includes('civil') || target.includes('road')) {
    return itemDept.includes('बांधकाम') || itemDept.includes('रस्ते') || itemType.includes('रस्ता') || itemType.includes('खड्डे');
  }
  if (target.includes('विद्युत') || target.includes('दिवाबत्ती') || target.includes('electrical')) {
    return itemDept.includes('विद्युत') || itemDept.includes('दिवाबत्ती') || itemType.includes('पथदिवे') || itemType.includes('लाईट');
  }
  if (target.includes('दाखले') || target.includes('लोकसेवा') || target.includes('हक्क') || target.includes('certificate')) {
    return itemDept.includes('लोकसेवा') || itemDept.includes('दाखले') || itemType.includes('दाखला') || itemType.includes('प्रमाणपत्र');
  }
  if (target.includes('कर') || target.includes('tax')) {
    return itemDept.includes('कर') || itemDept.includes('मूल्यांकन') || itemType.includes('कर');
  }
  if (target.includes('सांडपाणी') || target.includes('गटार') || target.includes('drainage')) {
    return itemDept.includes('सांडपाणी') || itemDept.includes('गटार') || itemType.includes('गटार');
  }
  if (target.includes('अतिक्रमण') || target.includes('encroach')) {
    return itemDept.includes('अतिक्रमण') || itemType.includes('अतिक्रमण');
  }
  if (target.includes('नगररचना') || target.includes('town')) {
    return itemDept.includes('नगररचना') || itemType.includes('नगररचना');
  }
  if (target.includes('अग्निशमन') || target.includes('fire')) {
    return itemDept.includes('अग्निशमन') || itemType.includes('अग्निशमन');
  }
  if (target.includes('जन्म') || target.includes('मृत्यू') || target.includes('birth') || target.includes('death')) {
    return itemDept.includes('जन्म') || itemDept.includes('मृत्यू') || itemDesc.includes('जन्म') || itemDesc.includes('मृत्यू');
  }

  return false;
}

@Injectable()
export class GrievancesService {
  private readonly logger = new Logger(GrievancesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private generateTrackingId(): string {
    const suffix = randomBytes(4).toString('hex').toUpperCase();
    return `WMC-${suffix}`;
  }

  async submitGrievance(data: any) {
    const mobileRaw = (data.mobile || data.citizenPhone || '').trim();
    const cleanedMobile = mobileRaw.replace(/\D/g, '');

    // Strict validation: must be 10 digits and not a fake/repeating number
    if (cleanedMobile.length !== 10) {
      throw new BadRequestException('मोबाईल क्रमांक बरोबर १० अंकांचा असणे अनिवार्य आहे.');
    }

    if (isFakeMobile(cleanedMobile)) {
      throw new BadRequestException(
        'बनावट किंवा एकाच अंकाची पुनरावृत्ती असलेला नंबर (उदा. 9999999999) स्वीकारला जाणार नाही. कृपया खरा नंबर प्रविष्ट करा.'
      );
    }

    const trackingId = this.generateTrackingId();

    // Process all attachments into Vercel Blob so Supabase PostgreSQL never stores base64/binary files
    let attachments: any[] = [];
    if (Array.isArray(data.attachments)) {
      attachments = await Promise.all(
        data.attachments.map(async (att: any) => {
          if (typeof att === 'string') {
            const url = await this.storageService.processAndUploadIfBase64(att, 'grievance_file', 'grievances');
            return { url: url || att, name: 'attachment' };
          }
          if (att && att.base64) {
            const url = await this.storageService.processAndUploadIfBase64(
              att.base64,
              att.name ? att.name.replace(/\.[^/.]+$/, '') : 'grievance_file',
              'grievances',
            );
            return {
              name: att.name || 'attachment',
              mimeType: att.mimeType,
              type: att.type || 'file',
              url: url || att.url || '',
            };
          }
          return att;
        }),
      );
    } else if (Array.isArray(data.photoUrls)) {
      attachments = data.photoUrls.map((u: string) => ({ url: u, name: 'photo' }));
    }

    return this.prisma.complaint.create({
      data: {
        name: data.name || data.citizenName,
        mobile: data.mobile || data.citizenPhone,
        ward: data.ward || '1',
        type: data.type || 'general',
        department: data.department || 'General Administration',
        description: data.description,
        trackingId,
        status: 'pending',
        attachments,
      },
    });
  }

  async trackByToken(trackingId: string, mobile?: string) {
    const complaint = await this.prisma.complaint.findFirst({
      where: {
        OR: [{ trackingId }, { id: trackingId }],
      },
    });

    if (!complaint) throw new NotFoundException('Complaint ticket not found');

    if (mobile && complaint.mobile !== mobile.trim()) {
      throw new NotFoundException('Complaint ticket not found with the provided mobile number');
    }

    // Protect citizen privacy: redact unmasked phone number and citizen full name from public tracking
    return {
      id: complaint.id,
      trackingId: complaint.trackingId,
      department: complaint.department,
      type: complaint.type,
      ward: complaint.ward,
      description: complaint.description,
      status: complaint.status,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      maskedMobile: complaint.mobile ? complaint.mobile.replace(/\d(?=\d{4})/g, '*') : null,
    };
  }

  async getAllAdmin(status?: string, department?: string, currentUser?: any) {
    const list = await this.prisma.complaint.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    // Exclude fake/dummy submissions (e.g. 9999999999) from admin grievance lists
    let filtered = list.filter((c) => !isFakeMobile(c.mobile));

    // Department Officer restriction: match ANY assigned department
    if (currentUser && currentUser.role === 'DEPT_OFFICER') {
      let allowedDepts: string[] = [];
      if (Array.isArray(currentUser.departments) && currentUser.departments.length > 0) {
        allowedDepts = currentUser.departments;
      } else if (currentUser.department) {
        allowedDepts = currentUser.department.split(',').map((d: string) => d.trim()).filter(Boolean);
      }

      if (allowedDepts.length > 0) {
        filtered = filtered.filter((c) => allowedDepts.some((dept) => matchesDepartment(c, dept)));
      }
    }

    // Specific Department filter requested from frontend filter dropdown
    if (department && department !== 'all' && department !== 'सर्व') {
      filtered = filtered.filter((c) => matchesDepartment(c, department));
    }

    return filtered;
  }

  async updateStatus(id: string, updateData: { status: string }, currentUser?: any) {
    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (!updateData || !validStatuses.includes(updateData.status)) {
      throw new BadRequestException(`अवैध स्थिती मूल्य (Invalid status). Allowed: ${validStatuses.join(', ')}`);
    }

    const existing = await this.prisma.complaint.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');

    // IDOR / BOLA Prevention: Verify Department Officer has permission for this complaint's department
    if (currentUser && currentUser.role === 'DEPT_OFFICER') {
      let allowedDepts: string[] = [];
      if (Array.isArray(currentUser.departments) && currentUser.departments.length > 0) {
        allowedDepts = currentUser.departments;
      } else if (currentUser.department) {
        allowedDepts = currentUser.department.split(',').map((d: string) => d.trim()).filter(Boolean);
      }

      const isAllowed = allowedDepts.length > 0 && allowedDepts.some((dept) => matchesDepartment(existing, dept));
      if (!isAllowed) {
        throw new ForbiddenException(
          'तुम्हाला केवळ तुमच्या नियुक्त विभागाच्या तक्रारी/अर्जांची स्थिती बदलण्याची परवानगी आहे (Access denied to update complaints outside assigned departments).',
        );
      }
    }

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: updateData.status,
      },
    });

    const isApp = existing.type === 'service_request' || (existing.description && existing.description.includes('अर्ज'));
    await this.auditLogsService.logAction({
      adminId: currentUser?.id,
      adminEmail: currentUser?.email,
      adminName: currentUser?.name,
      action: 'UPDATE_STATUS',
      resource: isApp ? 'APPLICATIONS' : 'COMPLAINTS',
      resourceId: id,
      details: {
        trackingId: existing.trackingId,
        department: existing.department,
        previousStatus: existing.status,
        newStatus: updateData.status,
        citizenName: existing.name,
      },
    });

    return updated;
  }

  async deleteGrievance(id: string, currentUser?: any) {
    // Only Super Admin can delete complaints / applications permanently
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिनला तक्रारी/अर्ज हटवण्याची परवानगी आहे (Only Super Admin can delete records).');
    }

    const existing = await this.prisma.complaint.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');

    const isApp = existing.type === 'service_request' || (existing.description && existing.description.includes('अर्ज'));
    await this.auditLogsService.logAction({
      adminId: currentUser?.id,
      adminEmail: currentUser?.email,
      adminName: currentUser?.name,
      action: 'DELETE',
      resource: isApp ? 'APPLICATIONS' : 'COMPLAINTS',
      resourceId: id,
      details: {
        trackingId: existing.trackingId,
        department: existing.department,
        status: existing.status,
      },
    });

    // Delete any attached images/files from Cloudflare R2 / storage
    if (existing.attachments) {
      const attachments = Array.isArray(existing.attachments)
        ? existing.attachments
        : [existing.attachments];
      for (const att of attachments) {
        const fileUrl = typeof att === 'string' ? att : (att as any)?.url || (att as any)?.pathname;
        if (fileUrl) {
          try {
            await this.storageService.deleteFile(fileUrl);
          } catch (err) {
            this.logger.warn(`Failed to delete complaint attachment from storage (${fileUrl}): ${err}`);
          }
        }
      }
    }

    return this.prisma.complaint.delete({
      where: { id },
    });
  }
}
