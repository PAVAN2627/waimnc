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

export const isFirebaseConfigured = true;

function mapNotice(item: any): NoticeRecord {
  return {
    id: item.id,
    title: item.title || "",
    titleEn: item.titleEn || item.title || "",
    content: item.content || "",
    contentEn: item.contentEn || item.content || "",
    tag: item.tag || "सामान्य",
    tagEn: item.tagEn || item.tag || "General",
    externalUrl: item.externalUrl || item.documentUrl || "",
    attachmentBase64: "",
    attachmentName: item.title || "document",
    attachmentType: item.documentUrl ? "pdf" : "text",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
  };
}

export function subscribeToPublicNotices(callback: (notices: NoticeRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchPublicNotices()
    .then((items) => {
      if (isMounted) callback(items.map(mapNotice));
    })
    .catch((err) => console.error("Failed to load public notices from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export const subscribeToAllNotices = subscribeToPublicNotices;
export const subscribeToActiveNotices = subscribeToPublicNotices;

export function formatNoticeDate(timestamp: number, locale: "mr" | "en") {
  return new Date(timestamp).toLocaleDateString(locale === "mr" ? "mr-IN" : "en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
