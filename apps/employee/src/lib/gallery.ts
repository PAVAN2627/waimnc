import * as api from "./api";

export type GalleryItemType = "photo" | "video";

export interface GalleryRecord {
  id: string;
  type: GalleryItemType;
  titleMr: string;
  titleEn: string;
  date: string;
  imageBase64: string; // for photos; thumbnail for videos
  videoUrl: string;    // YouTube/external URL for videos
  status: "active" | "inactive";
  createdAt: number;
}

export const isFirebaseConfigured = true;

function mapGallery(item: any): GalleryRecord {
  return {
    id: item.id,
    type: (item.type as GalleryItemType) || "photo",
    titleMr: item.titleMr || "",
    titleEn: item.titleEn || item.titleMr || "",
    date: item.date || "",
    imageBase64: item.imageUrl || item.imageBase64 || "",
    videoUrl: item.videoUrl || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  };
}

export function subscribeToGallery(cb: (items: GalleryRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchAdminGallery()
    .then((items) => {
      if (isMounted) cb(items.map(mapGallery));
    })
    .catch((err) => console.error("Failed to load gallery from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveGallery(cb: (items: GalleryRecord[]) => void): () => void {
  return subscribeToGallery((items) => cb(items.filter((g) => g.status === "active")));
}

export async function createGalleryItem(input: Omit<GalleryRecord, "id" | "createdAt">): Promise<GalleryRecord> {
  const res = await api.createGallery({
    type: input.type,
    titleMr: input.titleMr,
    titleEn: input.titleEn,
    date: input.date,
    imageUrl: input.imageBase64,
    videoUrl: input.videoUrl,
    status: input.status,
  });
  return mapGallery(res);
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryRecord>): Promise<void> {
  const payload: any = { ...updates };
  if (updates.imageBase64 !== undefined) {
    payload.imageUrl = updates.imageBase64;
    delete payload.imageBase64;
  }
  await api.updateGallery(id, payload);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await api.deleteGallery(id);
}
