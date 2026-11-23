import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { CheckCircle2, Users, Calendar, ExternalLink, ArrowRight, Gift, ShieldCheck, FileText, Send, X, Copy, Check, LoaderCircle, Building2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createComplaint } from "@/lib/complaints";
import { validateMobileInput, sanitizeMobileInput } from "@/lib/validation";

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
  schemeKeys,
}: {
  category: "central" | "state" | "local";
  titleMr: string;
  titleEn: string;
  subtitleMr: string;
  subtitleEn: string;
  icon: string;
  schemeKeys: string[];
}) => {
  const { t } = useLanguage();
  const schemes = schemeKeys.map((k) => ({ key: k, data: schemePagesData[k] })).filter((x) => !!x.data);

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto space-y-8">
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
            <div className="grid md:grid-cols-2 gap-6">
              {schemes.map(({ key, data }) => (
                <div
                  key={key}
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
                      {t(data.title, data.titleEn)}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {t(data.desc, data.descEn)}
                    </p>

                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                      <span className="text-[11px] font-bold text-primary block">
                        🎁 {t("प्रमुख लाभ:", "Key Benefit:")}
                      </span>
                      <p className="text-xs text-foreground font-semibold">
                        {t(data.benefits[0] || "", data.benefitsEn[0] || "")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                    <Link
                      to={`/schemes/${key}`}
                      className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span>{t("सविस्तर निकष व माहिती", "View Details")}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      to={`/schemes/${key}`}
                      className="px-4 py-2 rounded-xl gov-gradient text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-1"
                    >
                      <span>{t("अर्ज करा", "Apply Now")}</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Bar */}
            <div className="text-center pt-4">
              <Link
                to="/schemes/all"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-card border border-border text-sm font-bold text-foreground hover:bg-muted shadow-sm hover:shadow"
              >
                <span>{t("सर्व योजनांची एकत्रित यादी पहा (All 8 Schemes)", "View All Schemes")}</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export const schemePagesData: Record<string, SchemeData> = {
  pmay: {
    title: "प्रधानमंत्री आवास योजना (PMAY - नागरी २.०)", titleEn: "Pradhan Mantri Awas Yojana (PMAY - Urban 2.0)",
    subtitle: "सर्वसमावेशक परवडणारी घरे व घरकुल अनुदान", subtitleEn: "Affordable Housing for All in Wai City",
    desc: "शहरी भागातील बेघर व आर्थिकदृष्ट्या दुर्बल घटकांतील (EWS/LIG) कुटुंबांना हक्काचे पक्के घरकुल उपलब्ध करून देण्यासाठी केंद्र व महाराष्ट्र शासनाचे थेट ₹ २,५०,००० अनुदान वाई नगरपरिषदेद्वारे वितरीत केले जाते.",
    descEn: "Financial grant up to ₹2,50,000 provided by Central & Maharashtra Government through Wai Municipal Council for constructing permanent houses.",
    eligibility: [
      "भारतात इतरत्र कुठेही स्वतःचे किंवा कुटुंबीयांचे पक्के घर नसावे",
      "आर्थिकदृष्ट्या दुर्बल घटक (EWS - उत्पन्न ₹ ३ लाख) किंवा अल्प उत्पन्न गट (LIG - उत्पन्न ₹ ६ लाख)",
      "वाई नगरपरिषद हद्दीतील रहिवासी पुरावा",
      "स्वतःची मालकी जागा / ७/१२ उतारा / नगर भूमापन (City Survey) प्रमाणपत्र",
      "कुटुंबातील सर्व सदस्यांचे आधार कार्ड व बँक खाते"
    ],
    eligibilityEn: [
      "Must not own a pucca house anywhere in India",
      "Economically Weaker Section (EWS up to ₹3L) or LIG (up to ₹6L)",
      "Resident of Wai Municipal Council limits",
      "Valid land title / 7-12 extract / City Survey property card in Wai",
      "Aadhaar cards and bank accounts of all family members"
    ],
    benefits: [
      "₹ २,५०,००० पर्यंत थेट बँक खात्यात घरकुल अनुदान (४ टप्प्यांत जिओ-टॅगिंगनुसार)",
      "स्वस्त गृहकर्ज व्याज सबसिडी (CLSS) सवलत",
      "वाई पालिकेमार्फत विनामूल्य नळ जोडणी व वीज कनेक्शन प्राधान्य",
      "महिला कुटुंब प्रमुखाच्या नावावर घरकुल मालकी हक्क"
    ],
    benefitsEn: [
      "Direct grant up to ₹2,50,000 in bank account across 4 stages",
      "Interest subsidy under Credit Linked Subsidy Scheme (CLSS)",
      "Priority free tap water connection and electric metering by Wai Council",
      "Mandatory co-ownership for female head of household"
    ],
    schemes: [
      { name: "घरकुल घटक (BLC)", nameEn: "Beneficiary Led Construction", status: "सक्रिय", statusEn: "Active", beneficiaries: "1,240+ कुटुंबे", beneficiariesEn: "1,240+ Families", desc: "स्वतःच्या जागेवर नवीन घर बांधण्यासाठी ₹ २.५ लाख अनुदान.", descEn: "₹ 2.5 Lakh subsidy for building house on owned land." },
      { name: "व्याज अनुदान घटक (CLSS)", nameEn: "Credit Linked Subsidy Scheme", status: "सक्रिय", statusEn: "Active", beneficiaries: "850+ नागरिक", beneficiariesEn: "850+ Citizens", desc: "गृहकर्जाच्या व्याजावर सबसिडी सवलत.", descEn: "Subsidy discount on home loan interest." },
    ],
  },
  swachh: {
    title: "स्वच्छ भारत अभियान (वैयक्तिक शौचालय अनुदान - SBM 2.0)", titleEn: "Swachh Bharat Mission (IHHL Toilet Subsidy - SBM 2.0)",
    subtitle: "स्वच्छ, सुंदर व हागणदारीमुक्त (ODF++) वाई शहर", subtitleEn: "Clean, Beautiful & Open Defecation Free Wai",
    desc: "वाई शहरात उघड्यावर शौचास जाणे पूर्णतः बंद करण्यासाठी व १००% स्वच्छता साध्य करण्यासाठी ज्यांच्याकडे वैयक्तिक शौचालय नाही अशा कुटुंबांना थेट ₹ १२,००० ते ₹ १८,००० अनुदान दिले जाते.",
    descEn: "Subsidy of ₹12,000 to ₹18,000 provided to households in Wai city without individual toilets to ensure 100% ODF++ sanitation.",
    eligibility: [
      "वाई नगरपरिषद क्षेत्रातील कायमस्वरूपी रहिवासी कुटुंब",
      "घरात आधीपासून पक्के वैयक्तिक शौचालय नसावे",
      "शौचालय बांधकामासाठी जागेची उपलब्धता",
      "आधार कार्ड, रहिवासी दाखला व बँक पासबुक झेरॉक्स"
    ],
    eligibilityEn: [
      "Resident family within Wai Municipal Council limits",
      "Household must not already have a functional private toilet",
      "Adequate space available for toilet construction",
      "Aadhaar card, residence proof, and bank passbook copy"
    ],
    benefits: [
      "वैयक्तिक शौचालय (IHHL) बांधकामासाठी ₹ १२,००० ते ₹ १८,००० थेट बँक खात्यात अनुदान",
      "दोन हप्त्यांत थेट रक्कम वितरण (बांधकाम सुरू करताना व पूर्ण झाल्यावर)",
      "नगरपरिषदेच्या सेप्टिक टँक सक्शन व मलमूत्र प्रक्रिया प्रकल्पाची (FSTP) सवलत सेवा"
    ],
    benefitsEn: [
      "Financial subsidy of ₹12,000 to ₹18,000 directly deposited in bank account",
      "Disbursed in 2 stages upon geotagged photo verification",
      "Wai Municipal Council Faecal Sludge Treatment Plant (FSTP) desludging support"
    ],
  },
  amrut: {
    title: "अमृत योजना २.० (शहरी पाणीपुरवठा व कृष्णा नदी संवर्धन)", titleEn: "AMRUT 2.0 Mission (Urban Water Supply & Krishna River Conservation)",
    subtitle: "शहर पाणीपुरवठा व जलनिस्सारण पुनरुज्जीवन", subtitleEn: "Urban Water Supply & Drainage Rejuvenation",
    desc: "वाई शहरातील सर्व १७ प्रभागांतील प्रत्येक घराला शुद्ध पिण्याचे पाणी नळाद्वारे पुरवणे, धोम धरणातून पाणीपुरवठा बळकटीकरण, भूमिगत सांडपाणी वाहिनी व कृष्णा नदीचे प्रदूषण रोखणे.",
    descEn: "Ensuring 100% functional household tap connections (FHTC) from Dhom Dam source, underground sewerage network, and protecting sacred Krishna river from wastewater.",
    eligibility: [
      "वाई शहरातील सर्व १७ प्रभागांमधील घरे, सोसायट्या व व्यावसायिक मिळकती",
      "मालमत्ता कर व पाणीपट्टीची कोणतीही थकबाकी नसावी",
      "नियमित नळ जोडणीसाठी अधिकृत अर्ज"
    ],
    eligibilityEn: [
      "All households and properties across all 17 wards of Wai",
      "No outstanding municipal property tax or water supply dues",
      "Formal application for meter-based connection"
    ],
    benefits: [
      "२४x७ शुद्ध व सुरक्षित पिण्याचे पाणी (१३५ LPCD मानकानुसार)",
      "जुन्या गंजलेल्या जलवाहिन्या बदलून नवीन दर्जेदार जलवाहिनी नेटवर्क व डिजिटल मीटर",
      "भूमिगत गटार व सांडपाणी प्रक्रिया प्रकल्प (STP) द्वारे कृष्णा नदीचे संवर्धन"
    ],
    benefitsEn: [
      "24x7 clean, treated, and safe drinking water as per 135 LPCD urban standard",
      "Replacement of old pipelines with modern ductile iron network and digital meters",
      "Krishna riverfront beautification and sewage treatment plant (STP) preventing river pollution"
    ],
  },
  pmsvanidhi: {
    title: "पीएम स्वनिधी योजना (पंतप्रधान पथविक्रेता आत्मनिर्भर निधी)", titleEn: "PM SVANidhi Scheme (PM Street Vendor's AtmaNirbhar Nidhi)",
    subtitle: "फेरीवाले व छोटे विक्रेते यांच्यासाठी खेळते भांडवल कर्ज", subtitleEn: "Collateral-free Working Capital Loans for Street Vendors",
    desc: "वाई शहरातील भाजी मंडई, महागणपती मंदिर परिसर, बस स्थानक व आठवडे बाजारातील फेरीवाले, हातगाडी चालक व छोटे विक्रेते यांच्यासाठी विनातारण ₹ १०,००० ते ₹ ५०,००० पर्यंत खेळते भांडवल कर्ज व ७% व्याज अनुदान योजना.",
    descEn: "Collateral-free affordable working capital loans up to ₹50,000 and 7% interest subsidy for street vendors, hawkers, and micro-merchants in Wai.",
    eligibility: [
      "वाई शहरातील पथविक्रेता / फेरीवाला",
      "नगरपरिषदेचे फेरीवाला सर्वेक्षण (TVC Survey) नोंदणी किंवा विक्रेता ओळखपत्र (Vendor ID)",
      "आधार कार्ड व बँक खाते मोबाईलशी लिंक असणे आवश्यक"
    ],
    eligibilityEn: [
      "Street vendors, fruit/vegetable sellers, hawkers operating in Wai",
      "Possess Vendor ID card or Town Vending Committee (TVC) registration in Wai",
      "Aadhaar-linked active bank account with mobile number"
    ],
    benefits: [
      "प्रथम टप्प्यात ₹ १०,००० पर्यंत विनातारण सुलभ खेळते भांडवल कर्ज",
      "वेळेत परतफेडीवर दुसऱ्या टप्प्यात ₹ २०,००० व तिसऱ्या टप्प्यात ₹ ५०,००० पर्यंत कर्ज",
      "नियमित परतफेडीवर ७% वार्षिक व्याज अनुदान थेट बँक खात्यात जमा",
      "डिजिटल व्यवहारांवर (UPI/QR Code) दरमहा ₹ १०० पर्यंत कॅशबॅक प्रोत्साहन"
    ],
    benefitsEn: [
      "1st Tranche collateral-free working capital loan up to ₹10,000",
      "On timely repayment, eligible for 2nd Tranche up to ₹20,000 and 3rd Tranche up to ₹50,000",
      "7% per annum interest subsidy directly credited via DBT",
      "Monthly cashback up to ₹100 on accepting digital UPI QR code payments"
    ],
  },
  sanjayGandhi: {
    title: "संजय गांधी निराधार अनुदान योजना (महाराष्ट्र शासन)", titleEn: "Sanjay Gandhi Niradhar Anudan Yojana (Govt. of Maharashtra)",
    subtitle: "निराधार, वृद्ध व दुर्धर आजारग्रस्त नागरिकांना मासिक पेन्शन", subtitleEn: "Monthly Pension for Destitute, Widows & Chronically Ill",
    desc: "अनाथ मुले, निराधार वृद्ध, विधवा, परित्यक्ता महिला, अपंग व्यक्ती व दुर्धर आजाराने ग्रस्त वाई शहरातील गरजू नागरिकांना दरमहा ₹ १,५०० थेट आर्थिक निवृत्तीवेतन मदत.",
    descEn: "Monthly financial assistance of ₹1,500 by Maharashtra Social Justice Dept to destitute persons, widows, divorced women, chronically ill, and disabled citizens in Wai.",
    eligibility: [
      "वय ६५ वर्षांपेक्षा कमी असावे (६५ वर्षांवरील वृद्धांसाठी श्रावणबाळ योजना)",
      "दारिद्र्यरेषेखालील (BPL) किंवा कौटुंबिक वार्षिक उत्पन्न ₹ ५०,००० च्या आत",
      "महाराष्ट्र राज्याचा व वाई शहराचा सलग १५ वर्षे रहिवासी",
      "अनाथ, निराधार, ४०% पेक्षा जास्त दिव्यांग किंवा कर्करोग/टीबी/अर्धांगवायू आजारग्रस्त व्यक्ती"
    ],
    eligibilityEn: [
      "Age below 65 years",
      "Family living below poverty line (BPL) or annual income not exceeding ₹50,000",
      "Continuous domicile of at least 15 years in Maharashtra / Wai",
      "Destitute, widows, divorced/abandoned women, 40%+ disabled, or chronically ill"
    ],
    benefits: [
      "दरमहा ₹ १,५०० थेट आधार लिंक बँक खात्यात जमा",
      "कुटुंबात एकापेक्षा जास्त पात्र लाभार्थी असल्यास दरमहा ₹ २,५०० पर्यंत अनुदान",
      "शासकीय व उपजिल्हा रुग्णालयात मोफत उपचार व तपासणी प्राधान्य"
    ],
    benefitsEn: [
      "Monthly pension of ₹1,500 deposited directly into DBT bank account",
      "Up to ₹2,500 per month if more than one eligible beneficiary in the family",
      "Free healthcare and diagnostic access at government hospitals"
    ],
  },
  shravanbal: {
    title: "श्रावणबाळ सेवा राज्य निवृत्तीवेतन योजना (महाराष्ट्र शासन)", titleEn: "Shravanbal Seva Rajya Nivruttivetan Yojana (Govt. of Maharashtra)",
    subtitle: "ज्येष्ठ नागरिकांसाठी (वय ६५+) दरमहा शासकीय पेन्शन", subtitleEn: "Guaranteed Monthly Pension for Senior Citizens (65+)",
    desc: "६५ वर्षे किंवा त्याहून अधिक वयाच्या गरीब व वृद्ध नागरिकांना उतारवयात सन्मानाने जगण्यासाठी दरमहा नियमित ₹ १,५०० शासकीय पेन्शन योजना वाई तहसील व पालिकेमार्फत राबवली जाते.",
    descEn: "Guaranteed monthly social security pension of ₹1,500 by Maharashtra Government for senior citizens aged 65 and above from economically weaker backgrounds.",
    eligibility: [
      "अर्जदाराचे वय ६५ वर्षे किंवा त्यापेक्षा जास्त असणे बंधनकारक",
      "दारिद्र्यरेषेखालील यादीत नाव (गट अ) किंवा वार्षिक कौटुंबिक उत्पन्न ₹ ५०,००० च्या आत (गट ब)",
      "वाई / महाराष्ट्र राज्यात किमान १५ वर्षे वास्तव्याचा पुरावा"
    ],
    eligibilityEn: [
      "Age must be 65 years or above",
      "Included in BPL list (Category A) or annual family income below ₹50,000 (Category B)",
      "Minimum 15 years domicile proof in Wai, Maharashtra"
    ],
    benefits: [
      "दरमहा ₹ १,५०० थेट बँक खात्यात डीबीटी (DBT) द्वारे जमा",
      "वाई उपजिल्हा रुग्णालय व नागरी प्राथमिक आरोग्य केंद्रात मोफत ओपीडी व औषधे",
      "वृद्ध नागरिकांसाठी सामाजिक सुरक्षा व आर्थिक स्वावलंबन"
    ],
    benefitsEn: [
      "₹1,500 monthly pension deposited directly into bank account",
      "Free geriatric OPD consultations, checkups, and medicines at Wai Cottage Hospital",
      "Dignified social security and independence in old age"
    ],
  },
  divyang: {
    title: "दिव्यांग कल्याण योजना (वाई नगरपरिषद ५% राखीव निधी)", titleEn: "Divyang Kalyan Yojana (Wai Municipal Council 5% Reserved Budget)",
    subtitle: "दिव्यांग बंधू-भगिनींसाठी सहाय्य, साधने वाटप व ५०% कर सवलत", subtitleEn: "Assistive Aids, Scholarships & 50% Tax Rebate for Disabled",
    desc: "वाई नगरपरिषदेच्या वार्षिक अर्थसंकल्पातील ५% विशेष राखीव निधीतून शहरातील दिव्यांग व्यक्तींच्या सक्षमीकरणासाठी सहाय्य, साधने वाटप, शिष्यवृत्ती व मालमत्ता कर सवलत दिली जाते.",
    descEn: "Statutory 5% municipal budget allocation by Wai Municipal Council for empowerment, assistive equipment, scholarships, and self-employment of differently-abled citizens.",
    eligibility: [
      "किमान ४०% किंवा त्याहून अधिक दिव्यांगत्वाचे सक्षम वैद्यकीय मंडळ (Civil Surgeon) किंवा UDID कार्ड",
      "अर्जदार वाई नगरपरिषद हद्दीतील किमान ३ वर्षे कायमस्वरूपी रहिवासी असावा",
      "आधार कार्ड, सक्षम अपंगत्व प्रमाणपत्र, बँक पासबुक झेरॉक्स व रहिवासी दाखला"
    ],
    eligibilityEn: [
      "Minimum 40% disability certified by District Civil Surgeon or UDID Smart Card",
      "Permanent resident of Wai Municipal Council limits for at least 3 years",
      "Aadhaar card, disability certificate, bank passbook, and proof of residence"
    ],
    benefits: [
      "दरवर्षी ₹ ६,००० ते ₹ १२,००० थेट शैक्षणिक शिष्यवृत्ती / आर्थिक अर्थसहाय्य",
      "मोफत तीनचाकी सायकल (Tricycle), व्हीलचेअर, श्रवणयंत्र, जयपूर फूट व कृत्रिम अवयव वाटप",
      "स्वतःच्या मालकीच्या निवासी मालमत्तेवर ५०% घरपट्टी (मालमत्ता कर) सवलत",
      "शहरात स्वयंरोजगारासाठी नगरपरिषदेच्या जागांवर गाळे/स्टॉल वाटपात प्राधान्य"
    ],
    benefitsEn: [
      "Annual education scholarship / financial aid of ₹6,000 to ₹12,000",
      "Free distribution of battery tricycles, wheelchairs, hearing aids, and calipers",
      "50% concession on municipal property tax for self-occupied residential houses in Wai",
      "Preference in municipal vending stalls and hawker zones for self-employment"
    ],
  },
  mahilaBal: {
    title: "महिला व बालकल्याण योजना (वाई नगरपरिषद ५% राखीव निधी)", titleEn: "Women & Child Welfare Scheme (Wai Municipal 5% Special Fund)",
    subtitle: "मोफत शिलाई मशीन, बचत गट फिरता निधी व कौशल्य प्रशिक्षण", subtitleEn: "Free Sewing Machines, SHG Grants & Skill Training for Women",
    desc: "वाई शहरातील महिलांचे आर्थिक सक्षमीकरण, बचत गटांना फिरता निधी, मोफत शिलाई मशीन वाटप, कौशल्य विकास प्रशिक्षण व विद्यार्थिनींच्या शिक्षणासाठी नगरपरिषदेचा उपक्रम.",
    descEn: "Empowering women and children in Wai city through revolving funds for Self-Help Groups (SHGs), free sewing machines, skill training, and educational incentives.",
    eligibility: [
      "वाई नगरपरिषद क्षेत्रातील महिला व नोंदणीकृत महिला बचत गट (SHG)",
      "आर्थिक दुर्बल, विधवा, घटस्फोटित व एकल महिलांना प्रथम प्राधान्य",
      "वाई पालिकेच्या शाळांमधील विद्यार्थिनी किंवा शहरात किमान ३ वर्षे वास्तव्य"
    ],
    eligibilityEn: [
      "Women residents and registered Self-Help Groups (SHGs) within Wai city",
      "Economically weaker, widowed, divorced, or single mothers given highest priority",
      "Girl students in municipal schools or residents with at least 3 years domicile"
    ],
    benefits: [
      "पात्र महिलांना मोफत शिलाई मशीन (Sewing Machine) वाटप",
      "ब्युटी पार्लर, फॅशन डिझायनिंग, अन्न प्रक्रिया व संगणक प्रशिक्षणाचा १००% खर्च नगरपरिषदेमार्फत",
      "नोंदणीकृत महिला बचत गटांना ₹ १०,००० ते ₹ २५,००० फिरता निधी (Revolving Fund)",
      "१०वी व १२वी मध्ये गुणवंत ठरलेल्या विद्यार्थिनींना रोख पारितोषिक व गौरव सन्मान"
    ],
    benefitsEn: [
      "Free motorized sewing machines distributed to eligible women",
      "100% sponsored vocational training in beauty care, tailoring, food processing, and IT",
      "Revolving funds of ₹10,000 to ₹25,000 for registered Women Self-Help Groups",
      "Merit awards and cash scholarships for top-scoring female students in 10th and 12th standards"
    ],
  },
};

export const PMAY = () => <SchemePage data={schemePagesData.pmay} />;
export const AMRUT = () => <SchemePage data={schemePagesData.amrut} />;
export const SwachhBharat = () => <SchemePage data={schemePagesData.swachh} />;
export const PMSVANidhi = () => <SchemePage data={schemePagesData.pmsvanidhi} />;
export const SanjayGandhi = () => <SchemePage data={schemePagesData.sanjayGandhi} />;
export const Shravanbal = () => <SchemePage data={schemePagesData.shravanbal} />;
export const DivyangKalyan = () => <SchemePage data={schemePagesData.divyang} />;
export const MahilaBal = () => <SchemePage data={schemePagesData.mahilaBal} />;

export const CentralSchemes = () => (
  <CategoryGroupPage
    category="central"
    titleMr="केंद्र शासन जनकल्याण योजना (वाई शहर पोर्टल)"
    titleEn="Central Govt. Welfare Schemes (Wai City)"
    subtitleMr="पंतप्रधान आवास योजना, स्वच्छ भारत शौचालय अनुदान, अमृत २.० व पीएम स्वनिधी योजनांची माहिती व ऑनलाइन अर्ज."
    subtitleEn="PMAY Housing, Swachh Bharat Toilet Grant, AMRUT 2.0, and PM SVANidhi Schemes for Wai citizens."
    icon="🏛️"
    schemeKeys={["pmay", "swachh", "amrut", "pmsvanidhi"]}
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
    schemeKeys={["sanjayGandhi", "shravanbal"]}
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
    schemeKeys={["divyang", "mahilaBal"]}
  />
);
