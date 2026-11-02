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

export interface CreateProjectInput {
  titleMr: string;
  titleEn?: string;
  descMr?: string;
  descEn?: string;
  progress?: number;
  iconName?: string;
  documentUrl?: string;
  documentName?: string;
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
    iconName: item.iconName || "FolderOpen",
    documentUrl: item.documentUrl || "",
    documentName: item.documentName || "",
    status: item.status === "inactive" ? "inactive" : "active",
    createdAt: new Date(item.createdAt).getTime(),
    updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
  };
}

export function subscribeToAllProjects(callback: (projects: ProjectRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchAdminProjects()
    .then((items) => {
      if (isMounted) callback(items.map(mapProject));
    })
    .catch((err) => console.error("Failed to load projects from PostgreSQL:", err));

  return () => {
    isMounted = false;
  };
}

export function subscribeToActiveProjects(callback: (projects: ProjectRecord[]) => void): () => void {
  return subscribeToAllProjects((projects) => callback(projects.filter((p) => p.status === "active")));
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const res = await api.createProject({
    titleMr: input.titleMr.trim(),
    titleEn: input.titleEn?.trim() || null,
    descMr: input.descMr?.trim() || null,
    descEn: input.descEn?.trim() || null,
    progress: input.progress ?? 0,
    iconName: input.iconName || "FolderOpen",
    status: "active",
  });
  return mapProject(res);
}

export async function updateProject(id: string, updates: Partial<ProjectRecord>): Promise<void> {
  await api.updateProject(id, updates);
}

export async function deleteProject(id: string): Promise<void> {
  await api.deleteProject(id);
}

export async function setProjectStatus(id: string, status: "active" | "inactive"): Promise<void> {
  await api.updateProject(id, { status });
}

export async function toggleProjectStatus(id: string, current: "active" | "inactive"): Promise<"active" | "inactive"> {
  const next: "active" | "inactive" = current === "active" ? "inactive" : "active";
  await api.updateProject(id, { status: next });
  return next;
}
