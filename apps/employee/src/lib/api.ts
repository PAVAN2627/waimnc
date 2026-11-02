import type { DashboardStats } from "@wmc/types";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role?: string; // "SUPER_ADMIN" | "DEPT_OFFICER"
  department?: string | null;
  departments?: string[];
  accessScope?: string | null;
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  password: string;
  department?: string;
  departments?: string[];
  role?: string;
  accessScope?: string;
}

export interface UpdateStaffPayload {
  name?: string;
  department?: string;
  departments?: string[];
  role?: string;
  accessScope?: string;
  isActive?: boolean;
  password?: string;
}

export interface AuditLog {
  id: string;
  adminId?: string | null;
  adminEmail?: string | null;
  adminName?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: any;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  loginCountToday: number;
  recentAdmins: Array<{
    adminName: string;
    adminEmail: string;
    createdAt: string;
    action: string;
  }>;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("X-Portal-Type", "employee");

  const token = typeof window !== "undefined" ? localStorage.getItem("wmc_employee_token") : null;
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Transmit HttpOnly cookie
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
      if (Array.isArray(errorMessage)) errorMessage = errorMessage.join(", ");
    } catch {
      // Fallback to status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // Handle empty 204 or void responses
  if (response.status === 204) return null as T;
  return response.json();
}

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------
export async function loginAdmin(email: string, password: string): Promise<{ user: AdminUser; accessToken?: string }> {
  const result = await request<{ user: AdminUser; accessToken?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, portal: "employee" }),
  });
  if (result.accessToken && typeof window !== "undefined") {
    localStorage.setItem("wmc_employee_token", result.accessToken);
  }
  return result;
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wmc_employee_token");
  }
  return request<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}

export async function getAdminProfile(): Promise<AdminUser | null> {
  try {
    return await request<AdminUser>("/auth/me");
  } catch {
    return null;
  }
}

export async function updateAdminProfile(name: string): Promise<AdminUser> {
  return request<AdminUser>("/auth/profile", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  return request<{ success: boolean; message: string }>("/auth/password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// -----------------------------------------------------------------------------
// Staff & Department User Access Management (RBAC)
// -----------------------------------------------------------------------------
export async function fetchStaffUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>("/auth/staff");
}

export async function createStaffUser(payload: CreateStaffPayload): Promise<AdminUser> {
  return request<AdminUser>("/auth/staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStaffUser(id: string, payload: UpdateStaffPayload): Promise<AdminUser> {
  return request<AdminUser>(`/auth/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteStaffUser(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/auth/staff/${id}`, {
    method: "DELETE",
  });
}

// -----------------------------------------------------------------------------
// Audit & Activity Logs
// -----------------------------------------------------------------------------
export async function fetchAuditLogs(params: {
  search?: string;
  action?: string;
  resource?: string;
  adminEmail?: string;
  page?: number;
  limit?: number;
} = {}): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.action && params.action !== "all") query.set("action", params.action);
  if (params.resource && params.resource !== "all") query.set("resource", params.resource);
  if (params.adminEmail && params.adminEmail !== "all") query.set("adminEmail", params.adminEmail);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  return request<AuditLogsResponse>(`/audit-logs${qs ? `?${qs}` : ""}`);
}

export async function fetchAuditStats(): Promise<AuditStats> {
  return request<AuditStats>("/audit-logs/stats");
}

// -----------------------------------------------------------------------------
// Dashboard Statistics
// -----------------------------------------------------------------------------
export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  try {
    return await request<DashboardStats>("/dashboard/stats");
  } catch (error) {
    console.warn("Could not reach NestJS PostgreSQL backend:", error);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Notices (सूचना)
// -----------------------------------------------------------------------------
export async function fetchAdminNotices() {
  return request<any[]>("/notices/admin/all");
}
export async function createNotice(data: any) {
  return request<any>("/notices", { method: "POST", body: JSON.stringify(data) });
}
export async function updateNotice(id: string, data: any) {
  return request<any>(`/notices/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteNotice(id: string) {
  return request<any>(`/notices/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Complaints (तक्रारी)
// -----------------------------------------------------------------------------
export async function fetchAdminComplaints(status?: string, department?: string) {
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (department) query.set("department", department);
  const qStr = query.toString() ? `?${query.toString()}` : "";
  return request<any[]>(`/complaints/admin/all${qStr}`);
}
export async function updateComplaintStatus(id: string, status: string) {
  return request<any>(`/complaints/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
export async function deleteComplaint(id: string) {
  return request<any>(`/complaints/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Projects (प्रकल्प)
// -----------------------------------------------------------------------------
export async function fetchAdminProjects() {
  return request<any[]>("/projects/admin/all");
}
export async function createProject(data: any) {
  return request<any>("/projects", { method: "POST", body: JSON.stringify(data) });
}
export async function updateProject(id: string, data: any) {
  return request<any>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteProject(id: string) {
  return request<any>(`/projects/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// News (बातम्या)
// -----------------------------------------------------------------------------
export async function fetchAdminNews() {
  return request<any[]>("/news/admin/all");
}
export async function createNews(data: any) {
  return request<any>("/news", { method: "POST", body: JSON.stringify(data) });
}
export async function updateNews(id: string, data: any) {
  return request<any>(`/news/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteNews(id: string) {
  return request<any>(`/news/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Officials (पदाधिकारी)
// -----------------------------------------------------------------------------
export async function fetchAdminOfficials() {
  return request<any[]>("/officials/admin/all");
}
export async function createOfficial(data: any) {
  return request<any>("/officials", { method: "POST", body: JSON.stringify(data) });
}
export async function updateOfficial(id: string, data: any) {
  return request<any>(`/officials/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteOfficial(id: string) {
  return request<any>(`/officials/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Sabha Meetings (सभा)
// -----------------------------------------------------------------------------
export async function fetchAdminSabha() {
  return request<any[]>("/sabha/admin/all");
}
export async function createSabha(data: any) {
  return request<any>("/sabha", { method: "POST", body: JSON.stringify(data) });
}
export async function updateSabha(id: string, data: any) {
  return request<any>(`/sabha/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteSabha(id: string) {
  return request<any>(`/sabha/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Schemes (योजना)
// -----------------------------------------------------------------------------
export async function fetchAdminSchemes() {
  return request<any[]>("/schemes/admin/all");
}
export async function createScheme(data: any) {
  return request<any>("/schemes", { method: "POST", body: JSON.stringify(data) });
}
export async function updateScheme(id: string, data: any) {
  return request<any>(`/schemes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteScheme(id: string) {
  return request<any>(`/schemes/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Gallery (गॅलरी)
// -----------------------------------------------------------------------------
export async function fetchAdminGallery() {
  return request<any[]>("/gallery/admin/all");
}
export async function createGallery(data: any) {
  return request<any>("/gallery", { method: "POST", body: JSON.stringify(data) });
}
export async function updateGallery(id: string, data: any) {
  return request<any>(`/gallery/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteGallery(id: string) {
  return request<any>(`/gallery/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Routine (दिनक्रम)
// -----------------------------------------------------------------------------
export async function fetchAdminRoutine() {
  return request<any[]>("/routine/admin/all");
}
export async function createRoutine(data: any) {
  return request<any>("/routine", { method: "POST", body: JSON.stringify(data) });
}
export async function updateRoutine(id: string, data: any) {
  return request<any>(`/routine/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteRoutine(id: string) {
  return request<any>(`/routine/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Tenders (निविदा)
// -----------------------------------------------------------------------------
export async function fetchAdminTenders() {
  return request<any[]>("/tenders/admin/all");
}
export async function createTender(data: any) {
  return request<any>("/tenders", { method: "POST", body: JSON.stringify(data) });
}
export async function updateTender(id: string, data: any) {
  return request<any>(`/tenders/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}
export async function deleteTender(id: string) {
  return request<any>(`/tenders/${id}`, { method: "DELETE" });
}

// -----------------------------------------------------------------------------
// Media & Vercel Blob Storage
// -----------------------------------------------------------------------------
export async function uploadMedia(
  file: File,
  folder: 'tenders' | 'officials' | 'notices' | 'grievances' | 'gallery' | 'sabha' | 'general' = 'general'
): Promise<{ url: string; viewUrl: string; pathname: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string; viewUrl: string; pathname: string; filename: string }>(
    `/storage/upload?folder=${folder}`,
    {
      method: 'POST',
      body: formData,
    }
  );
}
