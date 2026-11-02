import * as api from "./api";

export interface NewsRecord {
  id: string;
  title: string;
  titleEn: string;
  date: string;
  dateEn: string;
  tag: string;
  tagEn: string;
  externalUrl: string;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
}

export interface CreateNewsInput {
  title: string;
  titleEn?: string;
  date?: string;
  dateEn?: string;
  tag?: string;
  tagEn?: string;
  externalUrl?: string;
}

export const isFirebaseConfigured = true;

function mapNews(item: any): NewsRecord {
  return {
    id: item.id,
    title: item.title || "",
    titleEn: item.titleEn || item.title || "",
    date: item.date || "",
    dateEn: item.dateEn || item.date || "",
    tag: item.tag || "बातमी",
    tagEn: item.tagEn || item.tag || "News",
    externalUrl: item.externalUrl || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
  };
}

export function subscribeToAllNews(callback: (news: NewsRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchAdminNews()
    .then((items) => {
      if (isMounted) callback(items.map(mapNews));
    })
    .catch((err) => console.error("Failed to load news from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export async function createNews(input: CreateNewsInput): Promise<NewsRecord> {
  const res = await api.createNews({
    title: input.title.trim(),
    titleEn: input.titleEn?.trim() || null,
    date: input.date?.trim() || null,
    dateEn: input.dateEn?.trim() || null,
    tag: input.tag?.trim() || "बातमी",
    tagEn: input.tagEn?.trim() || "News",
    externalUrl: input.externalUrl?.trim() || null,
    status: "active",
  });
  return mapNews(res);
}

export async function updateNews(id: string, updates: Partial<NewsRecord>): Promise<void> {
  await api.updateNews(id, updates);
}

export async function deleteNews(id: string): Promise<void> {
  await api.deleteNews(id);
}

export async function setNewsStatus(id: string, status: "active" | "inactive"): Promise<void> {
  await api.updateNews(id, { status });
}

export async function toggleNewsStatus(id: string, current: "active" | "inactive"): Promise<"active" | "inactive"> {
  const next: "active" | "inactive" = current === "active" ? "inactive" : "active";
  await api.updateNews(id, { status: next });
  return next;
}

export function subscribeToActiveNews(callback: (news: NewsRecord[]) => void): () => void {
  return subscribeToAllNews((news) => callback(news.filter((n) => n.status === "active")));
}
