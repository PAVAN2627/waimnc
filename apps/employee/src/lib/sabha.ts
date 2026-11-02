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
  videoUrl: string;
  minutesBase64: string;
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
  api.fetchAdminSabha()
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

export async function createSabha(input: Omit<SabhaRecord, "id" | "createdAt">): Promise<SabhaRecord> {
  const res = await api.createSabha({
    type: input.type,
    sabhaType: input.sabhaType || "sarvasadharan",
    year: input.year,
    tharavNumber: input.tharavNumber,
    titleMr: input.titleMr,
    titleEn: input.titleEn || input.titleMr,
    date: input.date,
    time: input.time,
    videoUrl: input.videoUrl,
    minutesUrl: input.minutesBase64,
    minutesName: input.minutesName,
    status: input.status,
  });
  return mapSabha(res);
}

export async function updateSabha(id: string, updates: Partial<SabhaRecord>): Promise<void> {
  await api.updateSabha(id, {
    ...(updates.type ? { type: updates.type } : {}),
    ...(updates.sabhaType ? { sabhaType: updates.sabhaType } : {}),
    ...(updates.year !== undefined ? { year: updates.year } : {}),
    ...(updates.tharavNumber !== undefined ? { tharavNumber: updates.tharavNumber } : {}),
    ...(updates.titleMr ? { titleMr: updates.titleMr } : {}),
    ...(updates.titleEn ? { titleEn: updates.titleEn } : {}),
    ...(updates.date ? { date: updates.date } : {}),
    ...(updates.time ? { time: updates.time } : {}),
    ...(updates.videoUrl !== undefined ? { videoUrl: updates.videoUrl } : {}),
    ...(updates.minutesBase64 !== undefined ? { minutesUrl: updates.minutesBase64 } : {}),
    ...(updates.minutesName !== undefined ? { minutesName: updates.minutesName } : {}),
    ...(updates.status ? { status: updates.status } : {}),
  });
}

export async function deleteSabha(id: string): Promise<void> {
  await api.deleteSabha(id);
}
