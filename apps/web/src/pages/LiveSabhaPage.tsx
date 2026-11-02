import { useEffect, useState, useMemo } from "react";
import PageLayout from "@/components/PageLayout";
import { Video, Calendar, FileText, Download, Play, Clock, ExternalLink, Radio, CheckCircle2, Search, Filter, Sparkles, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  subscribeToActiveSabha, sortSabhaNewestFirst, SABHA_CATEGORIES,
  type SabhaRecord, type SabhaCategory,
} from "@/lib/sabha";

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

const currentYear = new Date().getFullYear();

const LiveSabhaPage = () => {
  const { lang, t } = useLanguage();
  const [items, setItems] = useState<SabhaRecord[]>([]);

  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    return subscribeToActiveSabha(setItems);
  }, []);

  const title = (item: SabhaRecord) => (lang === "mr" ? item.titleMr : item.titleEn || item.titleMr);

  // Available years: strictly only show years that actually have recorded previous sabhas/tharav
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    items
      .filter((item) => item.type === "previous" || !item.type)
      .forEach((item) => {
        if (item.year) {
          yearsSet.add(item.year);
        } else if (item.date) {
          const y = parseInt(item.date.slice(0, 4), 10);
          if (!isNaN(y)) yearsSet.add(y);
        }
      });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [items]);

  // Reset selected year if selected year has no meetings
  useEffect(() => {
    if (selectedYear !== "all" && !availableYears.includes(Number(selectedYear))) {
      setSelectedYear("all");
    }
  }, [availableYears, selectedYear]);

  // Upcoming / Live meetings
  const upcoming = useMemo(() => {
    return sortSabhaNewestFirst(items.filter((i) => i.type === "upcoming"));
  }, [items]);

  const liveNow = upcoming.find((i) => i.videoUrl);

  // Previous meetings and resolutions (filtered & sorted newest first)
  const previousFiltered = useMemo(() => {
    let result = sortSabhaNewestFirst(items.filter((i) => i.type === "previous" || !i.type));

    if (selectedYear !== "all") {
      const y = parseInt(selectedYear, 10);
      result = result.filter((i) => i.year === y || (i.date && i.date.startsWith(selectedYear)));
    }

    if (selectedType !== "all") {
      result = result.filter((i) => i.sabhaType === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.titleMr.toLowerCase().includes(q) ||
          i.titleEn.toLowerCase().includes(q) ||
          (i.tharavNumber && i.tharavNumber.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedYear, selectedType, searchQuery]);

  const getSabhaTypeMeta = (type: SabhaCategory) => {
    return SABHA_CATEGORIES.find((c) => c.key === type) || SABHA_CATEGORIES[0];
  };

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-10">

            {/* Header Banner */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Radio className="w-3.5 h-3.5 text-red-300 animate-pulse" />
                    {t("सार्वजनिक लोकशाही कामकाज व ठराव", "Democratic Proceedings & Resolutions")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3">
                    <span>{t("सभा व ठराव (Sabha / Tharav)", "Council Meetings & Resolutions")}</span>
                  </h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "सर्वसाधारण सभा, विशेष सभा व स्थायी समिती सभांचे थेट प्रक्षेपण, कार्यसूची (अजेंडा) व मंजूर ठराव अधिकृत PDF दस्तऐवज.",
                      "Official live broadcast, agendas, minutes and passed resolutions of General Body, Special and Standing Committee meetings."
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
                    {liveNow ? title(liveNow) : t("सर्वसाधारण सभा - थेट डिजिटल प्रसारण", "General Body Council Meeting Broadcast")}
                  </h2>
                </div>

                <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                  {liveNow ? t("थेट प्रक्षेपण सुरू आहे", "Streaming Live") : t("सध्या थेट प्रक्षेपण उपलब्ध नाही", "No active live session")}
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
                    <h3 className="text-lg font-bold text-white">{t("पुढील सभेचे थेट प्रक्षेपण", "Next Live Meeting Stream")}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t(
                        "नगरपालिकेची सर्वसाधारण किंवा विशेष सभा सुरू झाल्यावर येथे अधिकृत डिजिटल थेट प्रक्षेपण दिसेल.",
                        "Live stream will automatically appear here when the council meeting is convened."
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Meetings Section (if any) */}
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-primary" />
                  <span>{t("आगामी सभा व विषयपत्रिका", "Upcoming Council Meetings")}</span>
                </h2>

                <div className="grid md:grid-cols-2 gap-5">
                  {upcoming.map((s) => {
                    const cat = getSabhaTypeMeta(s.sabhaType);
                    return (
                      <div key={s.id} className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${cat.badgeClass}`}>
                            {lang === "mr" ? cat.labelMr : cat.labelEn}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground font-mono">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span>{s.date}</span>
                          </div>
                        </div>

                        <h3 className="font-extrabold text-base text-foreground">{title(s)}</h3>

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
                    );
                  })}
                </div>
              </div>
            )}

            {/* Previous Meetings & Tharav Archives with Year & Type Filters */}
            <div className="space-y-6 pt-6 border-t">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary" />
                    <span>{t("मागील सभांचे इतिवृत्त व मंजूर ठराव", "Past Sabha Proceedings & Passed Tharav")}</span>
                  </h2>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    {t(
                      "वर्षानुसार व सभेच्या स्वरूपानुसार ठराव शोधा व अधिकृत PDF डाऊनलोड करा (नवीनतम आधी - Newest First).",
                      "Filter resolutions by year and meeting type. Download signed official PDFs."
                    )}
                  </p>
                </div>
              </div>

              {/* Filters Bar: 3 Types of Sabha Tabs + Year Selector + Search */}
              <div className="space-y-4">
                {/* 3 Sabha Types Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-card border border-border shadow-sm overflow-x-auto">
                  <button
                    onClick={() => setSelectedType("all")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                      selectedType === "all"
                        ? "gov-gradient text-white shadow-md"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t("सर्व सभा (All)", "All Types")}
                  </button>

                  {SABHA_CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setSelectedType(c.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                        selectedType === c.key
                          ? "gov-gradient text-white shadow-md"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {lang === "mr" ? c.labelMr : c.labelEn}
                    </button>
                  ))}
                </div>

                {/* Sub Bar: Year selection & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Year Badges - shown ONLY if there are actually previous sabhas recorded */}
                  {availableYears.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap flex items-center gap-1 mr-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{t("वर्ष निवडा:", "Year:")}</span>
                      </span>
                      <button
                        onClick={() => setSelectedYear("all")}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          selectedYear === "all"
                            ? "bg-primary text-primary-foreground font-black shadow-sm"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {t("सर्व वर्षे", "All Years")}
                      </button>
                      {availableYears.map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setSelectedYear(String(yr))}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            selectedYear === String(yr)
                              ? "bg-primary text-primary-foreground font-black shadow-sm"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-primary/70" />
                      <span>{t("सर्व उपलब्ध मागील सभा", "All Available Previous Meetings")}</span>
                    </div>
                  )}

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={t("ठराव क्र. किंवा विषय शोधा...", "Search tharav or topic...")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-card focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Resolutions Grid (Sorted Newest First) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {previousFiltered.map((s) => {
                  const cat = getSabhaTypeMeta(s.sabhaType);
                  const hasVideo = Boolean(s.videoUrl && s.videoUrl.trim());
                  const hasPdf = Boolean(s.minutesBase64 && s.minutesBase64.trim());

                  return (
                    <div
                      key={s.id}
                      className="bg-card rounded-3xl border border-border shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col justify-between"
                    >
                      {/* Only embed video if valid videoUrl was provided */}
                      {hasVideo && <VideoEmbed url={s.videoUrl} title={title(s)} />}

                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${cat.badgeClass}`}>
                              {lang === "mr" ? cat.labelMr : cat.labelEn}
                            </span>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono font-bold">
                              <Calendar className="w-3.5 h-3.5 text-primary" />
                              <span>{s.date}</span>
                            </div>
                          </div>

                          {s.tharavNumber && (
                            <span className="inline-block text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                              {s.tharavNumber}
                            </span>
                          )}

                          <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors leading-snug">
                            {title(s)}
                          </h3>
                        </div>

                        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span>{t("अधिकृत अभिलेख", "Official Record")}</span>
                          </span>

                          {/* Action Logos: YouTube Logo to watch, PDF logo to view/read */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* YouTube Logo (Optional - hidden if no video link) */}
                            {hasVideo && (
                              <a
                                href={s.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all flex-shrink-0"
                                title={t("यूट्यूबवर व्हिडिओ पहा", "Watch on YouTube")}
                              >
                                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                <span>{t("व्हिडिओ पहा", "Watch Video")}</span>
                              </a>
                            )}

                            {/* PDF Logo (Optional - hidden if no PDF uploaded) */}
                            {hasPdf && (
                              <a
                                href={s.minutesBase64}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all flex-shrink-0"
                                title={t("ठराव / इतिवृत्त PDF वाचा", "View / Read PDF")}
                              >
                                <FileText className="w-4 h-4 text-emerald-100 flex-shrink-0" />
                                <span>{t("ठराव PDF वाचा", "View/Read PDF")}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {previousFiltered.length === 0 && (
                <div className="p-12 text-center bg-card rounded-3xl border text-muted-foreground space-y-3">
                  <FileText className="w-12 h-12 mx-auto opacity-40 text-muted-foreground" />
                  <h3 className="font-bold text-base text-foreground">
                    {t("निवडलेल्या निकषांनुसार कोणतेही इतिवृत्त किंवा ठराव उपलब्ध नाहीत.", "No proceedings or resolutions match your filter.")}
                  </h3>
                  <p className="text-xs">
                    {t("कृपया वर्ष किंवा सभेचा प्रकार बदलून तपासा.", "Please try changing the year or meeting type filter.")}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LiveSabhaPage;
