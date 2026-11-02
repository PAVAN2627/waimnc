import * as api from "./api";

export type ComplaintStatus = "pending" | "in-progress" | "resolved";
export type ComplaintAttachmentType = "image" | "pdf" | "file";

export interface ComplaintAttachment {
  name: string;
  mimeType: string;
  type: ComplaintAttachmentType;
  base64: string;
  url?: string;
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
  ward?: string;
  type: string;
  department: string;
  description: string;
  files?: File[];
  driveUrl?: string;
}

export const isFirebaseConfigured = true;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function detectAttachmentType(file: File): ComplaintAttachmentType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return "file";
}

function mapComplaint(item: any): ComplaintRecord {
  return {
    id: item.id,
    trackingId: item.trackingId || `TK-${item.id.slice(-6).toUpperCase()}`,
    name: item.name || item.maskedMobile || "",
    mobile: item.mobile || item.maskedMobile || "",
    ward: item.ward || "",
    type: item.type || "",
    department: item.department || "",
    description: item.description || "",
    attachments: Array.isArray(item.attachments) ? item.attachments.map(normalizeAttachment) : [],
    status: (item.status as ComplaintStatus) || "pending",
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
  };
}

export async function createComplaint(input: CreateComplaintInput): Promise<ComplaintRecord> {
  const attachments: ComplaintAttachment[] = [];
  if (input.files?.length) {
    for (const file of input.files) {
      if (file.size <= 10 * 1024 * 1024) {
        try {
          const uploaded = await api.uploadGrievanceMedia(file);
          attachments.push({
            name: file.name,
            mimeType: file.type,
            type: detectAttachmentType(file),
            base64: uploaded.viewUrl, // Stored as Vercel Blob streaming URL
          });
        } catch (err) {
          console.warn("Direct Vercel Blob upload fallback:", err);
          const base64 = await fileToBase64(file);
          attachments.push({
            name: file.name,
            mimeType: file.type,
            type: detectAttachmentType(file),
            base64,
          });
        }
      }
    }
  }

  if (input.driveUrl && input.driveUrl.trim()) {
    attachments.push({
      name: "गुगल ड्राईव्ह दस्तऐवज (Drive Link)",
      mimeType: "application/pdf",
      type: "pdf",
      base64: input.driveUrl.trim(),
      url: input.driveUrl.trim(),
    });
  }

  const res = await api.submitComplaint({
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    ward: (input.ward || "General").trim(),
    type: input.type.trim(),
    department: input.department.trim(),
    description: input.description.trim(),
    attachments,
  });

  return mapComplaint(res);
}

export async function getComplaintByTrackingId(
  trackingId: string,
  mobile: string
): Promise<ComplaintRecord | null> {
  try {
    const res = await api.trackComplaint(trackingId, mobile);
    if (!res) return null;
    return mapComplaint(res);
  } catch (err) {
    console.warn("Track complaint error:", err);
    return null;
  }
}

export function formatComplaintDate(timestamp: number, locale: "mr" | "en") {
  return new Date(timestamp).toLocaleDateString(
    locale === "mr" ? "mr-IN" : "en-IN",
    { day: "2-digit", month: "long", year: "numeric" }
  );
}
