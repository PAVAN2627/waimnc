import * as api from "./api";

export type MeetingState = "upcoming" | "previous";
export type SabhaCategory = "sarvasadharan" | "vishesh" | "sthayi_samiti";

export interface SabhaRecord {
  id: string;
  type: MeetingState;
  sabhaType: SabhaCategory;
  year?: number;
  tharavNumber?: string;
  titleMr: string;
  titleEn: string;
  date: string;
  time: string;
  videoUrl: string;      // live stream or recording URL
  minutesBase64: string; // PDF URL for minutes / tharav download
  minutesName: string;
  status: "active" | "inactive";
  createdAt: number;
}

export const SABHA_CATEGORIES: { key: SabhaCategory; labelMr: string; labelEn: string; badgeClass: string }[] = [
  { key: "sarvasadharan", labelMr: "सर्वसाधारण सभा", labelEn: "General Body Meeting", badgeClass: "bg-blue-100 text-blue-800 border-blue-300" },
  { key: "vishesh", labelMr: "विशेष सभा", labelEn: "Special Meeting", badgeClass: "bg-purple-100 text-purple-800 border-purple-300" },
  { key: "sthayi_samiti", labelMr: "स्थायी समिती सभा", labelEn: "Standing Committee Meeting", badgeClass: "bg-amber-100 text-amber-800 border-amber-300" },
];

export function sortSabhaNewestFirst(items: SabhaRecord[]): SabhaRecord[] {
  return [...items].sort((a, b) => {
    const da = a.date ? `${a.date} ${a.time || "00:00"}` : "";
    const db = b.date ? `${b.date} ${b.time || "00:00"}` : "";
    const timeA = da ? Date.parse(da) || a.createdAt || 0 : a.createdAt || 0;
    const timeB = db ? Date.parse(db) || b.createdAt || 0 : b.createdAt || 0;
    return timeB - timeA;
  });
}

export const isFirebaseConfigured = true;

function mapSabha(item: any): SabhaRecord {
  let year = item.year;
  if (!year && item.date) {
    const match = item.date.match(/^(\d{4})/);
    if (match) year = parseInt(match[1], 10);
  }
  return {
    id: item.id,
    type: (item.type as MeetingState) || "upcoming",
    sabhaType: (item.sabhaType as SabhaCategory) || "sarvasadharan",
    year: year || new Date().getFullYear(),
    tharavNumber: item.tharavNumber || "",
    titleMr: item.titleMr || "",
    titleEn: item.titleEn || item.titleMr || "",
    date: item.date || "",
    time: item.time || "",
    videoUrl: item.videoUrl || "",
    minutesBase64: item.minutesUrl || "",
    minutesName: item.minutesName || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
  };
}

export function subscribeToSabha(cb: (items: SabhaRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchPublicSabha()
    .then((items) => {
      if (isMounted) cb(sortSabhaNewestFirst(items.map(mapSabha)));
    })
    .catch((err) => console.error("Failed to load sabha from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveSabha(cb: (items: SabhaRecord[]) => void): () => void {
  return subscribeToSabha((items) => cb(sortSabhaNewestFirst(items.filter((s) => s.status === "active"))));
}
