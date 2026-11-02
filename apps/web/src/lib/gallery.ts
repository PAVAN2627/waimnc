import * as api from "./api";

export type GalleryItemType = "photo" | "video";

export interface GalleryRecord {
  id: string;
  type: GalleryItemType;
  titleMr: string;
  titleEn: string;
  date: string;
  imageBase64: string;
  videoUrl: string;
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
  api.fetchPublicGallery()
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
