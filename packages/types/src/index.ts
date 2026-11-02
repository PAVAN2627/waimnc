export interface AdminUser {
  id: string;
  name: string;
  email: string;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Official {
  id: string;
  nameMr: string;
  nameEn: string;
  designationMr: string;
  designationEn: string;
  wardNumber?: string;
  addressMr?: string;
  addressEn?: string;
  partyMr?: string;
  partyEn?: string;
  phone?: string;
  photoUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type TenderStatus = 'ACTIVE' | 'ARCHIVED' | 'CORRIGENDUM' | 'CLOSED';

export interface Tender {
  id: string;
  tenderNumber: string;
  titleMr: string;
  titleEn: string;
  department: string;
  category: string;
  estimatedCost?: number;
  tenderFee?: number;
  emdAmount?: number;
  publishDate: string;
  submissionEndDate: string;
  openingDate?: string;
  documentUrl: string;
  status: TenderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notice {
  id: string;
  title: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  tag?: string;
  tagEn?: string;
  externalUrl?: string;
  documentUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  id: string;
  titleMr: string;
  titleEn?: string;
  descMr?: string;
  descEn?: string;
  progress: number;
  iconName?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved';

export interface Complaint {
  id: string;
  trackingId?: string;
  name: string;
  mobile: string;
  ward: string;
  type: string;
  department: string;
  description: string;
  status: ComplaintStatus;
  attachments?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  activeNotices: number;
  ongoingProjects: number;
  recentComplaints: Complaint[];
}

export interface R2PresignedUrlRequest {
  filename: string;
  mimeType: string;
  folder: 'tenders' | 'officials' | 'notices' | 'complaints' | 'projects' | 'gallery';
}

export interface R2PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

/**
 * Mobile Number Validator for Indian 10-digit mobile numbers.
 * Strictly prevents fake numbers such as 9999999999, 0000000000, 1234567890, etc.
 */
export function isFakeMobile(mobile: string | undefined | null): boolean {
  if (!mobile) return true;
  const cleaned = String(mobile).replace(/\D/g, "");
  // Must be exactly 10 digits
  if (cleaned.length !== 10) return true;
  // Indian mobile numbers strictly start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(cleaned)) return true;
  // 10 identical digits in a row (e.g. 9999999999, 8888888888, 7777777777, 6666666666)
  if (/^(\d)\1{9}$/.test(cleaned)) return true;
  // Only 1 unique digit
  if (new Set(cleaned).size <= 1) return true;
  // 8 or more of the same digit in the 10-digit sequence (e.g. 9999999901, 9000000000)
  const counts: Record<string, number> = {};
  for (const ch of cleaned) {
    counts[ch] = (counts[ch] || 0) + 1;
  }
  if (Object.values(counts).some((count) => count >= 8)) return true;

  // Known dummy test numbers
  const dummyList = new Set([
    "1234567890",
    "0123456789",
    "9876543210",
    "0987654321",
    "9898989898",
    "9090909090",
    "9191919191",
    "9797979797",
    "9696969696",
    "9595959595",
    "9123456789",
    "9812345678",
    "9012345678",
    "9000000000",
    "9999900000",
  ]);
  if (dummyList.has(cleaned)) return true;

  return false;
}

export function isValidIndianMobile(mobile: string | undefined | null): boolean {
  return !isFakeMobile(mobile);
}

