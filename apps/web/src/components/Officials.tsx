import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToActiveOfficials, type OfficialRecord } from "@/lib/officials";

// Photos stored in /public — these map to officials seeded in DB by their name keywords
const LOCAL_PHOTO_MAP: Record<string, string> = {
  "नगराध्यक्ष": "/nagaradhyaksh.jpeg",
  "उपनगराध्यक्ष": "/upnagaradhyaksh.jpeg",
  "sanjivani": "/sanjivani_dalvi.png",
  "संजीवनी": "/sanjivani_dalvi.png",
  "dalvi": "/sanjivani_dalvi.png",
  "दळवी": "/sanjivani_dalvi.png",
  "vijay": "/vijay_dhekane.jpeg",
  "विजय": "/vijay_dhekane.jpeg",
  "dhekane": "/vijay_dhekane.jpeg",
  "ढेकणे": "/vijay_dhekane.jpeg",
};

function getOfficialPhoto(o: OfficialRecord): string | null {
  // 1. Use DB photo URL if available (R2 / Vercel Blob)
  if (o.photoBase64 && o.photoBase64.startsWith("http")) return o.photoBase64;
  if (o.photoBase64 && o.photoBase64.startsWith("/api/")) return o.photoBase64;
  if (o.photoBase64 && o.photoBase64.startsWith("data:")) return o.photoBase64;

  // 2. Try matching against local public photos by name or designation
  const searchKey = `${o.nameMr} ${o.nameEn} ${o.designationMr || ""}`.toLowerCase();
  for (const [key, path] of Object.entries(LOCAL_PHOTO_MAP)) {
    if (searchKey.includes(key.toLowerCase())) return path;
  }

  return null;
}

const Officials = () => {
  const { lang, t } = useLanguage();
  const [officials, setOfficials] = useState<OfficialRecord[]>([]);

  useEffect(() => {
    return subscribeToActiveOfficials(setOfficials);
  }, []);

  if (officials.length === 0) return null;

  return (
    <section className="py-12 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">{t("नगरसेवक", "Corporators")}</h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          {t("वाई नगरपरिषदेचे निर्वाचित नगरसेवक", "Elected Corporators of Wai Municipal Council")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {officials.map((o) => {
            const photo = getOfficialPhoto(o);
            return (
              <div key={o.id} className="text-center">
                {photo
                  ? <img
                      src={photo}
                      alt={o.nameMr}
                      className="w-24 h-24 mx-auto mb-2 rounded-full object-cover border-2 border-primary shadow-md"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  : <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-muted border-2 border-primary flex items-center justify-center text-4xl shadow-md">👤</div>
                }
                <h3 className="font-semibold text-sm leading-tight">{lang === "mr" ? o.nameMr : (o.nameEn || o.nameMr)}</h3>
                {o.designationMr && (
                  <p className="text-xs text-muted-foreground mt-0.5">{lang === "mr" ? o.designationMr : (o.designationEn || o.designationMr)}</p>
                )}
                {o.ward && <p className="text-xs text-primary font-medium mt-0.5">{t(`वार्ड ${o.ward}`, `Ward ${o.ward}`)}</p>}
                {o.party && <span className="inline-block text-[10px] bg-accent px-2 py-0.5 rounded-full mt-0.5">{o.party}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Officials;
