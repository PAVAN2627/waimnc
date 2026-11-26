import * as api from "./api";

export type SchemeCategory = "central" | "state" | "local" | "other";

export interface SchemeRecord {
  id: string;
  category: SchemeCategory;
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
  eligibilityMr: string;
  eligibilityEn: string;
  benefitsMr: string;
  benefitsEn: string;
  externalUrl: string;
  imageBase64: string;
  status: "active" | "inactive";
  createdAt: number;
}

export const isFirebaseConfigured = true;


function mapScheme(item: any): SchemeRecord {
  return {
    id: item.id,
    category: (item.category as SchemeCategory) || "local",
    titleMr: item.titleMr || "",
    titleEn: item.titleEn || item.titleMr || "",
    descMr: item.descMr || "",
    descEn: item.descEn || item.descMr || "",
    eligibilityMr: item.eligibilityMr || "",
    eligibilityEn: item.eligibilityEn || item.eligibilityMr || "",
    benefitsMr: item.benefitsMr || "",
    benefitsEn: item.benefitsEn || item.benefitsMr || "",
    externalUrl: item.externalUrl || "",
    imageBase64: item.imageUrl || item.imageBase64 || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  };
}

export function subscribeToSchemes(cb: (items: SchemeRecord[]) => void): () => void {
  let isMounted = true;

  // Pure dynamic fetch from PostgreSQL database API
  api.fetchPublicSchemes()
    .then((items) => {
      if (!isMounted) return;
      if (Array.isArray(items)) {
        cb(items.map(mapScheme));
      } else {
        cb([]);
      }
    })
    .catch((err) => {
      console.warn("Failed to fetch schemes from database:", err);
      if (isMounted) cb([]);
    });

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveSchemes(cb: (items: SchemeRecord[]) => void): () => void {
  return subscribeToSchemes((items) => cb(items.filter((s) => s.status === "active")));
}

export function subscribeToCategorySchemes(
  category: SchemeCategory,
  cb: (items: SchemeRecord[]) => void
): () => void {
  let isMounted = true;

  api.fetchPublicSchemes(category)
    .then((items) => {
      if (!isMounted) return;
      if (Array.isArray(items)) {
        cb(items.map(mapScheme).filter((s) => s.status === "active"));
      } else {
        cb([]);
      }
    })
    .catch((err) => {
      console.warn(`Category ${category} fetch error:`, err);
      if (isMounted) cb([]);
    });

  return () => {
    isMounted = false;
  };
}

export async function fetchSchemeByIdOrSlug(idOrSlug: string): Promise<SchemeRecord | null> {
  const normalized = idOrSlug.trim().toLowerCase();
  try {
    const raw = await api.fetchPublicSchemeById(idOrSlug);
    if (raw) return mapScheme(raw);
  } catch {
    // continue to search in all schemes
  }

  try {
    const all = await api.fetchPublicSchemes();
    if (Array.isArray(all) && all.length > 0) {
      const match = all.find((item: any) => {
        if (!item) return false;
        if (item.id === idOrSlug) return true;
        const mr = (item.titleMr || "").toLowerCase();
        const en = (item.titleEn || "").toLowerCase();
        return mr.includes(normalized) || en.includes(normalized);
      });
      if (match) return mapScheme(match);
    }
  } catch {}

  return null;
}
