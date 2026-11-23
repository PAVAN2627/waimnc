import { useState, useEffect } from "react";
import { Search, CheckCircle2, Clock, AlertCircle, LoaderCircle, ShieldCheck, ExternalLink, Phone, FileText, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getComplaintByTrackingId, getComplaintsByMobile, formatComplaintDate, type ComplaintRecord } from "@/lib/complaints";
import FormattedDescription from "./FormattedDescription";
import { validateMobileInput, sanitizeMobileInput } from "@/lib/validation";

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
  const [searchMode, setSearchMode] = useState<"mobile" | "id">("mobile");
  const [trackingId, setTrackingId] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<ComplaintRecord | null | "not-found">(null);
  const [mobileResults, setMobileResults] = useState<ComplaintRecord[] | null | "not-found">(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const mobileParam = params.get("mobile");

    if (idParam) {
      setTrackingId(idParam);
      setSearchMode("id");
    }
    if (mobileParam) {
      setMobile(mobileParam);
    }

    if (idParam && mobileParam && /^[0-9]{10}$/.test(mobileParam.trim())) {
      setLoading(true);
      getComplaintByTrackingId(idParam.trim().toUpperCase(), mobileParam.trim())
        .then((record) => {
          setSingleResult(record ?? "not-found");
        })
        .catch((err) => {
          console.error("Auto track error:", err);
          setError(t("शोधताना त्रुटी आली. पुन्हा प्रयत्न करा.", "Error while searching. Please try again."));
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [t]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSingleResult(null);
    setMobileResults(null);

    const mobileCheck = validateMobileInput(mobile, lang);
    if (!mobileCheck.isValid) {
      setError(mobileCheck.error || t("कृपया १० अंकी मोबाइल नंबर टाका", "Enter a valid 10-digit mobile number"));
      return;
    }

    if (searchMode === "mobile") {
      try {
        setLoading(true);
        const records = await getComplaintsByMobile(mobile.trim());
        if (records.length === 0) {
          setMobileResults("not-found");
        } else {
          setMobileResults(records);
        }
      } catch (err) {
        console.error("Track by mobile error:", err);
        setError(t("शोधताना त्रुटी आली. पुन्हा प्रयत्न करा.", "Error while searching. Please try again."));
      } finally {
        setLoading(false);
      }
    } else {
      const id = trackingId.trim().toUpperCase();
      if ((!id.startsWith("TK-") && !id.startsWith("WMC-")) || id.length < 5) {
        setError(t("कृपया वैध ट्रॅकिंग आयडी टाका (उदा. TK-XXXXXXXX किंवा WMC-XXXX)", "Enter a valid Tracking ID (e.g. TK-XXXXXXXX or WMC-XXXX)"));
        return;
      }

      try {
        setLoading(true);
        const record = await getComplaintByTrackingId(id, mobile.trim());
        setSingleResult(record ?? "not-found");
      } catch (err) {
        console.error("Track complaint error:", err);
        setError(t("शोधताना त्रुटी आली. पुन्हा प्रयत्न करा.", "Error while searching. Please try again."));
      } finally {
        setLoading(false);
      }
    }
  };

  const statusLabel: Record<string, string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण झाले", "Resolved"),
  };

  const renderComplaintCard = (record: ComplaintRecord, index?: number) => {
    const cfg = statusConfig[record.status] || statusConfig.pending;
    const Icon = cfg.icon;
    const displayId = record.trackingId || (record.id.startsWith("TK-") ? record.id : `TK-${record.id.slice(-6).toUpperCase()}`);

    return (
      <div key={record.id || index} className="bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-8 space-y-6 animate-in fade-in duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${cfg.bg}`}>
              <Icon className={`h-6 w-6 ${cfg.color}`} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-semibold">{t("तक्रार / अर्ज क्रमांक", "Tracking ID")}</span>
              <h3 className="font-mono font-black text-xl text-foreground">{displayId}</h3>
            </div>
          </div>
          <span className={`text-xs font-black px-3.5 py-1.5 rounded-full ${cfg.badge}`}>
            {statusLabel[record.status] || record.status}
          </span>
        </div>

        {/* Grid Details */}
        <div className="grid grid-cols-2 gap-4 text-xs md:text-sm">
          <div className="p-3 rounded-2xl bg-muted/50 border border-border">
            <p className="text-[10px] text-muted-foreground font-semibold">{t("अर्जदार नाव / संपर्क", "Applicant Details")}</p>
            <p className="font-bold text-foreground mt-0.5">{record.name || record.mobile}</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/50 border border-border">
            <p className="text-[10px] text-muted-foreground font-semibold">{t("प्रभाग / वॉर्ड", "Ward Number")}</p>
            <p className="font-bold text-foreground mt-0.5">{record.ward ? t(`वार्ड क्र. ${record.ward}`, `Ward ${record.ward}`) : "—"}</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/50 border border-border">
            <p className="text-[10px] text-muted-foreground font-semibold">{t("विभागाचे नाव", "Department")}</p>
            <p className="font-bold text-primary mt-0.5">{record.department}</p>
          </div>
          <div className="p-3 rounded-2xl bg-muted/50 border border-border">
            <p className="text-[10px] text-muted-foreground font-semibold">{t("नोंदणी दिनांक", "Submitted On")}</p>
            <p className="font-bold text-foreground mt-0.5">{formatComplaintDate(record.createdAt, lang)}</p>
          </div>
          <div className="col-span-2 p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-wider">{t("तक्रारीचा सविस्तर तपशील", "Detailed Description")}</p>
            <FormattedDescription description={record.description} />
          </div>
        </div>

        {/* Resolution Proof Card (If Marked Resolved with Image Proof) */}
        {record.status === "resolved" && record.resolutionProof?.url && (
          <div className="p-4 md:p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-xs md:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {t("काम पूर्ण झाल्याचा अधिकृत पुरावा / छायाचित्र", "Official Work Completion Proof Photo")}
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 uppercase">
                {t("प्रमाणित निराकरण", "Verified Proof")}
              </span>
            </div>

            <div className="bg-card/70 rounded-xl p-2 border border-emerald-500/20 max-w-md mx-auto text-center">
              <a
                href={record.resolutionProof.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative group overflow-hidden rounded-lg border border-emerald-500/30 bg-black/5"
              >
                <img
                  src={record.resolutionProof.url}
                  alt={t("कामाचा पुरावा", "Work Proof")}
                  className="w-full max-h-72 object-contain group-hover:scale-105 transition-transform duration-300 mx-auto"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                  <ExternalLink className="w-4 h-4" />
                  <span>{t("मोठ्या आकारात पहा", "View Full Size")}</span>
                </div>
              </a>
            </div>

            {record.resolutionProof.notes && (
              <p className="text-xs text-foreground bg-card/60 p-2.5 rounded-xl border border-emerald-500/20 italic">
                📝 {record.resolutionProof.notes}
              </p>
            )}

            {record.resolutionProof.resolvedAt && (
              <p className="text-[10px] text-muted-foreground text-right">
                {t("निराकरण दिनांक: ", "Resolved On: ")}
                {new Date(record.resolutionProof.resolvedAt).toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        )}

        {/* Animated Status Workflow Progress */}
        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>{t("अर्जाची प्रगती स्थिती (Live Workflow Timeline)", "Live Progress Timeline")}</span>
          </p>

          <div className="grid grid-cols-3 gap-2 relative pt-2">
            {(["pending", "in-progress", "resolved"] as const).map((s, i) => {
              const steps = ["pending", "in-progress", "resolved"];
              const currentIdx = steps.indexOf(record.status);
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
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("डिजिटल पारदर्शक शासन", "Transparent Civic Tracking")}
            </span>
            <h2 className="text-3xl font-black text-white">{t("अर्ज व तक्रार स्थिती ट्रॅक करा", "Track Application Status")}</h2>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1 max-w-md mx-auto">
              {t("मोबाईल नंबर किंवा ट्रॅकिंग आयडी टाकून आपल्या तक्रारीची सद्यस्थिती तपासा.", "Enter your mobile number or Tracking ID to check real-time progress.")}
            </p>
          </div>

          {/* Search Card Form */}
          <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex p-1.5 bg-muted/60 rounded-2xl border border-border/80">
              <button
                type="button"
                onClick={() => {
                  setSearchMode("mobile");
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  searchMode === "mobile"
                    ? "gov-gradient text-white shadow-md scale-[1.01]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>{t("मोबाईल नंबरने शोधा (आयडी विसरलात?)", "Search by Mobile (Forgot ID?)")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode("id");
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  searchMode === "id"
                    ? "gov-gradient text-white shadow-md scale-[1.01]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Search className="w-4 h-4" />
                <span>{t("तक्रार आयडीने शोधा", "Search by Complaint ID")}</span>
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              {searchMode === "mobile" ? (
                /* Mobile Search Only */
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">
                      {t("नोंदणीकृत मोबाइल नंबर *", "Registered Mobile Number *")}
                    </label>
                    <span className="text-[10px] font-mono text-muted-foreground">{mobile.length}/10 {t("अंक", "digits")}</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        setMobile(sanitizeMobileInput(e.target.value));
                        if (error) setError(null);
                      }}
                      placeholder="98XXXXXXXX"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground pt-0.5">
                    {t("हा नंबर टाकून तुम्ही दाखल केलेल्या सर्व तक्रारींची यादी व कामाचा फोटो पाहू शकता.", "Enter this number to view all complaints registered with this phone and resolution photos.")}
                  </p>
                </div>
              ) : (
                /* Tracking ID + Mobile */
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">{t("ट्रॅकिंग आयडी *", "Tracking ID *")}</label>
                    <input
                      type="text"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                      placeholder="TK-2026-001 / WMC-XXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                      <span className="text-[10px] font-mono text-muted-foreground">{mobile.length}/10 {t("अंक", "digits")}</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        setMobile(sanitizeMobileInput(e.target.value));
                        if (error) setError(null);
                      }}
                      placeholder="98XXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-xs text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      required
                    />
                  </div>
                </div>
              )}

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
                <span>
                  {loading
                    ? t("तपासत आहे...", "Checking...")
                    : searchMode === "mobile"
                    ? t("माझ्या सर्व तक्रारी शोधा", "Find All My Complaints")
                    : t("तक्रार स्थिती तपासा", "Check Complaint Status")}
                </span>
              </button>
            </form>
          </div>

          {/* Result Not Found Card */}
          {(singleResult === "not-found" || mobileResults === "not-found") && (
            <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h3 className="text-base font-bold text-red-600 dark:text-red-400">{t("कोणतीही नोंद सापडली नाही.", "No record found.")}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchMode === "mobile"
                  ? t("या मोबाईल नंबरशी संबंधित कोणतीही तक्रार आढळली नाही. कृपया योग्य नंबर प्रविष्ट करा.", "No complaints found linked to this mobile number. Please check the number.")
                  : t("कृपया ट्रॅकिंग आयडी व मोबाइल नंबर तपासून पुन्हा प्रयत्न करा.", "Please double-check your Tracking ID and registered mobile number.")}
              </p>
            </div>
          )}

          {/* Single Result by Tracking ID */}
          {singleResult && singleResult !== "not-found" && renderComplaintCard(singleResult)}

          {/* Multiple Results by Mobile Number */}
          {Array.isArray(mobileResults) && mobileResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <span className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  {t("मोबाईल क्रमांकाशी संबंधित तक्रारी:", "Complaints for mobile number:")}{" "}
                  <span className="font-mono text-primary font-black">{mobile}</span>
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary text-primary-foreground">
                  {mobileResults.length} {t("तक्रारी", "Complaints")}
                </span>
              </div>

              {mobileResults.map((rec, idx) => renderComplaintCard(rec, idx))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default TrackApplication;