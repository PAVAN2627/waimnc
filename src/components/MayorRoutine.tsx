import { Calendar, ChevronLeft, ChevronRight, X, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveRoutine, type RoutineRecord } from "@/lib/routine";

const RoutineModal = ({ item, onClose, lang }: { item: RoutineRecord; onClose: () => void; lang: string }) => {
  const title = lang === "mr" ? item.titleMr : (item.titleEn || item.titleMr);
  const desc = lang === "mr" ? item.descMr : (item.descEn || item.descMr);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-card rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Newspaper header strip */}
        <div className="gov-gradient text-primary-foreground px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" />
            {item.date}
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image */}
        {item.imageBase64 && (
          <div className="relative h-56 overflow-hidden">
            <img src={item.imageBase64} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        {/* Content — newspaper style */}
        <div className="p-6 space-y-4">
          {/* Decorative rule */}
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-primary rounded-full" />
            <div className="h-px flex-1 bg-border" />
          </div>

          <h2 className="text-xl font-bold leading-snug font-devanagari">{title}</h2>

          {desc && (
            <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{desc}</p>
          )}

          <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>वाई नगरपरिषद · Wai Municipal Council</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const MayorRoutine = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<RoutineRecord[]>([]);
  const [selected, setSelected] = useState<RoutineRecord | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToActiveRoutine(setItems);
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  // Show only latest 7 entries (FIFO — newest first, oldest drops off)
  const displayed = items.slice(0, 7);

  return (
    <>
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">📅 {t("नगराध्यक्ष दिनक्रम", "Mayor's Daily Routine")}</h2>
              <p className="text-muted-foreground mt-1">{t("नगराध्यक्षांचे दैनंदिन उपक्रम — अधिक माहितीसाठी क्लिक करा", "Daily activities of the Mayor — click for details")}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/gallery"
                className="text-sm text-primary hover:underline font-medium hidden sm:block"
                state={{ tab: "routine" }}
              >
                {t("सर्व पहा →", "View All →")}
              </Link>
              <button onClick={() => scroll("left")} className="p-2 rounded-full border border-border hover:bg-muted transition-colors"><ChevronLeft className="h-5 w-5" /></button>
              <button onClick={() => scroll("right")} className="p-2 rounded-full border border-border hover:bg-muted transition-colors"><ChevronRight className="h-5 w-5" /></button>
            </div>
          </div>
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {displayed.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="min-w-[280px] max-w-[300px] bg-card rounded-xl shadow-md border border-border overflow-hidden flex-shrink-0 hover:shadow-lg hover:border-primary/50 transition-all text-left group"
              >
                <div className="relative h-48">
                  {item.imageBase64
                    ? <img src={item.imageBase64} alt={item.titleMr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full bg-muted flex items-center justify-center"><Calendar className="h-12 w-12 text-muted-foreground" /></div>
                  }
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {item.date}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {t("अधिक पहा", "Read more")}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-base mb-1 line-clamp-2">{lang === "mr" ? item.titleMr : (item.titleEn || item.titleMr)}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{lang === "mr" ? item.descMr : (item.descEn || item.descMr)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selected && <RoutineModal item={selected} lang={lang} onClose={() => setSelected(null)} />}
    </>
  );
};

export default MayorRoutine;
