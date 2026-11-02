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
  api.fetchAdminSchemes()
    .then((items) => {
      if (isMounted) cb(items.map(mapScheme));
    })
    .catch((err) => console.error("Failed to load schemes from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveSchemes(cb: (items: SchemeRecord[]) => void): () => void {
  return subscribeToSchemes((items) => cb(items.filter((s) => s.status === "active")));
}

export async function createScheme(input: Omit<SchemeRecord, "id" | "createdAt">): Promise<SchemeRecord> {
  const res = await api.createScheme({
    category: input.category,
    titleMr: input.titleMr,
    titleEn: input.titleEn,
    descMr: input.descMr,
    descEn: input.descEn,
    eligibilityMr: input.eligibilityMr,
    eligibilityEn: input.eligibilityEn,
    benefitsMr: input.benefitsMr,
    benefitsEn: input.benefitsEn,
    externalUrl: input.externalUrl,
    imageUrl: input.imageBase64,
    status: input.status,
  });
  return mapScheme(res);
}

export async function updateScheme(id: string, updates: Partial<SchemeRecord>): Promise<void> {
  const payload: any = { ...updates };
  if (updates.imageBase64 !== undefined) {
    payload.imageUrl = updates.imageBase64;
    delete payload.imageBase64;
  }
  await api.updateScheme(id, payload);
}

export async function deleteScheme(id: string): Promise<void> {
  await api.deleteScheme(id);
}
