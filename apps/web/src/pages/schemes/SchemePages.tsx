import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Users, Calendar, ExternalLink, ArrowRight, Gift, ShieldCheck, FileText, Send, X, Copy, Check, LoaderCircle } from "lucide-react";
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

const SchemePage = ({ data }: { data: SchemeData }) => {
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

    // 10-digit mobile number validation (no fake / repeating numbers like 9999999999)
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
        {/* Background Glows */}
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

                        {/* Real Tracking ID on Screen */}
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
                          <p className="text-[10px] text-muted-foreground">
                            {t("१० अंकी खरा नंबर (६ ते ९ ने सुरू; ९९९९९९९९९९ सारखे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; 9999999999 prohibited)")}
                          </p>
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
                    {t("प्रमुख शासन योजना", "Flagship Scheme")}
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
                      <span>{t(e, data.eligibilityEn[i])}</span>
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
                      <span>{t(b, data.benefitsEn[i])}</span>
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

const schemePagesData: Record<string, SchemeData> = {
  pmay: {
    title: "प्रधानमंत्री आवास योजना (PMAY)", titleEn: "Pradhan Mantri Awas Yojana (PMAY)",
    subtitle: "सर्वसमावेशक परवडणारी घरे व घरकुल अनुदान", subtitleEn: "Affordable Housing for All",
    desc: "शहरी भागातील बेघर व आर्थिकदृष्ट्या दुर्बल घटकांसाठी हक्काचे पक्के घर उपलब्ध करून देणे हे या योजनेचे मुख्य उद्दिष्ट आहे. वाई नगरपालिकेद्वारे घरकुल बांधकाम अनुदान वितरीत केले जाते.",
    descEn: "Providing pucca houses to urban homeless and economically weaker sections. Subsidies provided by Wai Municipality.",
    eligibility: [
      "भारतात कोठेही पक्के घर नसावे", "आर्थिकदृष्ट्या दुर्बल घटक (EWS) किंवा अल्प उत्पन्न गट (LIG)", "उत्पन्न मर्यादा नियमानुसार असावी", "कुटुंबाचे आधार कार्ड अनिवार्य"
    ],
    eligibilityEn: [
      "Must not own a pucca house in India", "Economically Weaker Section (EWS) or LIG", "Income limit as per norms", "Family Aadhaar card mandatory"
    ],
    benefits: [
      "₹ 2,50,000 पर्यंत थेट बँक खात्यात घरकुल अनुदान", "चार हप्त्यांमध्ये रक्कम वितरण", "स्वस्त गृहकर्ज व्याज सबसिडी (CLSS)", "पाणी व विजेची विनामूल्य जोडणी"
    ],
    benefitsEn: [
      "Direct grant up to ₹ 2,50,000 in bank account", "Disbursement in 4 installments", "Interest subsidy on home loans (CLSS)", "Free water & electricity connection"
    ],
    schemes: [
      { name: "घरकुल घटक (BLC)", nameEn: "Beneficiary Led Construction", status: "सक्रिय", statusEn: "Active", beneficiaries: "1,240+ कुटुंबे", beneficiariesEn: "1,240+ Families", desc: "स्वतःच्या जागेवर नवीन घर बांधण्यासाठी ₹ २.५ लाख अनुदान.", descEn: "₹ 2.5 Lakh subsidy for building house on owned land." },
      { name: "व्याज अनुदान घटक (CLSS)", nameEn: "Credit Linked Subsidy Scheme", status: "सक्रिय", statusEn: "Active", beneficiaries: "850+ नागरिक", beneficiariesEn: "850+ Citizens", desc: "गृहकर्जाच्या व्याजावर सबसिडी सवलत.", descEn: "Subsidy discount on home loan interest." },
    ],
  },
  amrut: {
    title: "अमृत योजना (AMRUT 2.0)", titleEn: "AMRUT Mission 2.0",
    subtitle: "शहर पाणीपुरवठा व जलनिस्सारण पुनरुज्जीवन", subtitleEn: "Urban Water Supply & Drainage Rejuvenation",
    desc: "वाई शहरातील सर्व कुटुंबांना नळ जोडणीद्वारे शुद्ध पिण्याचे पाणी देणे व कृष्णा नदीचे प्रदूषण रोखण्यासाठी सांडपाणी प्रक्रिया प्रकल्प (STP) उभारणे.",
    descEn: "Providing piped water to all households in Wai city and setting up Sewage Treatment Plants (STP) to protect Krishna river.",
    eligibility: ["वाई नगरपरिषद क्षेत्रातील सर्व नागरिक व घरे", "पाणीपट्टी थकबाकी नसणे"],
    eligibilityEn: ["All residents within Wai Municipal limits", "No water bill arrears"],
    benefits: ["१००% २४x७ शुद्ध पिण्याचे पाणी", "नवीन जलवाहिन्या व डिजिटल मीटरिंग", "कृष्णा नदीकाठ स्वच्छता"],
    benefitsEn: ["100% 24x7 clean drinking water", "New pipelines & digital metering", "Krishna riverbank cleanliness"],
  },
  swachh: {
    title: "स्वच्छ भारत अभियान (नागरी)", titleEn: "Swachh Bharat Abhiyan (Urban)",
    subtitle: "स्वच्छ, सुंदर व हागणदारीमुक्त वाई शहर", subtitleEn: "Clean, Beautiful & Open Defecation Free Wai",
    desc: "शहरात १००% कचरा विलगीकरण, वैयक्तिक शौचालय बांधकाम अनुदान व ओला-सुका कचरा प्रक्रिया प्रकल्प यशस्वीरीत्या राबवणे.",
    descEn: "100% waste segregation, individual household toilet grants, and wet/dry waste processing plants in Wai.",
    eligibility: ["घरात वैयक्तिक शौचालय नसलेले कुटुंब", "नगरपरिषद हद्दीतील रहिवासी"],
    eligibilityEn: ["Households without individual toilets", "Residents of Wai Municipal area"],
    benefits: ["वैयक्तिक शौचालयासाठी ₹ १२,००० अनुदान", "ओला व सुका कचरा मोफत संकलन", "Swachh Survekshan टॉप रँकिंग"],
    benefitsEn: ["₹ 12,000 grant for household toilet", "Free wet & dry waste collection", "Top ranking in Swachh Survekshan"],
  },
};

export const PMAY = () => <SchemePage data={schemePagesData.pmay} />;
export const AMRUT = () => <SchemePage data={schemePagesData.amrut} />;
export const SwachhBharat = () => <SchemePage data={schemePagesData.swachh} />;
export const CentralSchemes = () => <SchemePage data={schemePagesData.pmay} />;
export const StateSchemes = () => <SchemePage data={schemePagesData.amrut} />;
export const LocalSchemes = () => <SchemePage data={schemePagesData.swachh} />;
