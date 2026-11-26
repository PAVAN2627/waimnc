import * as api from "./api";
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
  ward: string;
  wardMr?: string;
  wardEn?: string;
  party: string;
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

export const isFirebaseConfigured = true;

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

function mapOfficial(item: any): OfficialRecord {
  return {
    id: item.id,
    nameMr: item.nameMr || "",
    nameEn: item.nameEn || item.nameMr || "",
    designationMr: item.designationMr || "नगरसेवक",
    designationEn: item.designationEn || "Councillor",
    ward: item.wardNumber || "",
    addressMr: item.addressMr || "",
    addressEn: item.addressEn || "",
    party: item.partyMr || "",
    phone: item.phone || "",
    photoBase64: item.photoUrl || "",
    order: item.displayOrder || 999,
    status: item.isActive ? "active" : "inactive",
    createdAt: new Date(item.createdAt).getTime(),
  };
}

export function subscribeToAllOfficials(callback: (officials: OfficialRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchAdminOfficials()
    .then((items) => {
      if (isMounted) {
        callback(Array.isArray(items) ? items.map(mapOfficial) : []);
      }
    })
    .catch((err) => {
      console.error("Failed to load officials in admin:", err);
      if (isMounted) callback([]);
    });

  return () => {
    isMounted = false;
  };
}

export const subscribeToOfficials = subscribeToAllOfficials;
export const subscribeToActiveOfficials = (cb: (items: OfficialRecord[]) => void) =>
  subscribeToAllOfficials((items) => cb(items.filter((i) => i.status === "active")));

export async function createOfficial(record: Omit<OfficialRecord, "id" | "createdAt">): Promise<OfficialRecord> {
  const res = await api.createOfficial({
    nameMr: record.nameMr,
    nameEn: record.nameEn || record.nameMr,
    designationMr: record.designationMr || "नगरसेवक",
    designationEn: record.designationEn || "Councillor",
    wardNumber: record.ward || "",
    addressMr: record.addressMr || "",
    addressEn: record.addressEn || record.addressMr || "",
    partyMr: record.party || "",
    partyEn: record.partyEn || record.party || "",
    phone: record.phone || "",
    photoUrl: record.photoBase64 || "",
    displayOrder: record.order,
    isActive: record.status !== "inactive",
  });
  return mapOfficial(res);
}

export async function updateOfficial(id: string, updates: Partial<OfficialRecord>): Promise<void> {
  await api.updateOfficial(id, {
    ...(updates.nameMr !== undefined ? { nameMr: updates.nameMr } : {}),
    ...(updates.nameEn !== undefined ? { nameEn: updates.nameEn } : {}),
    ...(updates.designationMr !== undefined ? { designationMr: updates.designationMr } : {}),
    ...(updates.designationEn !== undefined ? { designationEn: updates.designationEn } : {}),
    ...(updates.ward !== undefined ? { wardNumber: updates.ward } : {}),
    ...(updates.addressMr !== undefined ? { addressMr: updates.addressMr } : {}),
    ...(updates.addressEn !== undefined ? { addressEn: updates.addressEn } : {}),
    ...(updates.party !== undefined ? { partyMr: updates.party } : {}),
    ...(updates.partyEn !== undefined ? { partyEn: updates.partyEn } : {}),
    ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
    ...(updates.photoBase64 !== undefined ? { photoUrl: updates.photoBase64 } : {}),
    ...(updates.order !== undefined ? { displayOrder: updates.order } : {}),
    ...(updates.status !== undefined ? { isActive: updates.status === "active" } : {}),
  });
}

export async function deleteOfficial(id: string): Promise<void> {
  await api.deleteOfficial(id);
}

export async function seedDefaultOfficialsIfEmpty(): Promise<void> {
  // Initial seed is handled via backend or default fallback list
}
