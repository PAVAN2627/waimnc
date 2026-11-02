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
    imageBase64: item.imageUrl || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
  };
}

export function subscribeToRoutine(cb: (items: RoutineRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchAdminRoutine()
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

export async function createRoutine(input: Omit<RoutineRecord, "id" | "createdAt">): Promise<RoutineRecord> {
  const res = await api.createRoutine({
    date: input.date,
    titleMr: input.titleMr,
    titleEn: input.titleEn || input.titleMr,
    descMr: input.descMr,
    descEn: input.descEn || input.descMr,
    imageUrl: input.imageBase64,
    status: input.status,
  });
  return mapRoutine(res);
}

export async function updateRoutine(id: string, updates: Partial<RoutineRecord>): Promise<void> {
  await api.updateRoutine(id, {
    ...(updates.date ? { date: updates.date } : {}),
    ...(updates.titleMr ? { titleMr: updates.titleMr } : {}),
    ...(updates.titleEn ? { titleEn: updates.titleEn } : {}),
    ...(updates.descMr ? { descMr: updates.descMr } : {}),
    ...(updates.descEn ? { descEn: updates.descEn } : {}),
    ...(updates.imageBase64 ? { imageUrl: updates.imageBase64 } : {}),
    ...(updates.status ? { status: updates.status } : {}),
  });
}

export async function deleteRoutine(id: string): Promise<void> {
  await api.deleteRoutine(id);
}
