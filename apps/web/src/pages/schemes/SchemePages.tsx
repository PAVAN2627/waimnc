import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { CheckCircle2, Users, Calendar, ExternalLink, ArrowRight, Gift, ShieldCheck, FileText, Send, X, Copy, Check, LoaderCircle, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createComplaint } from "@/lib/complaints";
import { validateMobileInput, sanitizeMobileInput } from "@/lib/validation";
import { subscribeToActiveSchemes, subscribeToCategorySchemes, type SchemeRecord, type SchemeCategory } from "@/lib/schemes";
import { ApplySchemeModal } from "./SchemesPage";

interface SchemeData {
  title: string; titleEn: string;
  subtitle: string; subtitleEn: string;
  desc: string; descEn: string;
  eligibility: string[]; eligibilityEn: string[];
  benefits: string[]; benefitsEn: string[];
  schemes?: { name: string; nameEn: string; status: string; statusEn: string; beneficiaries: string; beneficiariesEn: string; desc: string; descEn: string }[];
}

export const SchemePage = ({ data }: { data: SchemeData }) => {
  const { t, lang } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [mobileValue, setMobileValue] = useState("");
  const [applicantMobile, setApplicantMobile] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = () => {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string) || "";
    const mobile = (formData.get("mobile") as string) || mobileValue;
    const aadhaar = (formData.get("aadhaar") as string) || "";
    const address = (formData.get("address") as string) || "";

    const mobileCheck = validateMobileInput(mobile, lang);
    if (!mobileCheck.isValid) {
      setError(mobileCheck.error || t("कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.", "Please enter a valid 10-digit mobile number."));
      return;
    }

    try {
      setSubmitting(true);
      setApplicantMobile(mobileCheck.cleaned);
      const res = await createComplaint({
        name: name.trim(),
        mobile: mobileCheck.cleaned,
        ward: "1",
        type: `शासकीय योजना: ${data.title}`,
        department: "शासकीय योजना व उपक्रम",
        description: [
          `[शासकीय योजना ऑनलाइन अर्ज]`,
          `योजनेचे नाव: ${data.title}`,
          `अर्जदाराचे नाव: ${name.trim()}`,
          `मोबाइल नंबर: ${mobileCheck.cleaned}`,
          `आधार क्रमांक: ${aadhaar.trim()}`,
          `पत्ता / शेरा: ${address.trim() || "नाही"}`,
        ].join("\n"),
      });

      const generatedId = res.trackingId || `WMC-${res.id.slice(0, 6).toUpperCase()}`;
      setTrackingId(generatedId);
      setMobileValue("");
    } catch (err) {
      console.error("Scheme apply error:", err);
      setError(err instanceof Error ? err.message : t("अर्ज नोंदवता आला नाही.", "Failed to submit."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
                <div className="bg-card text-card-foreground rounded-3xl max-w-md w-full border border-border shadow-2xl overflow-hidden relative my-auto">
                  <div className="gov-gradient text-primary-foreground p-6 pr-14 relative">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setTrackingId(null);
                        setError(null);
                      }}
                      aria-label="Close Modal"
                      className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all hover:scale-110 shadow-lg border border-white/30"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                      {t("योजना अर्ज नोंदणी", "Scheme Application")}
                    </span>
                    <h2 className="text-xl font-black text-white mt-1 leading-snug">{t(data.title, data.titleEn)}</h2>
                  </div>

                  <div className="p-6">
                    {trackingId ? (
                      <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center text-3xl shadow-lg">
                          ✓
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                            {t("योजना अर्ज यशस्वीरित्या नोंदवला!", "Scheme Request Registered!")}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {t("आपला अर्ज प्रशासनाकडे यशस्वीपणे प्राप्त झाला आहे.", "Your application is received by municipal administration.")}
                          </p>
                        </div>

                        {/* Tracking ID */}
                        <div className="bg-background rounded-2xl p-4 border-2 border-emerald-500/40 space-y-1.5 shadow-inner">
                          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                            {t("अर्ज ट्रॅकिंग आयडी (Tracking ID)", "Tracking ID")}
                          </span>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-mono font-black text-primary tracking-wider">
                              {trackingId}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopy}
                              className="p-1.5 rounded-lg border border-primary/30 hover:bg-primary/10 text-primary transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                              <span>{copied ? t("कॉपी!", "Copied!") : t("कॉपी", "Copy")}</span>
                            </button>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-[11px] font-semibold leading-relaxed">
                          ⚠️ {t("कृपया हा ट्रॅकिंग आयडी लिहून किंवा स्क्रीनशॉट काढून ठेवा.", "Please save or take a screenshot of this Tracking ID.")}
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                          <Link
                            to={`/track?id=${trackingId}&mobile=${applicantMobile}`}
                            className="w-full py-2.5 rounded-xl gov-gradient text-white font-bold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <span>{t("अर्जाची स्थिती तपासा", "Track Application Status")}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setShowModal(false);
                              setTrackingId(null);
                            }}
                            className="w-full py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted text-foreground"
                          >
                            {t("बंद करा", "Close")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{t("पूर्ण नाव *", "Full Name *")}</label>
                          <input required name="name" placeholder={t("तुमचे नाव...", "Enter name...")} className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                            <span className="text-[10px] font-mono text-muted-foreground">{mobileValue.length}/10 {t("अंक", "digits")}</span>
                          </div>
                          <input
                            required
                            name="mobile"
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={mobileValue}
                            onChange={(e) => {
                              setMobileValue(sanitizeMobileInput(e.target.value));
                              if (error) setError(null);
                            }}
                            placeholder="98XXXXXXXX"
                            className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{t("आधार क्रमांक *", "Aadhaar Number *")}</label>
                          <input required name="aadhaar" placeholder="XXXX-XXXX-XXXX" className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-foreground">{t("पत्ता व प्रभाग / तपशील", "Address & Ward")}</label>
                          <input name="address" placeholder={t("घराचा पत्ता, प्रभाग...", "Address, ward...")} className="w-full px-3.5 py-2 rounded-xl bg-muted/50 border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>

                        {error && (
                          <p className="text-xs text-destructive font-bold">⚠️ {error}</p>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full py-3 rounded-xl gov-gradient text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 mt-2 disabled:opacity-60"
                        >
                          {submitting ? (
                            <>
                              <LoaderCircle className="w-4 h-4 animate-spin" />
                              <span>{t("अर्ज सादर करत आहे...", "Submitting...")}</span>
                            </>
                          ) : (
                            <>
                              <span>{t("अर्ज सबमिट करा व आयडी मिळवा", "Submit Application & Get ID")}</span>
                              <Send className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Flagship Scheme Hero Card */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Gift className="w-3.5 h-3.5" />
                    {t("प्रमुख शासन योजना २०२६", "Flagship Scheme 2026")}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white">{t(data.title, data.titleEn)}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-semibold mt-1">
                    {t(data.subtitle, data.subtitleEn)}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  🏛️
                </div>
              </div>

              <p className="text-primary-foreground/90 leading-relaxed text-sm md:text-base border-t border-white/20 pt-4">
                {t(data.desc, data.descEn)}
              </p>
            </div>

            {/* Sub-schemes list if present */}
            {data.schemes && (
              <div className="space-y-4">
                <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <Gift className="w-6 h-6 text-primary" />
                  <span>{t("योजना उप-घटक व विभाग", "Scheme Components & Modules")}</span>
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {data.schemes.map((s, idx) => (
                    <div
                      key={idx}
                      className="bg-card rounded-2xl p-6 border border-border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors">{t(s.name, s.nameEn)}</h3>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${s.status === "सक्रिय" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-muted text-muted-foreground border-border"}`}>
                            {t(s.status, s.statusEn)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{t(s.desc, s.descEn)}</p>
                        <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                          <Users className="w-3.5 h-3.5" />
                          <span>{t("लाभार्थी संख्या", "Beneficiaries")}: {t(s.beneficiaries, s.beneficiariesEn)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <span>{t("अर्ज करा", "Apply Now")}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Split Section: Eligibility & Benefits */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Eligibility Card */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{t("पात्रता निकष", "Eligibility Criteria")}</span>
                </h2>
                <div className="space-y-2.5">
                  {data.eligibility.map((e, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/70 text-xs md:text-sm font-semibold text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{t(e, data.eligibilityEn[i] || e)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits Card */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <span>{t("प्रमुख लाभ व अनुदान", "Key Benefits & Grants")}</span>
                </h2>
                <div className="space-y-2.5">
                  {data.benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-muted/50 border border-border/70 text-xs md:text-sm font-semibold text-foreground">
                      <ArrowRight className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{t(b, data.benefitsEn[i] || b)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Trigger Banner Card */}
            <div className="bg-card rounded-3xl p-8 border border-border shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl gov-gradient mx-auto flex items-center justify-center text-3xl text-white shadow-lg">
                📝
              </div>
              <h2 className="text-2xl font-black text-foreground">{t("या योजनेसाठी अर्ज करा", "Apply for this Scheme")}</h2>
              <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto">
                {t("ऑनलाइन अर्जाद्वारे थेट नोंदणी करा आणि आपल्या अर्जाची स्थिती जाणून घ्या.", "Register online to avail the benefits of this flagship scheme.")}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-8 py-3.5 rounded-2xl gov-gradient text-white text-base font-black shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                <span>{t("ऑनलाइन अर्ज करा", "Apply Online")}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export const CategoryGroupPage = ({
  category,
  titleMr,
  titleEn,
  subtitleMr,
  subtitleEn,
  icon,
}: {
  category: SchemeCategory;
  titleMr: string;
  titleEn: string;
  subtitleMr: string;
  subtitleEn: string;
  icon: string;
}) => {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState<SchemeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemeForApply, setSelectedSchemeForApply] = useState<SchemeRecord | null>(null);

  useEffect(() => {
    return subscribeToCategorySchemes(category, (items) => {
      setSchemes(items);
      setLoading(false);
    });
  }, [category]);

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Scheme Application Modal */}
            {selectedSchemeForApply && (
              <ApplySchemeModal
                scheme={selectedSchemeForApply}
                language={language}
                t={t}
                onClose={() => setSelectedSchemeForApply(null)}
              />
            )}

            {/* Header */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
                    <Gift className="w-3.5 h-3.5" />
                    {t(titleMr, titleEn)}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white">{t(titleMr, titleEn)}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(subtitleMr, subtitleEn)}
                  </p>
                </div>
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  {icon}
                </div>
              </div>
            </div>

            {/* Schemes List */}
            {loading ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-xl space-y-3">
                <LoaderCircle className="h-10 w-10 mx-auto text-primary animate-spin" />
                <h3 className="text-lg font-bold text-foreground">{t("डेटाबेसमधून योजना माहिती लोड होत आहे...", "Loading active schemes from database...")}</h3>
              </div>
            ) : schemes.length === 0 ? (
              <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-xl space-y-3">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground opacity-40" />
                <h3 className="text-lg font-bold text-foreground">{t("या वर्गवारीत सध्या कोणतीही सक्रिय योजना उपलब्ध नाही.", "No active schemes found in this category.")}</h3>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {schemes.map((scheme) => {
                  const title = language === "mr" ? scheme.titleMr : scheme.titleEn || scheme.titleMr;
                  const desc = language === "mr" ? scheme.descMr : scheme.descEn || scheme.descMr;
                  const benefits = language === "mr" ? scheme.benefitsMr : scheme.benefitsEn || scheme.benefitsMr;

                  return (
                    <div
                      key={scheme.id}
                      className="bg-card rounded-3xl p-6 border border-border shadow-md hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {category === "central" ? t("केंद्र शासन", "Central") : category === "state" ? t("महाराष्ट्र शासन", "Maharashtra") : t("स्थानिक नगरपरिषद", "Wai Council")}
                          </span>
                          <Gift className="w-4 h-4 text-primary" />
                        </div>

                        <h3 className="font-extrabold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                          {title}
                        </h3>
                        {desc && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                            {desc}
                          </p>
                        )}

                        {benefits && (
                          <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                            <span className="text-[11px] font-bold text-primary block">
                              🎁 {t("प्रमुख लाभ:", "Key Benefit:")}
                            </span>
                            <p className="text-xs text-foreground font-semibold line-clamp-2">
                              {benefits.split("\n")[0]}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                        {scheme.externalUrl ? (
                          <a
                            href={scheme.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span>{t("शासन निर्णय / संकेतस्थळ", "Official Portal / GR")}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedSchemeForApply(scheme)}
                          className="px-4 py-2 rounded-xl gov-gradient text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1 ml-auto"
                        >
                          <span>{t("ऑनलाइन अर्ज करा", "Apply Now")}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Bar */}
            <div className="text-center pt-4">
              <Link
                to="/schemes"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-sm font-bold text-foreground hover:bg-muted shadow-sm hover:shadow"
              >
                <span>{t("सर्व योजनांची एकत्रित यादी पहा", "View All Schemes")}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};


export const DynamicSchemePage = ({
  keyword,
}: {
  keyword: string;
}) => {
  const { t } = useLanguage();
  const [scheme, setScheme] = useState<SchemeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToActiveSchemes((items) => {
      const match = items.find((s) => {
        const full = (s.titleMr + " " + (s.titleEn || "") + " " + s.id).toLowerCase();
        return full.includes(keyword.toLowerCase());
      });
      setScheme(match || null);
      setLoading(false);
    });
  }, [keyword]);

  if (loading) {
    return (
      <PageLayout>
        <div className="py-24 text-center space-y-4">
          <LoaderCircle className="w-10 h-10 animate-spin text-primary mx-auto" />
          <h2 className="text-lg font-bold text-foreground">
            {t("डेटाबेसमधून योजना माहिती लोड होत आहे...", "Loading scheme details from database...")}
          </h2>
        </div>
      </PageLayout>
    );
  }

  if (!scheme) {
    return (
      <PageLayout>
        <div className="py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-muted text-muted-foreground mx-auto flex items-center justify-center text-3xl shadow-inner">
            📁
          </div>
          <h2 className="text-xl font-bold text-foreground">
            {t("योजना आढळली नाही किंवा सध्या निष्क्रिय आहे", "Scheme not found or currently inactive")}
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {t(
              "ही योजना नगरपरिषदेच्या सध्याच्या सक्रिय डेटाबेस यादीत उपलब्ध नाही.",
              "This scheme is currently not active in the database."
            )}
          </p>
          <div className="pt-2">
            <Link
              to="/schemes"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl gov-gradient text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>{t("सर्व सक्रिय योजनांची यादी पहा", "View Active Schemes")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  const data: SchemeData = {
    title: scheme.titleMr,
    titleEn: scheme.titleEn || scheme.titleMr,
    subtitle:
      scheme.category === "central"
        ? "केंद्र शासन जनकल्याण योजना २०२६"
        : scheme.category === "state"
        ? "महाराष्ट्र शासन जनकल्याण योजना २०२६"
        : "वाई नगरपरिषद स्थानिक कल्याण योजना २०२६",
    subtitleEn:
      scheme.category === "central"
        ? "Central Government Welfare Scheme 2026"
        : scheme.category === "state"
        ? "Maharashtra State Welfare Scheme 2026"
        : "Wai Municipal Council Welfare Scheme 2026",
    desc: scheme.descMr,
    descEn: scheme.descEn || scheme.descMr,
    eligibility: scheme.eligibilityMr ? scheme.eligibilityMr.split("\n").filter(Boolean) : [],
    eligibilityEn: scheme.eligibilityEn ? scheme.eligibilityEn.split("\n").filter(Boolean) : [],
    benefits: scheme.benefitsMr ? scheme.benefitsMr.split("\n").filter(Boolean) : [],
    benefitsEn: scheme.benefitsEn ? scheme.benefitsEn.split("\n").filter(Boolean) : [],
  };

  return <SchemePage data={data} />;
};

export const DynamicSchemeRoute = () => {
  const { id } = useParams<{ id: string }>();
  return <DynamicSchemePage keyword={id || ""} />;
};

export const PMAY = () => <DynamicSchemePage keyword="pmay" />;
export const AMRUT = () => <DynamicSchemePage keyword="amrut" />;
export const SwachhBharat = () => <DynamicSchemePage keyword="swachh" />;
export const PMSVANidhi = () => <DynamicSchemePage keyword="pmsvanidhi" />;
export const SanjayGandhi = () => <DynamicSchemePage keyword="sanjay" />;
export const Shravanbal = () => <DynamicSchemePage keyword="shravanbal" />;
export const DivyangKalyan = () => <DynamicSchemePage keyword="divyang" />;
export const MahilaBal = () => <DynamicSchemePage keyword="mahila" />;

export const CentralSchemes = () => (
  <CategoryGroupPage
    category="central"
    titleMr="केंद्र शासन जनकल्याण योजना (वाई शहर पोर्टल)"
    titleEn="Central Govt. Welfare Schemes (Wai City)"
    subtitleMr="पंतप्रधान आवास योजना, स्वच्छ भारत शौचालय अनुदान, अमृत २.० व पीएम स्वनिधी योजनांची माहिती व ऑनलाइन अर्ज."
    subtitleEn="PMAY Housing, Swachh Bharat Toilet Grant, AMRUT 2.0, and PM SVANidhi Schemes for Wai citizens."
    icon="🏛️"
  />
);

export const StateSchemes = () => (
  <CategoryGroupPage
    category="state"
    titleMr="महाराष्ट्र शासन जनकल्याण योजना (वाई शहर पोर्टल)"
    titleEn="Maharashtra State Welfare Schemes (Wai City)"
    subtitleMr="संजय गांधी निराधार अनुदान योजना व श्रावणबाळ सेवा निवृत्तीवेतन योजनांची माहिती व अर्ज."
    subtitleEn="Sanjay Gandhi Niradhar Scheme and Shravanbal Senior Citizen Pension Schemes in Wai."
    icon="🏰"
  />
);

export const LocalSchemes = () => (
  <CategoryGroupPage
    category="local"
    titleMr="वाई नगरपरिषद स्थानिक जनकल्याण योजना (५% राखीव निधी)"
    titleEn="Wai Municipal Council Local Welfare Schemes"
    subtitleMr="दिव्यांग कल्याण योजना व महिला-बालकल्याण योजना अंतर्गत थेट अनुदान, साधने व कर सवलत."
    subtitleEn="Divyang Empowerment and Women & Child Welfare initiatives funded by Wai Municipal Council."
    icon="🏢"
  />
);
