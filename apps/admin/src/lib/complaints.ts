import * as api from "./api";
import { isFakeMobile } from "@wmc/types";

export { isFakeMobile };

export type ComplaintStatus = "pending" | "in-progress" | "resolved";
export type ComplaintAttachmentType = "image" | "pdf" | "file";

export interface ComplaintAttachment {
  name: string;
  mimeType: string;
  type: ComplaintAttachmentType;
  base64: string;
  url?: string;
}

export function getAttachmentUrl(attachment: ComplaintAttachment | any): string {
  if (!attachment) return "";
  const raw = attachment.url || attachment.base64 || attachment.viewUrl || (typeof attachment === "string" ? attachment : "");
  if (!raw) return "";
  if (raw.startsWith("data:") || raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("blob:")) {
    return raw;
  }
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return raw.startsWith("/") ? `${origin}${raw}` : `${origin}/${raw}`;
}

export function isImageAttachment(attachment: ComplaintAttachment | any): boolean {
  if (!attachment) return false;
  if (attachment.type === "image") return true;
  if (attachment.mimeType && attachment.mimeType.startsWith("image/")) return true;
  const raw = String(attachment.url || attachment.base64 || attachment.name || "");
  return /\.(jpe?g|png|webp|gif|svg|bmp)$/i.test(raw) || raw.startsWith("data:image/");
}

export function isPdfAttachment(attachment: ComplaintAttachment | any): boolean {
  if (!attachment) return false;
  if (attachment.type === "pdf") return true;
  if (attachment.mimeType === "application/pdf") return true;
  const raw = String(attachment.url || attachment.base64 || attachment.name || "");
  return /\.pdf$/i.test(raw) || raw.startsWith("data:application/pdf");
}

export function normalizeAttachment(att: any): ComplaintAttachment {
  if (typeof att === "string") {
    const isImg = /\.(jpe?g|png|webp|gif|svg)$/i.test(att) || att.startsWith("data:image/");
    const isPdf = /\.pdf$/i.test(att) || att.startsWith("data:application/pdf");
    return {
      name: att.split("/").pop()?.split("?")[0] || "दस्तऐवज",
      mimeType: isImg ? "image/jpeg" : isPdf ? "application/pdf" : "application/octet-stream",
      type: isImg ? "image" : isPdf ? "pdf" : "file",
      url: att,
      base64: att,
    };
  }
  const fileUrl = att.url || att.base64 || att.viewUrl || att.fileUrl || "";
  const isImg = att.type === "image" || att.mimeType?.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg)$/i.test(att.name || fileUrl) || fileUrl.startsWith("data:image/");
  const isPdf = att.type === "pdf" || att.mimeType === "application/pdf" || /\.pdf$/i.test(att.name || fileUrl) || fileUrl.startsWith("data:application/pdf");
  return {
    name: att.name || "कागदपत्र / पुरावा",
    mimeType: att.mimeType || (isImg ? "image/jpeg" : isPdf ? "application/pdf" : "application/octet-stream"),
    type: isImg ? "image" : isPdf ? "pdf" : "file",
    url: fileUrl,
    base64: fileUrl,
  };
}

export function isServiceApplicationRecord(c: ComplaintRecord | any): boolean {
  if (!c || isFakeMobile(c.mobile)) return false;
  const dept = String(c.department || "").toLowerCase();
  const type = String(c.type || "").toLowerCase();
  const desc = String(c.description || "").toLowerCase();

  if (
    dept.includes("लोकसेवा") ||
    dept.includes("दाखले") ||
    dept.includes("हक्क") ||
    dept.includes("योजना") ||
    dept.includes("service") ||
    dept.includes("certificate")
  ) {
    return true;
  }

  if (
    type.includes("दाखला") ||
    type.includes("certificate") ||
    type.includes("जन्म") ||
    type.includes("मृत्यू") ||
    type.includes("परवानगी") ||
    type.includes("permit") ||
    type.includes("नळ जोडणी") ||
    type.includes("पाणी जोडणी") ||
    type.includes("कर भरणा") ||
    type.includes("फेरफार") ||
    type.includes("योजना") ||
    type.includes("scheme") ||
    type.includes("अर्ज") ||
    type.includes("application")
  ) {
    return true;
  }

  if (
    desc.includes("[जन्म दाखला") ||
    desc.includes("[मृत्यू दाखला") ||
    desc.includes("[नवीन पाणी") ||
    desc.includes("[बांधकाम परवानगी") ||
    desc.includes("[मालमत्ता कर") ||
    desc.includes("[शासकीय योजना") ||
    desc.includes("[योजना अर्ज")
  ) {
    return true;
  }

  return false;
}

export function isCivicComplaintRecord(c: ComplaintRecord | any): boolean {
  if (!c || isFakeMobile(c.mobile)) return false;
  return !isServiceApplicationRecord(c);
}

export interface ComplaintRecord {
  id: string;
  trackingId?: string;
  name: string;
  mobile: string;
  ward: string;
  type: string;
  department: string;
  description: string;
  attachments: ComplaintAttachment[];
  status: ComplaintStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateComplaintInput {
  name: string;
  mobile: string;
  ward: string;
  type: string;
  department: string;
  description: string;
  files?: File[];
}

export const isFirebaseConfigured = true;

export function mapComplaint(item: any): ComplaintRecord {
  return {
    id: item.id,
    trackingId: item.trackingId || `WMC-${item.id.slice(0, 6)}`,
    name: item.name || "नागरिक",
    mobile: item.mobile || "",
    ward: item.ward || "1",
    type: item.type || "general",
    department: item.department || "सामान्य प्रशासन",
    description: item.description || "",
    attachments: Array.isArray(item.attachments) ? item.attachments.map(normalizeAttachment) : [],
    status: (item.status as ComplaintStatus) || "pending",
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
  };
}

export function subscribeToAllComplaints(callback: (complaints: ComplaintRecord[]) => void): () => void {
  let isMounted = true;
  const load = () => {
    api.fetchAdminComplaints()
      .then((items) => {
        if (isMounted && Array.isArray(items)) callback(items.map(mapComplaint));
      })
      .catch((err) => console.error("Failed to load complaints from PostgreSQL:", err));
  };

  load();
  const interval = setInterval(load, 4000); // Auto-poll every 4s for real-time sync with website

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus): Promise<void> {
  await api.updateComplaintStatus(id, status);
}

export async function deleteComplaint(id: string): Promise<void> {
  await api.deleteComplaint(id);
}

export function formatComplaintDate(timestamp: number, locale: "mr" | "en"): string {
  return new Date(timestamp).toLocaleDateString(
    locale === "mr" ? "mr-IN" : "en-IN",
    { day: "2-digit", month: "long", year: "numeric" }
  );
}
