import * as api from "./api";

export type NoticeStatus = "active" | "inactive";
export type NoticeAttachmentType = "text" | "pdf" | "image" | "file";

export interface NoticeRecord {
  id: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  tag: string;
  tagEn: string;
  externalUrl: string;
  attachmentBase64: string;
  attachmentName: string;
  attachmentType: NoticeAttachmentType;
  status: NoticeStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateNoticeInput {
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  tag?: string;
  tagEn?: string;
  externalUrl?: string;
  file?: File | null;
}

export const isFirebaseConfigured = true;

function mapNotice(item: any): NoticeRecord {
  return {
    id: item.id,
    title: item.title || "",
    titleEn: item.titleEn || item.title || "",
    content: item.content || "",
    contentEn: item.contentEn || item.content || "",
    tag: item.tag || "",
    tagEn: item.tagEn || item.tag || "",
    externalUrl: item.externalUrl || item.documentUrl || "",
    attachmentBase64: "",
    attachmentName: item.title || "document",
    attachmentType: item.documentUrl ? "pdf" : "text",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
  };
}

export function subscribeToAllNotices(callback: (notices: NoticeRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchAdminNotices()
    .then((items) => {
      if (isMounted) callback(items.map(mapNotice));
    })
    .catch((err) => console.error("Failed to load notices from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveNotices(callback: (notices: NoticeRecord[]) => void): () => void {
  return subscribeToAllNotices((notices) => callback(notices.filter((n) => n.status === "active")));
}

export async function createNotice(input: CreateNoticeInput): Promise<NoticeRecord> {
  let documentUrl: string | null = null;
  if (input.file) {
    try {
      const uploadRes = await api.uploadMedia(input.file, "notices");
      documentUrl = uploadRes.viewUrl;
    } catch (err) {
      console.warn("Failed to upload notice file to Vercel Blob:", err);
    }
  }

  const res = await api.createNotice({
    title: input.title.trim(),
    titleEn: input.titleEn?.trim() || null,
    content: input.content.trim(),
    contentEn: input.contentEn?.trim() || null,
    tag: input.tag?.trim() || null,
    tagEn: input.tagEn?.trim() || null,
    externalUrl: input.externalUrl?.trim() || null,
    documentUrl,
    status: "active",
  });
  return mapNotice(res);
}

export async function updateNotice(id: string, updates: Partial<NoticeRecord>): Promise<void> {
  await api.updateNotice(id, updates);
}

export async function deleteNotice(input: string | { id: string }): Promise<void> {
  const id = typeof input === "string" ? input : input.id;
  await api.deleteNotice(id);
}

export async function setNoticeStatus(id: string, status: NoticeStatus): Promise<void> {
  await api.updateNotice(id, { status });
}

export async function toggleNoticeStatus(id: string, current: NoticeStatus): Promise<NoticeStatus> {
  const next: NoticeStatus = current === "active" ? "inactive" : "active";
  await api.updateNotice(id, { status: next });
  return next;
}

export function formatNoticeDate(timestamp: number, locale: "mr" | "en"): string {
  return new Date(timestamp).toLocaleDateString(
    locale === "mr" ? "mr-IN" : "en-IN",
    { day: "2-digit", month: "long", year: "numeric" }
  );
}
