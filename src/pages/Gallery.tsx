import { useEffect, useState } from "react";
import { Play, ImageIcon, X, ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/PageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveGallery, type GalleryRecord } from "@/lib/gallery";
import { subscribeToActiveRoutine, type RoutineRecord } from "@/lib/routine";
import { useLocation } from "react-router-dom";

const Gallery = () => {
  const { lang, t } = useLanguage();
  const location = useLocation();
  const defaultTab = (location.state as { tab?: string } | null)?.tab === "routine" ? "routine" : "photos";
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [routines, setRoutines] = useState<RoutineRecord[]>([]);
  const [lightbox, setLightbox] = useState<{ index: number; list: GalleryRecord[] } | null>(null);
  const [routineLightbox, setRoutineLightbox] = useState<{ index: number } | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const u1 = subscribeToActiveGallery(setItems);
    const u2 = subscribeToActiveRoutine(setRoutines);
    return () => { u1(); u2(); };
  }, []);

  const photos = items.filter((i) => i.type === "photo");
  const videos = items.filter((i) => i.type === "video");

  const openLightbox = (index: number, list: GalleryRecord[]) => setLightbox({ index, list });
  const closeLightbox = () => setLightbox(null);

  const prev = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.list.length) % lightbox.list.length });
  const next = () => lightbox && setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.list.length });

  // keyboard nav
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  // routine lightbox keyboard
  useEffect(() => {
    if (!routineLightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setRoutineLightbox((r) => r ? { index: (r.index - 1 + routines.length) % routines.length } : null);
      else if (e.key === "ArrowRight") setRoutineLightbox((r) => r ? { index: (r.index + 1) % routines.length } : null);
      else if (e.key === "Escape") setRoutineLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [routineLightbox, routines.length]);

  const active = lightbox ? lightbox.list[lightbox.index] : null;

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Hero Card */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("छायाचित्र व चित्रीकरण दालन", "Photo & Video Gallery")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">{t("नगरपरिषद गॅलरी", "Official Gallery")}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "वाई नगरपरिषदेचे विविध उपक्रम, विकास कामे, सण-उत्सव आणि मा. नगराध्यक्षांचा दैनंदिन दिनक्रम.",
                      "Official photo gallery, video events, developmental projects & Mayor's daily routines."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  📸
                </div>
              </div>
            </div>

            {/* Gallery Tabs */}
            <Tabs defaultValue={defaultTab}>
              <TabsList className="p-1.5 bg-card border border-border rounded-2xl gap-2 shadow-sm w-full sm:w-auto overflow-x-auto justify-start">
                <TabsTrigger value="photos" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                  🖼️ {t("फोटो गॅलरी", "Photo Gallery")} ({photos.length})
                </TabsTrigger>
                <TabsTrigger value="videos" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                  🎥 {t("व्हिडिओ गॅलरी", "Video Gallery")} ({videos.length})
                </TabsTrigger>
                <TabsTrigger value="routine" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                  📅 {t("दैनंदिन दिनक्रम", "Daily Routines")} ({routines.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photos" className="mt-6">
                {photos.length === 0 && (
                  <div className="p-12 text-center bg-card rounded-3xl border border-border text-muted-foreground shadow-sm">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">{t("कोणतेही फोटो उपलब्ध नाहीत.", "No photos available.")}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {photos.map((p, i) => (
                    <div
                      key={p.id}
                      className="bg-card rounded-3xl border border-border shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group"
                      onClick={() => openLightbox(i, photos)}
                    >
                      <div className="aspect-video bg-primary/10 flex items-center justify-center overflow-hidden relative border-b border-border/50">
                        {p.imageBase64 ? (
                          <img src={p.imageBase64} alt={p.titleMr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <span className="text-white text-xs font-black bg-primary/90 px-4 py-1.5 rounded-full shadow-lg border border-white/20">
                            {t("पहा", "View")} 🔍
                          </span>
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors truncate">{lang === "mr" ? p.titleMr : (p.titleEn || p.titleMr)}</p>
                        <p className="text-[11px] text-muted-foreground font-mono font-semibold">{p.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="videos" className="mt-6">
                {videos.length === 0 && (
                  <div className="p-12 text-center bg-card rounded-3xl border border-border text-muted-foreground shadow-sm">
                    <Play className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">{t("कोणतेही व्हिडिओ उपलब्ध नाहीत.", "No videos available.")}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {videos.map((v) => (
                    <div
                      key={v.id}
                      className="bg-card rounded-3xl border border-border shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group"
                      onClick={() => v.videoUrl && window.open(v.videoUrl, "_blank", "noopener,noreferrer")}
                    >
                      <div className="aspect-video bg-slate-900 flex items-center justify-center relative overflow-hidden">
                        {v.imageBase64 && <img src={v.imageBase64} alt={v.titleMr} className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors">
                          <div className="w-14 h-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 ml-1 fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors truncate">{lang === "mr" ? v.titleMr : (v.titleEn || v.titleMr)}</p>
                        <p className="text-[11px] text-muted-foreground font-mono font-semibold">{v.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Daily Routines tab */}
              <TabsContent value="routine" className="mt-6">
                {routines.length === 0 && (
                  <div className="p-12 text-center bg-card rounded-3xl border border-border text-muted-foreground shadow-sm">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">{t("कोणतेही दिनक्रम उपलब्ध नाहीत.", "No routine entries available.")}</p>
                  </div>
                )}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {routines.map((r, i) => (
                    <div
                      key={r.id}
                      className="bg-card rounded-3xl border border-border shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden cursor-pointer group"
                      onClick={() => setRoutineLightbox({ index: i })}
                    >
                      <div className="aspect-video bg-primary/10 flex items-center justify-center overflow-hidden relative">
                        {r.imageBase64 ? (
                          <img src={r.imageBase64} alt={r.titleMr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <Calendar className="h-10 w-10 text-muted-foreground" />
                        )}
                        <div className="absolute top-2.5 left-2.5 bg-primary text-primary-foreground text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-md">
                          {r.date}
                        </div>
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors truncate">{lang === "mr" ? r.titleMr : (r.titleEn || r.titleMr)}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{lang === "mr" ? r.descMr : (r.descEn || r.descMr)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && active && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4" onClick={closeLightbox}>
          <button className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30" onClick={closeLightbox}>
            <X className="w-6 h-6" />
          </button>
          {lightbox.list.length > 1 && (
            <>
              <button className="absolute left-6 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30" onClick={(e) => { e.stopPropagation(); prev(); }}>
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button className="absolute right-6 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30" onClick={(e) => { e.stopPropagation(); next(); }}>
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <div className="max-w-4xl max-h-[75vh] p-2 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {active.imageBase64 && (
              <img src={active.imageBase64} alt={title(active)} className="max-h-[65vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/20" />
            )}
            <div className="text-center mt-4 text-white">
              <p className="text-lg font-black">{lang === "mr" ? active.titleMr : (active.titleEn || active.titleMr)}</p>
              <p className="text-xs text-white/70 font-mono mt-1">{active.date} • {lightbox.index + 1} / {lightbox.list.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Routine Lightbox */}
      {routineLightbox && routines[routineLightbox.index] && (() => {
        const r = routines[routineLightbox.index];
        return (
          <div className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4" onClick={() => setRoutineLightbox(null)}>
            <button className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30" onClick={() => setRoutineLightbox(null)}>
              <X className="w-6 h-6" />
            </button>
            {routines.length > 1 && (
              <>
                <button className="absolute left-6 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30" onClick={(e) => { e.stopPropagation(); setRoutineLightbox({ index: (routineLightbox.index - 1 + routines.length) % routines.length }); }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button className="absolute right-6 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30" onClick={(e) => { e.stopPropagation(); setRoutineLightbox({ index: (routineLightbox.index + 1) % routines.length }); }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="max-w-2xl max-h-[80vh] p-4 flex flex-col items-center bg-card rounded-3xl border border-border shadow-2xl text-card-foreground" onClick={(e) => e.stopPropagation()}>
              {r.imageBase64 && (
                <img src={r.imageBase64} alt={r.titleMr} className="max-h-[50vh] max-w-full object-contain rounded-2xl shadow-lg border border-border" />
              )}
              <div className="text-center mt-4 space-y-2">
                <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-0.5 rounded-full">{r.date}</span>
                <h3 className="text-xl font-black">{lang === "mr" ? r.titleMr : (r.titleEn || r.titleMr)}</h3>
                {r.descMr && <p className="text-xs text-muted-foreground max-w-md">{lang === "mr" ? r.descMr : (r.descEn || r.descMr)}</p>}
              </div>
            </div>
          </div>
        );
      })()}
    </PageLayout>
  );
};

export default Gallery;
