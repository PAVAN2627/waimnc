import { useEffect, useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Video, Calendar, FileText, Download, Play, Clock, ExternalLink, Sparkles, Radio, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveSabha, type SabhaRecord } from "@/lib/sabha";

/** Convert any YouTube / youtu.be URL to an embeddable URL */
function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/embed/")) return url;
    if (u.hostname === "youtu.be") {
      const id = u.pathname.slice(1);
      return `https://www.youtube.com/embed/${id}`;
    }
    const v = u.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
    const liveMatch = u.pathname.match(/\/live\/([^/?]+)/);
    if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}`;
    const shortsMatch = u.pathname.match(/\/shorts\/([^/?]+)/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  } catch {
    // Return null if invalid URL
  }
  return null;
}

const VideoEmbed = ({ url, title }: { url: string; title: string }) => {
  const embedUrl = toEmbedUrl(url);
  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <button className="px-4 py-2 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5">
          <ExternalLink className="w-4 h-4" />
          <span>{title}</span>
        </button>
      </a>
    );
  }
  return (
    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/20 shadow-2xl">
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};

const LiveSabhaPage = () => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<SabhaRecord[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToActiveSabha(setItems);
  }, []);

  const upcoming = items.filter((i) => i.type === "upcoming");
  const previous = items.filter((i) => i.type === "previous");
  const liveNow = upcoming.find((i) => i.videoUrl);

  const title = (item: SabhaRecord) => lang === "mr" ? item.titleMr : (item.titleEn || item.titleMr);

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* Header Title */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Radio className="w-3.5 h-3.5 text-red-300 animate-pulse" />
                    {t("सार्वजनिक लोकशाही सभा", "Democratic Live Council Broadcast")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3">
                    <span>{t("लाईव्ह सभा व अजेंडा", "Live Sabha Broadcast")}</span>
                  </h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "वाई नगरपरिषदेच्या सर्वसाधारण सभांचे थेट थेट व्हिडिओ प्रसारण, अजेंडा व इतिवृत्त दस्तऐवज.",
                      "Official live streaming of Wai Municipal Council General Meetings, agenda PDFs & minutes."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  🏛️
                </div>
              </div>
            </div>

            {/* Live Broadcast Stream Card */}
            <div className="bg-card rounded-3xl border-2 border-red-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600" />
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-500 text-white font-extrabold text-xs tracking-wider shadow-md">
                    LIVE BROADCAST
                  </span>
                  <h2 className="font-extrabold text-base md:text-lg text-foreground">
                    {liveNow ? title(liveNow) : t("सर्वसाधारण सभा - थेट प्रसारण", "General Body Council Meeting")}
                  </h2>
                </div>

                <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                  {liveNow ? t("थेट प्रक्षेपण सुरू आहे", "Streaming Live") : t("सध्या कोणतीही सभा सुरू नाही", "No active live session")}
                </span>
              </div>

              {/* Player Container */}
              {liveNow?.videoUrl ? (
                <VideoEmbed url={liveNow.videoUrl} title={title(liveNow)} />
              ) : (
                <div className="aspect-video bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-center relative overflow-hidden p-6 shadow-inner">
                  <div className="text-center space-y-3 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 text-white/60 mx-auto flex items-center justify-center text-3xl border border-white/20">
                      📹
                    </div>
                    <h3 className="text-lg font-bold text-white">{t("पुढील सभेचे थेट प्रसारण", "Next Live Meeting Stream")}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        "नगरपालिकेची सर्वसाधारण सभा सुरू झाल्यावर येथे यूट्यूबवर थेट डिजिटल प्रसारण दिसेल.",
                        "Live stream will automatically appear here when the council meeting is convened."
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Meetings Section */}
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  <span>{t("आगामी सभा व अजेंडा", "Upcoming Council Meetings")}</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                  {upcoming.map((s) => (
                    <div key={s.id} className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {title(s)}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground font-mono">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>{s.date}</span>
                        </div>
                      </div>

                      {s.time && (
                        <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-muted/60 p-2.5 rounded-xl border border-border">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{t("सभेची वेळ", "Meeting Time")}: {s.time}</span>
                        </div>
                      )}

                      {s.minutesBase64 && (
                        <a href={s.minutesBase64} download={s.minutesName || "agenda.pdf"} className="block">
                          <button className="w-full py-2.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                            <FileText className="w-4 h-4 text-primary" />
                            <span>{t("विषयपत्रिका (अजेंडा) डाउनलोड", "Download Agenda PDF")}</span>
                          </button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Meetings Section */}
            {previous.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  <span>{t("मागील सभांचे रेकॉर्डिंग व इतिवृत्त", "Past Meeting Archives & Minutes")}</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {previous.map((s) => (
                    <div key={s.id} className="bg-card rounded-3xl border border-border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      {s.videoUrl && <VideoEmbed url={s.videoUrl} title={title(s)} />}
                      <div className="p-5 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-sm text-foreground group-hover:text-primary transition-colors">{title(s)}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{s.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {s.minutesBase64 && (
                            <a href={s.minutesBase64} download={s.minutesName || "minutes.pdf"}>
                              <button className="px-3.5 py-2 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1">
                                <Download className="w-3.5 h-3.5" />
                                <span>{t("इतिवृत्त PDF", "Minutes")}</span>
                              </button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LiveSabhaPage;
