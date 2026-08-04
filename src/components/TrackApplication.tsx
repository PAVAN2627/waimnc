import { useState } from "react";
import { Search, CheckCircle2, Clock, AlertCircle, LoaderCircle, Sparkles, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getComplaintByTrackingId, formatComplaintDate, type ComplaintRecord } from "@/lib/complaints";

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/30",
    badge: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30",
  },
  "in-progress": {
    icon: AlertCircle,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/30",
    badge: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30",
  },
  resolved: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/30",
    badge: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
  },
};

const TrackApplication = () => {
  const { t, lang } = useLanguage();
  const [trackingId, setTrackingId] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplaintRecord | null | "not-found">(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const id = trackingId.trim().toUpperCase();
    if (!id.startsWith("TK-") || id.length < 5) {
      setError(t("कृपया वैध ट्रॅकिंग आयडी टाका (उदा. TK-XXXXXXXX)", "Enter a valid Tracking ID (e.g. TK-XXXXXXXX)"));
      return;
    }
    if (!/^[0-9]{10}$/.test(mobile.trim())) {
      setError(t("कृपया १० अंकी मोबाइल नंबर टाका", "Enter a valid 10-digit mobile number"));
      return;
    }
    if (!isFirebaseConfigured) {
      // Fallback mock result for demonstration if Firebase not configured
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setResult({
          id: id,
          name: "प्रशांत पाटील",
          ward: "5",
          type: "जलवाहिनी पाणी गळती तक्रार",
          department: "पाणी पुरवठा विभाग",
          description: "गणपती आळी मुख्य रस्त्यावर जलवाहिनी गळती दुरुस्ती अर्ज.",
          status: "in-progress",
          mobile: mobile.trim(),
          createdAt: new Date().toISOString(),
        } as ComplaintRecord);
      }, 1000);
      return;
    }

    try {
      setLoading(true);
      const record = await getComplaintByTrackingId(id, mobile.trim());
      setResult(record ?? "not-found");
    } catch (err) {
      console.error("Track complaint error:", err);
      setError(t("शोधताना त्रुटी आली. पुन्हा प्रयत्न करा.", "Error while searching. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण झाले", "Resolved"),
  };

  return (
    <section id="track" className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* Hero Banner Card */}
          <div className="gov-gradient rounded-3xl p-8 text-primary-foreground shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-bl-full pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg">
              🎯
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              {t("डिजिटल पारदर्शक शासन", "Transparent Civic Tracking")}
            </span>
            <h2 className="text-3xl font-black text-white">{t("अर्ज व तक्रार स्थिती ट्रॅक करा", "Track Application Status")}</h2>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1 max-w-md mx-auto">
              {t("आपला ट्रॅकिंग आयडी आणि नोंदणीकृत मोबाइल नंबर टाकून स्थिती तपासा.", "Enter your Tracking ID and registered mobile number to track real-time progress.")}
            </p>
          </div>

          {/* Search Card Form */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl space-y-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">{t("ट्रॅकिंग आयडी *", "Tracking ID *")}</label>
                  <input
                    type="text"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                    placeholder="TK-2026-001"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="98XXXXXXXX"
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              {/* Sample Quick Demo Chips */}
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1 flex-wrap">
                <span>{t("नमुना ट्रॅकिंग आयडी:", "Demo ID:")}</span>
                <button
                  type="button"
                  onClick={() => { setTrackingId("TK-2026-001"); setMobile("9823456789"); }}
                  className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-mono font-bold hover:bg-primary/20 transition-colors"
                >
                  TK-2026-001
                </button>
              </div>

              {error && <p className="text-xs font-semibold text-destructive bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl gov-gradient text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{loading ? t("शोधत आहे...", "Searching...") : t("प्रगती व स्थिती तपासा", "Check Application Status")}</span>
              </button>
            </form>
          </div>

          {/* Result Not Found Card */}
          {result === "not-found" && (
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">{t("कोणतीही नोंद सापडली नाही.", "No record found.")}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {t("कृपया ट्रॅकिंग आयडी व मोबाइल नंबर तपासून पुन्हा प्रयत्न करा.", "Please double-check your Tracking ID and registered mobile number.")}
              </p>
            </div>
          )}

          {/* Found Result Card */}
          {result && result !== "not-found" && (() => {
            const cfg = statusConfig[result.status];
            const Icon = cfg.icon;
            return (
              <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
                
                {/* Result Header Bar */}
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${cfg.bg}`}>
                      <Icon className={`h-6 w-6 ${cfg.color}`} />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground font-semibold">{t("अर्ज क्रमांक", "Tracking ID")}</span>
                      <h3 className="font-mono font-black text-xl text-foreground">{result.id.startsWith("TK-") ? result.id : `TK-${result.id.slice(-6).toUpperCase()}`}</h3>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-3.5 py-1.5 rounded-full ${cfg.badge}`}>
                    {statusLabel[result.status]}
                  </span>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("अर्जदार नाव", "Applicant Name")}</p>
                    <p className="font-bold text-foreground mt-0.5">{result.name}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("प्रभाग / वॉर्ड", "Ward Number")}</p>
                    <p className="font-bold text-foreground mt-0.5">{result.ward ? t(`वार्ड क्र. ${result.ward}`, `Ward ${result.ward}`) : "—"}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("विभागाचे नाव", "Department")}</p>
                    <p className="font-bold text-primary mt-0.5">{result.department}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("नोंदणी दिनांक", "Submitted On")}</p>
                    <p className="font-bold text-foreground mt-0.5">{formatComplaintDate(result.createdAt, lang)}</p>
                  </div>
                  <div className="col-span-2 p-3 rounded-2xl bg-muted/50 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">{t("अर्जाचा विषय / वर्णन", "Request Description")}</p>
                    <p className="font-bold text-foreground mt-0.5">{result.description}</p>
                  </div>
                </div>

                {/* Animated Status Workflow Progress */}
                <div className="pt-4 border-t border-border space-y-3">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>{t("अर्जाची प्रगती स्थिती (Live Workflow Timeline)", "Live Progress Timeline")}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-2 relative pt-2">
                    {(["pending", "in-progress", "resolved"] as const).map((s, i) => {
                      const steps = ["pending", "in-progress", "resolved"];
                      const currentIdx = steps.indexOf(result.status);
                      const done = i <= currentIdx;
                      return (
                        <div key={s} className="flex flex-col items-center text-center space-y-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border-2 shadow-md transition-all ${
                            done ? "gov-gradient text-white border-white scale-110" : "bg-card border-border text-muted-foreground"
                          }`}>
                            {i + 1}
                          </div>
                          <p className={`text-[11px] font-bold ${done ? "text-primary" : "text-muted-foreground"}`}>
                            {statusLabel[s]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            );
          })()}

        </div>
      </div>
    </section>
  );
};

export default TrackApplication;
