import {
  collection, deleteDoc, doc, onSnapshot,
  orderBy, query, setDoc, updateDoc, type Unsubscribe,
} from "firebase/firestore";
import { assertFirebaseConfigured, isFirebaseConfigured } from "@/lib/firebase";
import { COUNCILLORS_LIST } from "@/data/councillorsData";

export interface OfficialRecord {
  id: string;
  nameMr: string;
  nameEn: string;
  category?: "president" | "councillor" | "nominated";
  categoryMr?: string;
  categoryEn?: string;
  designationMr?: string;
  designationEn?: string;
  ward: string;       // e.g. "१(अ)", "२(अ)"
  wardMr?: string;
  wardEn?: string;
  party: string;      // e.g. "भारतीय जनता पार्टी (BJP)"
  partyMr?: string;
  partyEn?: string;
  partyCode?: "BJP" | "NCP" | "IND";
  addressMr?: string;
  addressEn?: string;
  phone: string;
  photoBase64: string;
  order: number;
  status: "active" | "inactive";
  createdAt: number;
}

export const DEFAULT_OFFICIALS: OfficialRecord[] = COUNCILLORS_LIST.map((c) => ({
  id: c.id,
  nameMr: c.nameMr,
  nameEn: c.nameEn,
  category: c.category,
  categoryMr: c.categoryMr,
  categoryEn: c.categoryEn,
  designationMr: c.designationMr,
  designationEn: c.designationEn,
  ward: c.ward,
  wardMr: c.wardMr,
  wardEn: c.wardEn,
  party: c.party,
  partyMr: c.partyMr,
  partyEn: c.partyEn,
  partyCode: c.partyCode,
  addressMr: c.addressMr,
  addressEn: c.addressEn,
  phone: c.phone,
  photoBase64: "",
  order: c.order,
  status: "active",
  createdAt: 1735689600000,
}));

function colRef() {
  const { db } = assertFirebaseConfigured();
  return collection(db, "officials");
}

function mapOfficial(id: string, d: Partial<OfficialRecord>): OfficialRecord {
  return {
    id,
    nameMr: d.nameMr ?? "",
    nameEn: d.nameEn ?? d.nameMr ?? "",
    category: d.category,
    categoryMr: d.categoryMr,
    categoryEn: d.categoryEn,
    designationMr: d.designationMr,
    designationEn: d.designationEn,
    ward: d.ward ?? "",
    wardMr: d.wardMr ?? d.ward,
    wardEn: d.wardEn ?? d.ward,
    party: d.party ?? "",
    partyMr: d.partyMr ?? d.party,
    partyEn: d.partyEn ?? d.party,
    partyCode: d.partyCode,
    addressMr: d.addressMr ?? "",
    addressEn: d.addressEn ?? "",
    phone: d.phone ?? "",
    photoBase64: d.photoBase64 ?? "",
    order: d.order ?? 99,
    status: d.status ?? "active",
    createdAt: d.createdAt ?? Date.now(),
  };
}

export function subscribeToOfficials(cb: (items: OfficialRecord[]) => void): Unsubscribe {
  if (!isFirebaseConfigured) {
    cb(DEFAULT_OFFICIALS);
    return () => {};
  }
  try {
    const q = query(colRef(), orderBy("order", "asc"));
    return onSnapshot(
      q,
      (snap) => {
        const loaded = snap.docs.map((d) => mapOfficial(d.id, d.data() as Partial<OfficialRecord>));
        cb(loaded.length > 0 ? loaded : DEFAULT_OFFICIALS);
      },
      (err) => {
        console.warn("Firestore officials subscription fallback:", err.message);
        cb(DEFAULT_OFFICIALS);
      }
    );
  } catch (err) {
    console.warn("Error creating officials query fallback:", err);
    cb(DEFAULT_OFFICIALS);
    return () => {};
  }
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
