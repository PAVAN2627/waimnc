import {
  collection, deleteDoc, doc, onSnapshot,
  orderBy, query, setDoc, updateDoc, type Unsubscribe,
} from "firebase/firestore";
import { assertFirebaseConfigured } from "@/lib/firebase";

export interface OfficialRecord {
  id: string;
  nameMr: string;
  nameEn: string;
  ward: string;       // e.g. "1" to "17"
  party: string;      // e.g. "NCP", "BJP"
  phone: string;
  photoBase64: string;
  order: number;
  status: "active" | "inactive";
  createdAt: number;
}

function colRef() {
  const { db } = assertFirebaseConfigured();
  return collection(db, "officials");
}

function mapOfficial(id: string, d: Partial<OfficialRecord>): OfficialRecord {
  return {
    id,
    nameMr: d.nameMr ?? "",
    nameEn: d.nameEn ?? d.nameMr ?? "",
    ward: d.ward ?? "",
    party: d.party ?? "",
    phone: d.phone ?? "",
    photoBase64: d.photoBase64 ?? "",
    order: d.order ?? 99,
    status: d.status ?? "active",
    createdAt: d.createdAt ?? Date.now(),
  };
}

export function subscribeToOfficials(cb: (items: OfficialRecord[]) => void): Unsubscribe {
  const q = query(colRef(), orderBy("order", "asc"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => mapOfficial(d.id, d.data() as Partial<OfficialRecord>))));
}

export function subscribeToActiveOfficials(cb: (items: OfficialRecord[]) => void): Unsubscribe {
  return subscribeToOfficials((items) => cb(items.filter((o) => o.status === "active")));
}

export async function createOfficial(input: Omit<OfficialRecord, "id" | "createdAt">): Promise<OfficialRecord> {
  const id = crypto.randomUUID();
  const payload = mapOfficial(id, { ...input, createdAt: Date.now() });
  await setDoc(doc(colRef(), id), payload);
  return payload;
}

export async function updateOfficial(id: string, updates: Partial<OfficialRecord>) {
  await updateDoc(doc(colRef(), id), updates);
}

export async function deleteOfficial(id: string) {
  await deleteDoc(doc(colRef(), id));
}
