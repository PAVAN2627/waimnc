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

export function subscribeToPublicNews(callback: (news: NewsRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchPublicNews()
    .then((items) => {
      if (isMounted) callback(items.map(mapNews));
    })
    .catch((err) => console.error("Failed to load public news from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export const subscribeToAllNews = subscribeToPublicNews;
export const subscribeToActiveNews = subscribeToPublicNews;
