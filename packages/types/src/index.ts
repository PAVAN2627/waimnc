export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  department?: string | null;
  departments?: string[];
  ward?: string | null;
  accessScope?: string | null;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface MunicipalWard {
  value: string;
  labelMr: string;
  labelEn: string;
}

export const MUNICIPAL_WARDS: MunicipalWard[] = [
  { value: "१(अ)", labelMr: "प्रभाग १(अ)", labelEn: "Ward 1(A)" },
  { value: "१(ब)", labelMr: "प्रभाग १(ब)", labelEn: "Ward 1(B)" },
  { value: "२(अ)", labelMr: "प्रभाग २(अ)", labelEn: "Ward 2(A)" },
  { value: "२(ब)", labelMr: "प्रभाग २(ब)", labelEn: "Ward 2(B)" },
  { value: "३(अ)", labelMr: "प्रभाग ३(अ)", labelEn: "Ward 3(A)" },
  { value: "३(ब)", labelMr: "प्रभाग ३(ब)", labelEn: "Ward 3(B)" },
  { value: "४(अ)", labelMr: "प्रभाग ४(अ)", labelEn: "Ward 4(A)" },
  { value: "४(ब)", labelMr: "प्रभाग ४(ब)", labelEn: "Ward 4(B)" },
  { value: "५(अ)", labelMr: "प्रभाग ५(अ)", labelEn: "Ward 5(A)" },
  { value: "५(ब)", labelMr: "प्रभाग ५(ब)", labelEn: "Ward 5(B)" },
  { value: "६(अ)", labelMr: "प्रभाग ६(अ)", labelEn: "Ward 6(A)" },
  { value: "६(ब)", labelMr: "प्रभाग ६(ब)", labelEn: "Ward 6(B)" },
  { value: "७(अ)", labelMr: "प्रभाग ७(अ)", labelEn: "Ward 7(A)" },
  { value: "७(ब)", labelMr: "प्रभाग ७(ब)", labelEn: "Ward 7(B)" },
  { value: "८(अ)", labelMr: "प्रभाग ८(अ)", labelEn: "Ward 8(A)" },
  { value: "८(ब)", labelMr: "प्रभाग ८(ब)", labelEn: "Ward 8(B)" },
  { value: "९(अ)", labelMr: "प्रभाग ९(अ)", labelEn: "Ward 9(A)" },
  { value: "९(ब)", labelMr: "प्रभाग ९(ब)", labelEn: "Ward 9(B)" },
  { value: "१०(अ)", labelMr: "प्रभाग १०(अ)", labelEn: "Ward 10(A)" },
  { value: "१०(ब)", labelMr: "प्रभाग १०(ब)", labelEn: "Ward 10(B)" },
  { value: "११(अ)", labelMr: "प्रभाग ११(अ)", labelEn: "Ward 11(A)" },
  { value: "११(ब)", labelMr: "प्रभाग ११(ब)", labelEn: "Ward 11(B)" },
  { value: "११(क)", labelMr: "प्रभाग ११(क)", labelEn: "Ward 11(C)" },
  { value: "माहिती नाही", labelMr: "माहिती नाही / अज्ञात प्रभाग", labelEn: "Don't know / Unknown Ward" },
];

export function isUnknownWard(ward?: string | null): boolean {
  if (!ward) return true;
  const w = ward.trim().toLowerCase();
  return (
    w === "" ||
    w === "general" ||
    w === "none" ||
    w === "unknown" ||
    w === "dont_know" ||
    w === "0" ||
    w.includes("माहिती नाही") ||
    w.includes("अज्ञात") ||
    w.includes("dont know")
  );
}

export function matchesWard(itemWard?: string | null, targetWard?: string | null): boolean {
  if (!itemWard || !targetWard) return false;
  const w1 = itemWard.trim();
  const w2 = targetWard.trim();
  if (w1 === w2) return true;
  // case-insensitive exact
  if (w1.toLowerCase() === w2.toLowerCase()) return true;
  // substring match (e.g. "प्रभाग १(अ)" contains "१(अ)")
  if (w1.includes(w2) || w2.includes(w1)) return true;
  return false;
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

export interface ResolutionProof {
  url: string;
  name?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

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
  resolutionProof?: ResolutionProof | null;
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

