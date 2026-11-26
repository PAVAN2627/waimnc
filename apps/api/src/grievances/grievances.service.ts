import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { randomBytes } from 'crypto';
import { isFakeMobile, isUnknownWard, matchesWard } from '@wmc/types';

function matchesDepartment(c: any, targetDept: string): boolean {
  if (!targetDept || targetDept === 'all' || targetDept === 'सर्व') return true;
  const target = targetDept.toLowerCase().trim();
  const itemDept = (c.department || '').toLowerCase().trim();

  // Primary Check: If the complaint has an assigned department (e.g. submitted or shifted by admin)
  if (itemDept) {
    if (itemDept === target || itemDept.includes(target) || target.includes(itemDept)) return true;

    // Bilingual equivalences for municipal departments:
    const isDrainage = (s: string) => s.includes('सांडपाणी') || s.includes('गटार') || s.includes('drainage');
    if (isDrainage(target) && isDrainage(itemDept)) return true;
    if (
      !isDrainage(target) &&
      !isDrainage(itemDept) &&
      (target.includes('पाणी') || target.includes('water')) &&
      (itemDept.includes('पाणी') || itemDept.includes('water'))
    ) return true;
    if (
      (target.includes('आरोग्य') || target.includes('स्वच्छता') || target.includes('health') || target.includes('sanitation')) &&
      (itemDept.includes('आरोग्य') || itemDept.includes('स्वच्छता') || itemDept.includes('health') || itemDept.includes('sanitation'))
    ) return true;
    if (
      (target.includes('बांधकाम') || target.includes('रस्ते') || target.includes('civil') || target.includes('road')) &&
      (itemDept.includes('बांधकाम') || itemDept.includes('रस्ते') || itemDept.includes('civil') || itemDept.includes('road'))
    ) return true;
    if (
      (target.includes('विद्युत') || target.includes('दिवाबत्ती') || target.includes('electrical') || target.includes('light')) &&
      (itemDept.includes('विद्युत') || itemDept.includes('दिवाबत्ती') || itemDept.includes('electrical') || itemDept.includes('light'))
    ) return true;
    if (
      (target.includes('सांडपाणी') || target.includes('गटार') || target.includes('drainage')) &&
      (itemDept.includes('सांडपाणी') || itemDept.includes('गटार') || itemDept.includes('drainage'))
    ) return true;
    if (
      (target.includes('कर') || target.includes('मूल्यांकन') || target.includes('tax')) &&
      (itemDept.includes('कर') || itemDept.includes('मूल्यांकन') || itemDept.includes('tax'))
    ) return true;
    if (
      (target.includes('नगररचना') || target.includes('town') || target.includes('planning')) &&
      (itemDept.includes('नगररचना') || itemDept.includes('town') || itemDept.includes('planning'))
    ) return true;
    if (
      (target.includes('अतिक्रमण') || target.includes('encroach')) &&
      (itemDept.includes('अतिक्रमण') || itemDept.includes('encroach'))
    ) return true;
    if (
      (target.includes('अग्निशमन') || target.includes('fire')) &&
      (itemDept.includes('अग्निशमन') || itemDept.includes('fire'))
    ) return true;
    if (
      (target.includes('जन्म') || target.includes('मृत्यू') || target.includes('birth') || target.includes('death')) &&
      (itemDept.includes('जन्म') || itemDept.includes('मृत्यू') || itemDept.includes('birth') || itemDept.includes('death'))
    ) return true;
    if (
      (target.includes('लेखा') || target.includes('वित्त') || target.includes('account') || target.includes('finance')) &&
      (itemDept.includes('लेखा') || itemDept.includes('वित्त') || itemDept.includes('account') || itemDept.includes('finance'))
    ) return true;
    if (
      (target.includes('दिव्यांग') || target.includes('अपंग') || target.includes('disab')) &&
      (itemDept.includes('दिव्यांग') || itemDept.includes('अपंग') || itemDept.includes('disab'))
    ) return true;
    if (
      (target.includes('महिला') || target.includes('बालकल्याण') || target.includes('women')) &&
      (itemDept.includes('महिला') || itemDept.includes('बालकल्याण') || itemDept.includes('women'))
    ) return true;
    if (
      (target.includes('संगणक') || target.includes('computer') || target.includes('it')) &&
      (itemDept.includes('संगणक') || itemDept.includes('computer') || itemDept.includes('it'))
    ) return true;
    if (
      (target.includes('निवडणूक') || target.includes('election')) &&
      (itemDept.includes('निवडणूक') || itemDept.includes('election'))
    ) return true;
    if (
      (target.includes('आस्थापना') || target.includes('establishment')) &&
      (itemDept.includes('आस्थापना') || itemDept.includes('establishment'))
    ) return true;
    if (
      (target.includes('सभा') || target.includes('sabha')) &&
      (itemDept.includes('सभा') || itemDept.includes('sabha'))
    ) return true;
    if (
      (target.includes('अभिलेख') || target.includes('record')) &&
      (itemDept.includes('अभिलेख') || itemDept.includes('record'))
    ) return true;

    // If an explicit department was set and is not a generic fallback, respect the assigned department!
    const isGenericDept =
      itemDept === 'सामान्य प्रशासन' ||
      itemDept === 'सामान्य प्रशासन / इतर' ||
      itemDept === 'general' ||
      itemDept === 'general administration / other' ||
      itemDept === 'other';
    if (!isGenericDept) {
      return false;
    }
  }

  // Fallback for unassigned or generic records based on application type or description:
  const itemDesc = (c.description || '').toLowerCase();
  const itemType = (c.type || '').toLowerCase();

  if (itemType.includes(target) || target.includes(itemType)) return true;
  if (itemDesc.includes(target)) return true;

  // Schemes & Yojna matching (PMAY, Swachh Bharat, AMRUT, etc.)
  if (target.includes('pmay') || target.includes('आवास') || target.includes('घरकुल')) {
    return itemDesc.includes('pmay') || itemDesc.includes('आवास') || itemDesc.includes('घरकुल') || itemType.includes('pmay') || itemType.includes('आवास');
  }
  if (target.includes('स्वच्छ') || target.includes('शौचालय') || target.includes('swachh')) {
    return itemDesc.includes('शौचालय') || itemType.includes('शौचालय') || itemDesc.includes('स्वच्छ') || itemDept.includes('आरोग्य');
  }
  if (target.includes('अमृत') || target.includes('amrut')) {
    return itemDesc.includes('अमृत') || itemDesc.includes('amrut') || itemType.includes('अमृत');
  }
  if (target.includes('निराधार') || target.includes('संजय गांधी')) {
    return itemDesc.includes('निराधार') || itemDesc.includes('संजय गांधी') || itemType.includes('निराधार');
  }
  if (target.includes('श्रावणबाळ')) {
    return itemDesc.includes('श्रावणबाळ') || itemType.includes('श्रावणबाळ');
  }
  if (target.includes('दिव्यांग') || target.includes('अपंग')) {
    return itemDesc.includes('दिव्यांग') || itemDesc.includes('अपंग') || itemType.includes('दिव्यांग');
  }
  if (target.includes('महिला') || target.includes('बालकल्याण')) {
    return itemDesc.includes('महिला') || itemDesc.includes('बालकल्याण') || itemType.includes('महिला');
  }
  if (target.includes('स्वनिधी') || target.includes('फेरीवाला') || target.includes('svanidhi')) {
    return itemDesc.includes('स्वनिधी') || itemDesc.includes('फेरीवाला') || itemType.includes('स्वनिधी');
  }

  // Certificates & Specific Applications
  if (target.includes('जन्म') || target.includes('birth')) {
    return itemDesc.includes('जन्म') || itemType.includes('जन्म');
  }
  if (target.includes('मृत्यू') || target.includes('death')) {
    return itemDesc.includes('मृत्यू') || itemType.includes('मृत्यू');
  }
  if (target.includes('विवाह') || target.includes('marriage')) {
    return itemDesc.includes('विवाह') || itemType.includes('विवाह');
  }
  if (target.includes('बांधकाम') || target.includes('नकाशा') || target.includes('permit') || target.includes('रस्ते')) {
    return itemType.includes('रस्ता') || itemType.includes('खड्डे') || itemDesc.includes('बांधकाम') || itemDesc.includes('नकाशा');
  }
  if (target.includes('परवाना') || target.includes('license') || target.includes('trade')) {
    return itemDesc.includes('परवाना') || itemType.includes('परवाना') || itemDesc.includes('व्यवसाय');
  }
  if (target.includes('ना हरकत') || target.includes('noc')) {
    return itemDesc.includes('ना हरकत') || itemDesc.includes('noc') || itemType.includes('noc');
  }

  if (target.includes('सांडपाणी') || target.includes('गटार') || target.includes('drainage')) {
    return itemType.includes('गटार') || itemDesc.includes('सांडपाणी') || itemDesc.includes('गटार');
  }
  if (target.includes('पाणी') || target.includes('water')) {
    return itemType.includes('पाणी') || itemType.includes('नळ') || itemDesc.includes('नळ');
  }
  if (target.includes('आरोग्य') || target.includes('स्वच्छता') || target.includes('health') || target.includes('sanitation')) {
    return itemDesc.includes('कचरा') || itemType.includes('कचरा') || itemDesc.includes('स्वच्छता');
  }
  if (target.includes('विद्युत') || target.includes('दिवाबत्ती') || target.includes('electrical')) {
    return itemType.includes('पथदिवे') || itemType.includes('लाईट');
  }
  if (target.includes('दाखले') || target.includes('लोकसेवा') || target.includes('हक्क') || target.includes('certificate')) {
    return itemType.includes('दाखला') || itemType.includes('प्रमाणपत्र');
  }
  if (target.includes('कर') || target.includes('tax') || target.includes('मालमत्ता')) {
    return itemType.includes('कर') || itemDesc.includes('मालमत्ता');
  }
  if (target.includes('सांडपाणी') || target.includes('गटार') || target.includes('drainage')) {
    return itemType.includes('गटार');
  }
  if (target.includes('अतिक्रमण') || target.includes('encroach')) {
    return itemType.includes('अतिक्रमण');
  }
  if (target.includes('नगररचना') || target.includes('town')) {
    return itemType.includes('नगररचना') || itemDesc.includes('नगररचना');
  }
  if (target.includes('अग्निशमन') || target.includes('fire')) {
    return itemType.includes('अग्निशमन');
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
        ward: data.ward || 'माहिती नाही',
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

    const attachments = Array.isArray(complaint.attachments) ? complaint.attachments : [];
    const resolutionProof = attachments.find((a: any) => a.type === 'resolution_proof') || null;
    const citizenAttachments = attachments.filter((a: any) => a.type !== 'resolution_proof');

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
      attachments: citizenAttachments,
      resolutionProof,
    };
  }

  async trackByMobile(mobile: string) {
    const cleaned = (mobile || '').replace(/\D/g, '');
    if (cleaned.length !== 10) {
      throw new BadRequestException('कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.');
    }

    const complaints = await this.prisma.complaint.findMany({
      where: { mobile: cleaned },
      orderBy: { createdAt: 'desc' },
    });

    return complaints.map((complaint) => {
      const attachments = Array.isArray(complaint.attachments) ? complaint.attachments : [];
      const resolutionProof = attachments.find((a: any) => a.type === 'resolution_proof') || null;
      const citizenAttachments = attachments.filter((a: any) => a.type !== 'resolution_proof');
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
        attachments: citizenAttachments,
        resolutionProof,
      };
    });
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

    // Nagarsevak (Ward Representative) restriction:
    if (currentUser && currentUser.role === 'NAGARSEVAK') {
      const userWard = currentUser.ward;
      if (isUnknownWard(userWard)) {
        // Unassigned / Don't know ward representative: views complaints with unknown ward to assign them
        filtered = filtered.filter((c) => isUnknownWard(c.ward));
      } else {
        // Regular Nagarsevak: views complaints belonging to their assigned ward
        filtered = filtered.filter((c) => matchesWard(c.ward, userWard));
      }
    }

    // Specific Department filter requested from frontend filter dropdown
    if (department && department !== 'all' && department !== 'सर्व') {
      filtered = filtered.filter((c) => matchesDepartment(c, department));
    }

    return filtered.map((c) => {
      const attachments = Array.isArray(c.attachments) ? c.attachments : [];
      const resolutionProof = attachments.find((a: any) => a.type === 'resolution_proof') || null;
      const citizenAttachments = attachments.filter((a: any) => a.type !== 'resolution_proof');
      return {
        ...c,
        attachments: citizenAttachments,
        resolutionProof,
      };
    });
  }

  async updateStatus(
    id: string,
    updateData: { status: string; resolutionProofUrl?: string; resolutionProofNotes?: string },
    currentUser?: any,
  ) {
    const validStatuses = ['pending', 'in-progress', 'resolved'];
    if (!updateData || !validStatuses.includes(updateData.status)) {
      throw new BadRequestException(`अवैध स्थिती मूल्य (Invalid status). Allowed: ${validStatuses.join(', ')}`);
    }

    const existing = await this.prisma.complaint.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');

    // Nagarsevak role has read-only access to complaints
    if (currentUser && currentUser.role === 'NAGARSEVAK') {
      throw new ForbiddenException('नगरसेवकांना तक्रार स्थिती बदलण्याची परवानगी नाही. (Nagarsevaks have read-only access).');
    }

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

    let updatedAttachments: any[] = Array.isArray(existing.attachments) ? [...existing.attachments] : [];

    if (updateData.status === 'resolved' && updateData.resolutionProofUrl) {
      const proofItem = {
        type: 'resolution_proof',
        url: updateData.resolutionProofUrl,
        name: 'काम पूर्ण झाल्याचा पुरावा (Resolution Proof)',
        resolvedBy: currentUser?.name || 'Department Officer',
        resolvedAt: new Date().toISOString(),
        notes: updateData.resolutionProofNotes || '',
      };
      updatedAttachments = [...updatedAttachments.filter((a: any) => a.type !== 'resolution_proof'), proofItem];
    }

    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        status: updateData.status,
        attachments: updatedAttachments,
      },
    });

    const isApp = existing.type === 'service_request' || (existing.description && existing.description.includes('अर्ज'));
    try {
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
          hasResolutionProof: !!updateData.resolutionProofUrl,
        },
      });
    } catch { /* non-critical */ }

    const attachments = Array.isArray(updated.attachments) ? updated.attachments : [];
    const resolutionProof = attachments.find((a: any) => a.type === 'resolution_proof') || null;
    const citizenAttachments = attachments.filter((a: any) => a.type !== 'resolution_proof');

    return {
      ...updated,
      attachments: citizenAttachments,
      resolutionProof,
    };
  }

  async updateDepartment(
    id: string,
    department: string,
    currentUser?: any,
  ) {
    if (!department || typeof department !== 'string' || !department.trim()) {
      throw new BadRequestException('विभाग नाव आवश्यक आहे (Department name is required).');
    }

    const trimmedDept = department.trim();
    const existing = await this.prisma.complaint.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');

    // Nagarsevak role has read-only access to complaints
    if (currentUser && currentUser.role === 'NAGARSEVAK') {
      throw new ForbiddenException('नगरसेवकांना तक्रार स्थिती बदलण्याची परवानगी नाही. (Nagarsevaks have read-only access).');
    }

    // IDOR / BOLA Prevention: Verify Department Officer has permission
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
          'तुम्हाला केवळ तुमच्या नियुक्त विभागाच्या तक्रारी दुसऱ्या विभागाकडे वर्ग करण्याची परवानगी आहे (Access denied).',
        );
      }
    }

    const previousDept = existing.department;
    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        department: trimmedDept,
      },
    });

    const isApp = existing.type === 'service_request' || (existing.description && existing.description.includes('अर्ज'));
    try {
      await this.auditLogsService.logAction({
        adminId: currentUser?.id,
        adminEmail: currentUser?.email,
        adminName: currentUser?.name,
        action: 'REASSIGN_DEPARTMENT',
        resource: isApp ? 'APPLICATIONS' : 'COMPLAINTS',
        resourceId: id,
        details: {
          trackingId: existing.trackingId,
          previousDepartment: previousDept,
          newDepartment: trimmedDept,
          citizenName: existing.name,
        },
      });
    } catch { /* non-critical */ }

    const attachments = Array.isArray(updated.attachments) ? updated.attachments : [];
    const resolutionProof = attachments.find((a: any) => a.type === 'resolution_proof') || null;
    const citizenAttachments = attachments.filter((a: any) => a.type !== 'resolution_proof');

    return {
      ...updated,
      attachments: citizenAttachments,
      resolutionProof,
    };
  }

  async updateWard(
    id: string,
    ward: string,
    currentUser?: any,
  ) {
    if (!ward || typeof ward !== 'string' || !ward.trim()) {
      throw new BadRequestException('वॉर्ड / प्रभाग क्रमांक आवश्यक आहे (Ward is required).');
    }

    const trimmedWard = ward.trim();
    const existing = await this.prisma.complaint.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');

    // IDOR / RBAC check:
    if (currentUser && currentUser.role === 'NAGARSEVAK') {
      if (!isUnknownWard(currentUser.ward)) {
        throw new ForbiddenException('केवळ अज्ञात वॉर्ड कक्षाचे प्रतिनिधी किंवा प्रशासकीय अधिकारी वॉर्ड बदलू शकतात.');
      }
    }

    const previousWard = existing.ward;
    const updated = await this.prisma.complaint.update({
      where: { id },
      data: {
        ward: trimmedWard,
      },
    });

    const isApp = existing.type === 'service_request' || (existing.description && existing.description.includes('अर्ज'));
    try {
      await this.auditLogsService.logAction({
        adminId: currentUser?.id,
        adminEmail: currentUser?.email,
        adminName: currentUser?.name,
        action: 'UPDATE_WARD',
        resource: isApp ? 'APPLICATIONS' : 'COMPLAINTS',
        resourceId: id,
        details: {
          trackingId: existing.trackingId,
          previousWard,
          newWard: trimmedWard,
          citizenName: existing.name,
        },
      });
    } catch { /* non-critical */ }

    const attachments = Array.isArray(updated.attachments) ? updated.attachments : [];
    const resolutionProof = attachments.find((a: any) => a.type === 'resolution_proof') || null;
    const citizenAttachments = attachments.filter((a: any) => a.type !== 'resolution_proof');

    return {
      ...updated,
      attachments: citizenAttachments,
      resolutionProof,
    };
  }

  async deleteGrievance(id: string, currentUser?: any) {
    // Only Super Admin can delete complaints / applications permanently
    if (currentUser && currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('केवळ सुपर ॲडमिनला तक्रारी/अर्ज हटवण्याची परवानगी आहे (Only Super Admin can delete records).');
    }

    const existing = await this.prisma.complaint.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Complaint not found');

    // Nagarsevak role has read-only access to complaints
    if (currentUser && currentUser.role === 'NAGARSEVAK') {
      throw new ForbiddenException('नगरसेवकांना तक्रार स्थिती बदलण्याची परवानगी नाही. (Nagarsevaks have read-only access).');
    }

    const isApp = existing.type === 'service_request' || (existing.description && existing.description.includes('अर्ज'));
    try {
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
    } catch { /* non-critical */ }

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
