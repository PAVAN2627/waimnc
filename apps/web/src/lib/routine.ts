import * as api from "./api";

export interface RoutineRecord {
  id: string;
  date: string;
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
  imageBase64: string;
  status: "active" | "inactive";
  createdAt: number;
}

export const isFirebaseConfigured = true;

function mapRoutine(item: any): RoutineRecord {
  return {
    id: item.id,
    date: item.date || "",
    titleMr: item.titleMr || "",
    titleEn: item.titleEn || item.titleMr || "",
    descMr: item.descMr || "",
    descEn: item.descEn || item.descMr || "",
    imageBase64: item.imageUrl || item.imageBase64 || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
  };
}

export function subscribeToRoutine(cb: (items: RoutineRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchPublicRoutine()
    .then((items) => {
      if (isMounted) cb(items.map(mapRoutine));
    })
    .catch((err) => console.error("Failed to load routine from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveRoutine(cb: (items: RoutineRecord[]) => void): () => void {
  return subscribeToRoutine((items) => cb(items.filter((r) => r.status === "active")));
}
