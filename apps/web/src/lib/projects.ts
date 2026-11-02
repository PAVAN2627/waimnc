import * as api from "./api";

export interface ProjectRecord {
  id: string;
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
  progress: number;
  iconName: string;
  documentUrl?: string;
  documentName?: string;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
}

export const isFirebaseConfigured = true;

function mapProject(item: any): ProjectRecord {
  return {
    id: item.id,
    titleMr: item.titleMr || "",
    titleEn: item.titleEn || item.titleMr || "",
    descMr: item.descMr || "",
    descEn: item.descEn || item.descMr || "",
    progress: typeof item.progress === "number" ? Math.min(100, Math.max(0, item.progress)) : 0,
    iconName: item.iconName || "Building2",
    documentUrl: item.documentUrl || "",
    documentName: item.documentName || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
  };
}

export function subscribeToPublicProjects(callback: (projects: ProjectRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchPublicProjects()
    .then((items) => {
      if (isMounted) callback(items.map(mapProject));
    })
    .catch((err) => console.error("Failed to load public projects from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export const subscribeToAllProjects = subscribeToPublicProjects;
export const subscribeToActiveProjects = subscribeToPublicProjects;
