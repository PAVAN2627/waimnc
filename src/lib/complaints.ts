import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { assertFirebaseConfigured } from "@/lib/firebase";

export type ComplaintStatus = "pending" | "in-progress" | "resolved";
export type ComplaintAttachmentType = "image" | "pdf" | "file";

export interface ComplaintAttachment {
  name: string;
  mimeType: string;
  type: ComplaintAttachmentType;
  base64: string; // stored directly in Firestore
}

export interface ComplaintRecord {
  id: string;
  trackingId?: string;
  name: string;
  mobile: string;
  ward: string;
  type: string;
  department: string;
  description: string;
  attachments: ComplaintAttachment[];
  status: ComplaintStatus;
  createdAt: number;
  updatedAt: number;
}

export interface CreateComplaintInput {
  name: string;
  mobile: string;
  ward: string;
  type: string;
  department: string;
  description: string;
  files?: File[];
}

function collectionRef() {
  const { db } = assertFirebaseConfigured();
  return collection(db, "complaints");
}

function detectAttachmentType(file: File): ComplaintAttachmentType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return "file";
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
// Firestore doc limit is 1MB; base64 adds ~33% overhead.
// We compress images to stay well under that per attachment.
const IMAGE_COMPRESS_MAX_PX = 1200;
const IMAGE_COMPRESS_QUALITY = 0.75;

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > IMAGE_COMPRESS_MAX_PX || height > IMAGE_COMPRESS_MAX_PX) {
        if (width > height) {
          height = Math.round((height * IMAGE_COMPRESS_MAX_PX) / width);
          width = IMAGE_COMPRESS_MAX_PX;
        } else {
          width = Math.round((width * IMAGE_COMPRESS_MAX_PX) / height);
          height = IMAGE_COMPRESS_MAX_PX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", IMAGE_COMPRESS_QUALITY));
    };
    img.onerror = reject;
    img.src = url;
  });
}

async function processFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`"${file.name}" is too large. Max size is ${MAX_FILE_SIZE_MB} MB.`);
  }
  if (file.type.startsWith("image/")) {
    return compressImage(file);
  }
  return fileToBase64(file);
}

function mapComplaint(id: string, data: Partial<ComplaintRecord>): ComplaintRecord {
  return {
    id,
    trackingId: data.trackingId ?? `TK-${id.slice(-6).toUpperCase()}`,
    name: data.name ?? "",
    mobile: data.mobile ?? "",
    ward: data.ward ?? "",
    type: data.type ?? "",
    department: data.department ?? "",
    description: data.description ?? "",
    attachments: data.attachments ?? [],
    status: data.status ?? "pending",
    createdAt: data.createdAt ?? Date.now(),
    updatedAt: data.updatedAt ?? Date.now(),
  };
}

export async function createComplaint(input: CreateComplaintInput): Promise<ComplaintRecord> {
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = Date.now();
  const trackingId = `TK-${id.slice(-6).toUpperCase()}`;
  const attachments: ComplaintAttachment[] = [];

  if (input.files?.length) {
    for (const file of input.files) {
      const base64 = await processFile(file);
      attachments.push({
        name: file.name,
        mimeType: file.type,
        type: detectAttachmentType(file),
        base64,
      });
    }
  }

  const payload = mapComplaint(id, {
    trackingId,
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    ward: input.ward.trim(),
    type: input.type.trim(),
    department: input.department.trim(),
    description: input.description.trim(),
    attachments,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });

  await setDoc(doc(collectionRef(), id), payload);
  return payload;
}

export function subscribeToAllComplaints(
  callback: (complaints: ComplaintRecord[]) => void
): Unsubscribe {
  const q = query(collectionRef(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((d) => mapComplaint(d.id, d.data() as Partial<ComplaintRecord>))
    );
  });
}

export async function updateComplaintStatus(id: string, status: ComplaintStatus) {
  await updateDoc(doc(collectionRef(), id), {
    status,
    updatedAt: Date.now(),
  });
}

export function formatComplaintDate(timestamp: number, locale: "mr" | "en") {
  return new Date(timestamp).toLocaleDateString(
    locale === "mr" ? "mr-IN" : "en-IN",
    { day: "2-digit", month: "long", year: "numeric" }
  );
}

export async function getComplaintByTrackingId(
  trackingId: string,
  mobile: string
): Promise<ComplaintRecord | null> {
  const normTrackingId = trackingId.trim().toUpperCase();
  const normMobile = mobile.trim();
  const suffix = normTrackingId.replace(/^TK-/i, "").toLowerCase();

  // 1. Direct query by trackingId and mobile (targeted O(1) query, eliminates database scraping)
  try {
    const qDirect = query(
      collectionRef(),
      where("trackingId", "==", normTrackingId),
      where("mobile", "==", normMobile),
      limit(1)
    );
    const snapDirect = await getDocs(qDirect);
    if (!snapDirect.empty) {
      const matchedDoc = snapDirect.docs[0];
      return mapComplaint(matchedDoc.id, matchedDoc.data() as Partial<ComplaintRecord>);
    }
  } catch (err) {
    // If trackingId index is still building or absent on legacy documents, proceed to mobile query
    console.warn("Direct trackingId query fallback:", err);
  }

  // 2. Query scoped strictly to the user's mobile number ONLY (never downloads all city records)
  const qByMobile = query(
    collectionRef(),
    where("mobile", "==", normMobile)
  );
  const snapMobile = await getDocs(qByMobile);
  const match = snapMobile.docs.find(
    (d) => d.id.slice(-6).toLowerCase() === suffix
  );
  if (!match) return null;
  return mapComplaint(match.id, match.data() as Partial<ComplaintRecord>);
}
