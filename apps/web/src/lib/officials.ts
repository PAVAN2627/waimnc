import * as api from "./api";

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

export const isFirebaseConfigured = true;

function mapOfficial(item: any): OfficialRecord {
  const designation = item.designationMr || "";
  let category: "president" | "councillor" | "nominated" = "councillor";
  if (
    designation.includes("नगराध्यक्ष") ||
    designation.includes("अध्यक्ष") ||
    (item.displayOrder !== undefined && item.displayOrder <= 2)
  ) {
    category = "president";
  } else if (
    designation.includes("नामनिर्देशित") ||
    designation.includes("स्वीकृत") ||
    (item.wardNumber && item.wardNumber.includes("नामनिर्देशित"))
  ) {
    category = "nominated";
  }

  const partyText = (item.partyMr || item.partyEn || "").toLowerCase();
  let partyCode: "BJP" | "NCP" | "IND" = "IND";
  if (partyText.includes("bjp") || partyText.includes("भाजप") || partyText.includes("भारतीय जनता")) {
    partyCode = "BJP";
  } else if (partyText.includes("ncp") || partyText.includes("राष्ट्रवादी") || partyText.includes("नॅशनलिस्ट")) {
    partyCode = "NCP";
  }

  return {
    id: item.id,
    nameMr: item.nameMr || "",
    nameEn: item.nameEn || item.nameMr || "",
    category,
    categoryMr: category === "president" ? "अध्यक्ष व उपाध्यक्ष" : category === "nominated" ? "नामनिर्देशित सदस्य" : "नगरसेवक यादी",
    categoryEn: category === "president" ? "President and Deputy President" : category === "nominated" ? "Nominated Members" : "Councillors List",
    designationMr: item.designationMr || "नगरसेवक",
    designationEn: item.designationEn || "Councillor",
    ward: item.wardNumber || "",
    wardMr: item.wardNumber || "",
    wardEn: item.wardNumber || "",
    party: item.partyMr || "",
    partyMr: item.partyMr || "",
    partyEn: item.partyEn || item.partyMr || "",
    partyCode,
    addressMr: item.addressMr || "",
    addressEn: item.addressEn || item.addressMr || "",
    phone: item.phone || "",
    photoBase64: item.photoUrl || "",
    order: item.displayOrder !== undefined ? item.displayOrder : 999,
    status: item.isActive === false ? "inactive" : "active",
    createdAt: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
  };
}

export function subscribeToOfficials(cb: (items: OfficialRecord[]) => void): () => void {
  let isMounted = true;
  api.fetchPublicOfficials()
    .then((items) => {
      if (isMounted) {
        cb(Array.isArray(items) ? items.map(mapOfficial) : []);
      }
    })
    .catch((err) => {
      console.error("Error fetching live officials from database:", err);
      if (isMounted) cb([]);
    });

  return () => {
    isMounted = false;
  };
}

export const subscribeToActiveOfficials = (cb: (items: OfficialRecord[]) => void) =>
  subscribeToOfficials((items) => cb(items.filter((o) => o.status === "active")));
