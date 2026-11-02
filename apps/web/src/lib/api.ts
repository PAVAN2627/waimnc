export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      errorMessage = errorJson.message || errorJson.error || errorMessage;
      if (Array.isArray(errorMessage)) errorMessage = errorMessage.join(", ");
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null as T;
  return response.json();
}

// Public Dashboard Stats
export async function fetchPublicStats() {
  return request<{
    totalComplaints: number;
    resolvedComplaints: number;
    resolutionRate: number;
    activeProjects: number;
    activeTenders: number;
    activeNotices: number;
    totalOfficials: number;
  }>("/dashboard/public-stats");
}

// Public Notices
export async function fetchPublicNotices() {
  return request<any[]>("/notices/public");
}

// Public Projects
export async function fetchPublicProjects() {
  return request<any[]>("/projects/public");
}

// Public News
export async function fetchPublicNews() {
  return request<any[]>("/news/public");
}

// Public Officials
export async function fetchPublicOfficials() {
  return request<any[]>("/officials/public");
}

// Public Sabha Meetings
export async function fetchPublicSabha() {
  return request<any[]>("/sabha/public");
}

// Public Schemes
export async function fetchPublicSchemes(category?: string) {
  const qStr = category ? `?category=${encodeURIComponent(category)}` : "";
  return request<any[]>(`/schemes/public${qStr}`);
}

// Public Gallery
export async function fetchPublicGallery(type?: string) {
  const qStr = type ? `?type=${encodeURIComponent(type)}` : "";
  return request<any[]>(`/gallery/public${qStr}`);
}

// Public Routine
export async function fetchPublicRoutine() {
  return request<any[]>("/routine/public");
}

// Public Tenders
export async function fetchPublicTenders() {
  return request<any[]>("/tenders/public");
}

// Citizen Grievances / Complaints
export async function submitComplaint(data: {
  name: string;
  mobile: string;
  ward: string;
  type: string;
  department: string;
  description: string;
  attachments?: any[];
}) {
  return request<any>("/complaints/submit", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function trackComplaint(trackingId: string, mobile?: string) {
  const qStr = mobile ? `?mobile=${encodeURIComponent(mobile.trim())}` : "";
  return request<any>(`/complaints/track/${encodeURIComponent(trackingId.trim())}${qStr}`);
}

// Upload Citizen Grievance Attachment directly to Vercel Blob
export async function uploadGrievanceMedia(file: File): Promise<{ url: string; viewUrl: string; pathname: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string; viewUrl: string; pathname: string; filename: string }>(
    `/storage/upload-grievance`,
    {
      method: 'POST',
      body: formData,
    }
  );
}

