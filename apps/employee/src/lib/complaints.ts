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

export interface ResolutionProof {
  url: string;
  name?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
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
  resolutionProof?: ResolutionProof | null;
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

export function matchesEmployeeDepartment(
  record: { department?: string; type?: string; description?: string },
  userDepts: string[]
): boolean {
  if (!userDepts || userDepts.length === 0) return true;
  return userDepts.some((dept) => {
    const target = dept.toLowerCase().trim();
    const itemDept = (record.department || "").toLowerCase().trim();
    const itemDesc = (record.description || "").toLowerCase();
    const itemType = (record.type || "").toLowerCase();

    if (itemDept.includes(target) || target.includes(itemDept)) return true;
    if (itemType.includes(target) || target.includes(itemType)) return true;
    if (itemDesc.includes(target)) return true;

    // Schemes & Yojna matching (PMAY, Swachh Bharat, AMRUT, etc.)
    if (target.includes("pmay") || target.includes("आवास") || target.includes("घरकुल")) {
      return (
        itemDesc.includes("pmay") ||
        itemDesc.includes("आवास") ||
        itemDesc.includes("घरकुल") ||
        itemType.includes("pmay") ||
        itemType.includes("आवास")
      );
    }
    if (target.includes("स्वच्छ") || target.includes("शौचालय") || target.includes("swachh")) {
      return (
        itemDesc.includes("शौचालय") ||
        itemType.includes("शौचालय") ||
        itemDesc.includes("स्वच्छ") ||
        itemDept.includes("आरोग्य")
      );
    }
    if (target.includes("अमृत") || target.includes("amrut")) {
      return itemDesc.includes("अमृत") || itemDesc.includes("amrut") || itemType.includes("अमृत");
    }
    if (target.includes("निराधार") || target.includes("संजय गांधी")) {
      return itemDesc.includes("निराधार") || itemDesc.includes("संजय गांधी") || itemType.includes("निराधार");
    }
    if (target.includes("श्रावणबाळ")) {
      return itemDesc.includes("श्रावणबाळ") || itemType.includes("श्रावणबाळ");
    }
    if (target.includes("दिव्यांग") || target.includes("अपंग")) {
      return itemDesc.includes("दिव्यांग") || itemDesc.includes("अपंग") || itemType.includes("दिव्यांग");
    }
    if (target.includes("महिला") || target.includes("बालकल्याण")) {
      return itemDesc.includes("महिला") || itemDesc.includes("बालकल्याण") || itemType.includes("महिला");
    }
    if (target.includes("स्वनिधी") || target.includes("फेरीवाला") || target.includes("svanidhi")) {
      return itemDesc.includes("स्वनिधी") || itemDesc.includes("फेरीवाला") || itemType.includes("स्वनिधी");
    }

    // Certificates & Specific Applications
    if (target.includes("जन्म") || target.includes("birth")) {
      return itemDept.includes("जन्म") || itemDesc.includes("जन्म") || itemType.includes("जन्म");
    }
    if (target.includes("मृत्यू") || target.includes("death")) {
      return itemDept.includes("मृत्यू") || itemDesc.includes("मृत्यू") || itemType.includes("मृत्यू");
    }
    if (target.includes("विवाह") || target.includes("marriage")) {
      return itemDept.includes("विवाह") || itemDesc.includes("विवाह") || itemType.includes("विवाह");
    }
    if (
      target.includes("बांधकाम") ||
      target.includes("नकाशा") ||
      target.includes("permit") ||
      target.includes("रस्ते") ||
      target.includes("civil") ||
      target.includes("road")
    ) {
      return (
        itemDept.includes("बांधकाम") ||
        itemDept.includes("रस्ते") ||
        itemType.includes("रस्ता") ||
        itemType.includes("खड्डे") ||
        itemDesc.includes("बांधकाम") ||
        itemDesc.includes("नकाशा") ||
        itemDesc.includes("रस्ता")
      );
    }
    if (target.includes("परवाना") || target.includes("license") || target.includes("trade")) {
      return itemDesc.includes("परवाना") || itemType.includes("परवाना") || itemDesc.includes("व्यवसाय");
    }
    if (target.includes("ना हरकत") || target.includes("noc")) {
      return itemDesc.includes("ना हरकत") || itemDesc.includes("noc") || itemType.includes("noc");
    }

    if (target.includes("पाणी") || target.includes("water")) {
      return (
        itemDept.includes("पाणी") ||
        itemDept.includes("water") ||
        itemType.includes("पाणी") ||
        itemType.includes("नळ") ||
        itemDesc.includes("पाणी") ||
        itemDesc.includes("नळ")
      );
    }
    if (
      target.includes("आरोग्य") ||
      target.includes("स्वच्छता") ||
      target.includes("health") ||
      target.includes("sanitation")
    ) {
      return (
        itemDept.includes("आरोग्य") ||
        itemDept.includes("स्वच्छता") ||
        itemDept.includes("कचरा") ||
        itemType.includes("कचरा") ||
        itemDesc.includes("कचरा")
      );
    }
    if (
      target.includes("विद्युत") ||
      target.includes("दिवाबत्ती") ||
      target.includes("electrical")
    ) {
      return (
        itemDept.includes("विद्युत") ||
        itemDept.includes("दिवाबत्ती") ||
        itemType.includes("पथदिवे") ||
        itemType.includes("लाईट") ||
        itemDesc.includes("लाईट")
      );
    }
    if (
      target.includes("दाखले") ||
      target.includes("लोकसेवा") ||
      target.includes("हक्क") ||
      target.includes("certificate")
    ) {
      return (
        itemDept.includes("लोकसेवा") ||
        itemDept.includes("दाखले") ||
        itemType.includes("दाखला") ||
        itemType.includes("प्रमाणपत्र") ||
        itemDesc.includes("दाखला")
      );
    }
    if (target.includes("कर") || target.includes("tax") || target.includes("मालमत्ता")) {
      return (
        itemDept.includes("कर") ||
        itemDept.includes("मूल्यांकन") ||
        itemType.includes("कर") ||
        itemDesc.includes("कर") ||
        itemDesc.includes("मालमत्ता")
      );
    }
    if (
      target.includes("सांडपाणी") ||
      target.includes("गटार") ||
      target.includes("drainage")
    ) {
      return (
        itemDept.includes("सांडपाणी") ||
        itemDept.includes("गटार") ||
        itemType.includes("गटार") ||
        itemDesc.includes("गटार")
      );
    }
    if (target.includes("अतिक्रमण") || target.includes("encroach")) {
      return itemDept.includes("अतिक्रमण") || itemType.includes("अतिक्रमण");
    }
    if (target.includes("नगररचना") || target.includes("town")) {
      return itemDept.includes("नगररचना") || itemType.includes("नगररचना");
    }
    if (target.includes("अग्निशमन") || target.includes("fire")) {
      return itemDept.includes("अग्निशमन") || itemType.includes("अग्निशमन");
    }
    return false;
  });
}

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
    resolutionProof: item.resolutionProof || (Array.isArray(item.attachments) ? item.attachments.find((a: any) => a.type === "resolution_proof") : null) || null,
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

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  resolutionProofUrl?: string,
  resolutionProofNotes?: string,
): Promise<void> {
  await api.updateComplaintStatus(id, status, resolutionProofUrl, resolutionProofNotes);
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
