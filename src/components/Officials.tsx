import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveOfficials, type OfficialRecord } from "@/lib/officials";

const Officials = () => {
  const { lang, t } = useLanguage();
  const [officials, setOfficials] = useState<OfficialRecord[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToActiveOfficials(setOfficials);
  }, []);

  if (officials.length === 0) return null;

  return (
    <section className="py-12 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">{t("नगरसेवक", "Corporators")}</h2>
        <p className="text-center text-muted-foreground text-sm mb-8">
          {t("वाई नगर परिषदेचे निर्वाचित नगरसेवक", "Elected Corporators of Wai Municipal Council")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {officials.map((o) => (
            <div key={o.id} className="text-center">
              {o.photoBase64
                ? <img src={o.photoBase64} alt={o.nameMr} className="w-24 h-24 mx-auto mb-2 rounded-full object-cover border-2 border-primary shadow-md" />
                : <div className="w-24 h-24 mx-auto mb-2 rounded-full bg-muted border-2 border-primary flex items-center justify-center text-4xl shadow-md">👤</div>
              }
              <h3 className="font-semibold text-sm leading-tight">{lang === "mr" ? o.nameMr : (o.nameEn || o.nameMr)}</h3>
              {o.ward && <p className="text-xs text-primary font-medium mt-0.5">{t(`वार्ड ${o.ward}`, `Ward ${o.ward}`)}</p>}
              {o.party && <span className="inline-block text-[10px] bg-accent px-2 py-0.5 rounded-full mt-0.5">{o.party}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Officials;
