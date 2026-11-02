import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ComplaintForm from "@/components/ComplaintForm";
import {
  Home, Droplets, MessageSquare, FileText, Skull, HardHat,
  ArrowRight, CheckCircle2, Clock, AlertCircle, Upload, ShieldCheck, CheckCircle,
  Send, Copy, Check, X, Paperclip, LoaderCircle, User, Phone, MapPin, Calendar, Building2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { createComplaint } from "@/lib/complaints";
import { validateMobileInput, sanitizeMobileInput } from "@/lib/validation";

interface ServiceData {
  key: "property-tax" | "water-bill" | "birth-certificate" | "death-certificate" | "construction-permit";
  icon: LucideIcon;
  title: string; titleEn: string;
  desc: string; descEn: string;
  fee: string; feeEn: string;
  time: string; timeEn: string;
  documents: string[]; documentsEn: string[];
  steps: string[]; stepsEn: string[];
}

const ServicePage = ({ data }: { data: ServiceData }) => {
  const { t, lang } = useLanguage();
  const Icon = data.icon;

  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [mobileValue, setMobileValue] = useState<string>("");
  const [applicantMobile, setApplicantMobile] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...selected.filter((f) => !existing.has(f.name + f.size))];
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopy = () => {
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Document upload is strictly required for official certificates and permits
    if (files.length === 0) {
      setError(
        t(
          "कृपया अर्जासाठी आवश्यक कागदपत्रे / पुरावा अपलोड करा (* अनिवार्य).",
          "Please upload the required verification documents (* mandatory)."
        )
      );
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    let name = "";
    let mobile = "";
    let description = "";

    if (data.key === "birth-certificate") {
      name = (formData.get("fatherName") as string) || (formData.get("childName") as string);
      mobile = (formData.get("mobile") as string) || "";
      description = [
        `[जन्म दाखला ऑनलाइन अर्ज]`,
        `बालकाचे पूर्ण नाव: ${formData.get("childName")}`,
        `जन्म तारीख: ${formData.get("dob")}`,
        `लिंग: ${formData.get("gender")}`,
        `जन्माचे ठिकाण / रुग्णालय: ${formData.get("birthPlace")}`,
        `वडिलांचे पूर्ण नाव: ${formData.get("fatherName")}`,
        `आईचे पूर्ण नाव: ${formData.get("motherName")}`,
        `कायमचा पत्ता: ${formData.get("address")}`,
        `नोंद: रुग्णालय जन्म नोंद कागदपत्र जोडले आहे.`,
      ].join("\n");
    } else if (data.key === "death-certificate") {
      name = (formData.get("applicantName") as string) || "";
      mobile = (formData.get("mobile") as string) || "";
      description = [
        `[मृत्यू दाखला ऑनलाइन अर्ज]`,
        `मृत व्यक्तीचे पूर्ण नाव: ${formData.get("deceasedName")}`,
        `मृत्यू दिनांक: ${formData.get("dod")}`,
        `मृत्यूचे वय: ${formData.get("age")} वर्षे`,
        `लिंग: ${formData.get("gender")}`,
        `मृत्यूचे ठिकाण (रुग्णालय/घर): ${formData.get("deathPlace")}`,
        `अर्जदाराचे नाव: ${name}`,
        `मृत व्यक्तीशी नातेसंबंध: ${formData.get("relation")}`,
        `अर्जदाराचा निवासी पत्ता: ${formData.get("address")}`,
        `नोंद: स्मशानभूमी / वैद्यकीय प्रमाणपत्र जोडले आहे.`,
      ].join("\n");
    } else if (data.key === "water-bill") {
      name = (formData.get("applicantName") as string) || "";
      mobile = (formData.get("mobile") as string) || "";
      description = [
        `[नवीन पाणी नळ जोडणी / पाणी बिल सेवा अर्ज]`,
        `अर्जदाराचे नाव: ${name}`,
        `मालमत्ता क्रमांक / घर क्रमांक: ${formData.get("propertyNo")}`,
        `जोडणीचा प्रकार: ${formData.get("connectionType")}`,
        `आवश्यक पाईप आकार: ${formData.get("pipeSize")}`,
        `जोडणी पत्ता: ${formData.get("address")}`,
        `तपशील: ${formData.get("notes") || "कोणतीही विशेष नोंद नाही"}`,
      ].join("\n");
    } else if (data.key === "construction-permit") {
      name = (formData.get("ownerName") as string) || "";
      mobile = (formData.get("mobile") as string) || "";
      description = [
        `[बांधकाम परवानगी व नकाशा मंजुरी अर्ज]`,
        `जागा मालकाचे नाव: ${name}`,
        `सी.टी.एस. क्र. / गट नंबर / प्लॉट क्र.: ${formData.get("ctsNo")}`,
        `बांधकामाचा प्रकार: ${formData.get("constructionType")}`,
        `प्रस्तावित चटई क्षेत्रफळ (Built-up Area): ${formData.get("areaSqFt")} चौ. फूट`,
        `नोंदणीकृत वास्तुविशारद / अभियंता नाव: ${formData.get("architectName")}`,
        `बांधकाम जागेचा पत्ता: ${formData.get("address")}`,
      ].join("\n");
    } else if (data.key === "property-tax") {
      name = (formData.get("ownerName") as string) || "";
      mobile = (formData.get("mobile") as string) || "";
      description = [
        `[मालमत्ता कर नोंदणी व फेरफार अर्ज]`,
        `मालकाचे नाव: ${name}`,
        `विद्यमान मालमत्ता क्रमांक (असल्यास): ${formData.get("propertyNo") || "नवीन"}`,
        `अर्जाचा उद्देश: ${formData.get("purpose")}`,
        `मालमत्तेचा प्रकार: ${formData.get("propertyType")}`,
        `मालमत्तेचा सविस्तर पत्ता: ${formData.get("address")}`,
      ].join("\n");
    }

    // Strict 10-digit mobile number validation (no fake / repeating numbers like 9999999999)
    const mobileCheck = validateMobileInput(mobile || mobileValue, lang);
    if (!mobileCheck.isValid) {
      setError(
        mobileCheck.error ||
          t("कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.", "Please enter a valid 10-digit mobile number.")
      );
      return;
    }

    try {
      setSubmitting(true);
      setApplicantMobile(mobileCheck.cleaned);
      const record = await createComplaint({
        name: name.trim(),
        mobile: mobileCheck.cleaned,
        type: `दाखला/सेवा: ${data.title}`,
        department: "लोकसेवा हक्क व दाखले कक्ष",
        description,
        files,
      });

      const generatedId = record.trackingId || `WMC-${record.id.slice(0, 6).toUpperCase()}`;
      setTrackingId(generatedId);
      form.reset();
      setMobileValue("");
      setFiles([]);
    } catch (err) {
      console.error("Failed to submit service application:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("अर्ज सादर करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.", "Failed to submit application. Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-12 bg-gradient-to-b from-background via-muted/30 to-background border-b relative overflow-hidden">
        {/* Decorative Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Service Hero Banner */}
            <div className="gov-gradient rounded-3xl p-8 md:p-10 text-primary-foreground shadow-2xl relative overflow-hidden animate-in fade-in duration-500">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-4">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {t("डिजिटल नागरी सेवा सेतू", "Digital Citizen Service Portal")}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white">{t(data.title, data.titleEn)}</h1>
                  <p className="text-primary-foreground/90 text-sm font-medium mt-1">
                    {t("वाई नगरपरिषद, जिल्हा सातारा", "Wai Municipal Council, Satara")}
                  </p>
                </div>
              </div>

              <p className="text-primary-foreground/90 leading-relaxed text-sm md:text-base border-t border-white/20 pt-4">
                {t(data.desc, data.descEn)}
              </p>
            </div>

            {/* Quick Metrics Bar (3 Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl p-5 border border-border shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{t("अंदाजित कालावधी", "Processing Time")}</p>
                  <p className="font-extrabold text-foreground text-sm mt-0.5">{t(data.time, data.timeEn)}</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{t("शासकीय शुल्क", "Service Fee")}</p>
                  <p className="font-extrabold text-foreground text-sm mt-0.5">{t(data.fee, data.feeEn)}</p>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border shadow-md flex items-center gap-4 hover:shadow-xl transition-all">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{t("सेवा स्थिती", "Portal Status")}</p>
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">{t("डिजिटल प्रक्रिया उपलब्ध", "Digital Processing Ready")}</p>
                </div>
              </div>
            </div>

            {/* Split Section: Required Documents & Workflow Steps */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Documents Needed Card */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>{t("आवश्यक कागदपत्रे", "Required Documents")}</span>
                </h2>
                <div className="space-y-2.5">
                  {data.documents.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/70">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-semibold text-foreground">{t(d, data.documentsEn[i])}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Steps Card */}
              <div className="bg-card rounded-3xl p-6 border border-border shadow-xl space-y-4">
                <h2 className="text-lg font-black text-foreground flex items-center gap-2 border-b border-border pb-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span>{t("टप्प्याटप्प्याने अर्ज प्रक्रिया", "Application Workflow Steps")}</span>
                </h2>
                <div className="space-y-3">
                  {data.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                      <div className="w-7 h-7 rounded-xl gov-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-xs text-primary-foreground font-black">{i + 1}</span>
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-foreground pt-1">{t(s, data.stepsEn[i])}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Online Application Form */}
            <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6">
                
                {/* Form Header */}
                <div className="text-center space-y-1 border-b border-border pb-5">
                  <h2 className="text-2xl font-black text-foreground">{t("ऑनलाइन अर्ज / नोंदणी फॉर्म", "Online Application Form")}</h2>
                  <p className="text-xs text-muted-foreground">
                    {t("खालील फॉर्ममध्ये आवश्यक माहिती अचूक भरून कागदपत्रांसह सादर करा.", "Fill out the required information accurately and submit with verification documents.")}
                  </p>
                </div>

                {/* SUCCESS VIEW - SHOW TRACKING ID ON SCREEN (NOT SMS) */}
                {trackingId ? (
                  <div className="p-8 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center text-4xl shadow-xl">
                      ✓
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {t("अर्ज यशस्वीरीत्या नोंदवला गेला!", "Application Registered Successfully!")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("आपला अर्ज वाई नगरपरिषद प्रशासनाकडे प्राप्त झाला आहे.", "Your application has been received by Wai Municipal Council.")}
                      </p>
                    </div>

                    {/* Prominent Tracking ID Box */}
                    <div className="bg-background/95 rounded-2xl p-5 border-2 border-emerald-500/40 shadow-inner max-w-md mx-auto space-y-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                        {t("आपला अर्ज ट्रॅकिंग आयडी (Tracking ID)", "Your Application Tracking ID")}
                      </span>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-primary tracking-wider selection:bg-primary selection:text-white">
                          {trackingId}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleCopy}
                          className="gap-1.5 font-bold rounded-xl border-primary/30 hover:bg-primary/10"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          <span className="text-xs">{copied ? t("कॉपी झाले!", "Copied!") : t("कॉपी करा", "Copy")}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Screenshot / Note Warning */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold max-w-md mx-auto leading-relaxed">
                      ⚠️ {t("कृपया हा ट्रॅकिंग आयडी लिहून किंवा स्क्रीनशॉट काढून ठेवा. अर्जाची सद्यस्थिती तपासण्यासाठी हा आयडी आवश्यक आहे.", "Please note down or take a screenshot of this Tracking ID. It is required to track your status.")}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <Button asChild className="w-full sm:w-auto gov-gradient text-white font-bold rounded-xl px-6 py-2.5 shadow-md">
                        <Link to={`/track?id=${trackingId}&mobile=${applicantMobile}`}>
                          <span>{t("अर्जाची स्थिती तपासा", "Track Application Status")}</span>
                          <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setTrackingId(null);
                          setError(null);
                        }}
                        className="w-full sm:w-auto font-bold rounded-xl"
                      >
                        {t("दुसरा नवीन अर्ज भरा", "Submit Another Application")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SPECIFIC SECTIONS ACCORDING TO SERVICE TYPE */}
                    {data.key === "birth-certificate" && (
                      <div className="space-y-6">
                        {/* Section 1: Child Details */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">१</span>
                            {t("बालकाचा तपशील", "Child Details")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("बालकाचे पूर्ण नाव *", "Child's Full Name *")}</label>
                              <Input required name="childName" placeholder={t("उदा. आरव सचिन माने", "e.g. Aarav Sachin Mane")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("जन्म तारीख *", "Date of Birth *")}</label>
                              <Input required name="dob" type="date" className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("लिंग *", "Gender *")}</label>
                              <select required name="gender" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value="">{t("लिंग निवडा...", "Select Gender...")}</option>
                                <option value="मुलगा (Male)">{t("मुलगा (Male)", "Male")}</option>
                                <option value="मुलगी (Female)">{t("मुलगी (Female)", "Female")}</option>
                                <option value="इतर (Other)">{t("इतर (Other)", "Other")}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("जन्माचे ठिकाण / रुग्णालय नाव *", "Place of Birth / Hospital Name *")}</label>
                              <Input required name="birthPlace" placeholder={t("उदा. ग्रामीण रुग्णालय वाई / मिशन हॉस्पिटल", "e.g. Rural Hospital Wai")} className="rounded-xl" />
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Parents Details */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">२</span>
                            {t("पालकांची माहिती व संपर्क", "Parents Details & Contact")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("वडिलांचे पूर्ण नाव *", "Father's Full Name *")}</label>
                              <Input required name="fatherName" placeholder={t("वडिलांचे नाव...", "Father's name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("आईचे पूर्ण नाव *", "Mother's Full Name *")}</label>
                              <Input required name="motherName" placeholder={t("आईचे नाव...", "Mother's name...")} className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground">{t("अर्जदाराचा मोबाइल नंबर *", "Mobile Number *")}</label>
                                <span className="text-[10px] font-mono text-muted-foreground">{mobileValue.length}/10 {t("अंक", "digits")}</span>
                              </div>
                              <Input
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
                                className="rounded-xl font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                {t("१० अंकी खरा नंबर (६ ते ९ ने सुरू; ९९९९९९९९९९ सारखे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; 9999999999 prohibited)")}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("कायमचा निवासी पत्ता *", "Permanent Address *")}</label>
                            <Textarea required name="address" rows={2} placeholder={t("घराचा क्रमांक, गल्ली/आळी, वाई...", "House no, street, Wai...")} className="rounded-xl" />
                          </div>
                        </div>
                      </div>
                    )}

                    {data.key === "death-certificate" && (
                      <div className="space-y-6">
                        {/* Section 1: Deceased Details */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">१</span>
                            {t("मृत व्यक्तीचा तपशील", "Deceased Person Details")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("मृत व्यक्तीचे पूर्ण नाव *", "Deceased Full Name *")}</label>
                              <Input required name="deceasedName" placeholder={t("पूर्ण नाव...", "Full name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("मृत्यू दिनांक *", "Date of Death *")}</label>
                              <Input required name="dod" type="date" className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("वय *", "Age *")}</label>
                              <Input required name="age" type="number" placeholder="उदा. 68" className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("लिंग *", "Gender *")}</label>
                              <select required name="gender" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value="">{t("निवडा...", "Select...")}</option>
                                <option value="पुरुष (Male)">{t("पुरुष (Male)", "Male")}</option>
                                <option value="स्त्री (Female)">{t("स्त्री (Female)", "Female")}</option>
                                <option value="इतर (Other)">{t("इतर (Other)", "Other")}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("मृत्यूचे ठिकाण *", "Place of Death *")}</label>
                              <Input required name="deathPlace" placeholder={t("घर / रुग्णालय नाव", "Home / Hospital")} className="rounded-xl" />
                            </div>
                          </div>
                        </div>

                        {/* Section 2: Applicant Details */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">२</span>
                            {t("अर्जदाराची माहिती व नातेसंबंध", "Applicant Details & Relation")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("अर्जदाराचे नाव *", "Applicant Name *")}</label>
                              <Input required name="applicantName" placeholder={t("तुमचे पूर्ण नाव...", "Your full name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("मृत व्यक्तीशी नाते *", "Relationship with Deceased *")}</label>
                              <Input required name="relation" placeholder={t("उदा. मुलगा / मुलगी / पती / पत्नी", "e.g. Son, Daughter, Spouse")} className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                                <span className="text-[10px] font-mono text-muted-foreground">{mobileValue.length}/10 {t("अंक", "digits")}</span>
                              </div>
                              <Input
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
                                className="rounded-xl font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                {t("१० अंकी खरा नंबर (६ ते ९ ने सुरू; ९९९९९९९९९९ सारखे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; 9999999999 prohibited)")}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("अर्जदाराचा निवासी पत्ता *", "Address *")}</label>
                            <Textarea required name="address" rows={2} placeholder={t("पत्ता...", "Address...")} className="rounded-xl" />
                          </div>
                        </div>
                      </div>
                    )}

                    {data.key === "water-bill" && (
                      <div className="space-y-6">
                        {/* Section 1: Applicant & Property */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">१</span>
                            {t("अर्जदार व मालमत्ता माहिती", "Applicant & Property Details")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("अर्जदाराचे पूर्ण नाव *", "Applicant Full Name *")}</label>
                              <Input required name="applicantName" placeholder={t("पूर्ण नाव...", "Full name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                                <span className="text-[10px] font-mono text-muted-foreground">{mobileValue.length}/10 {t("अंक", "digits")}</span>
                              </div>
                              <Input
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
                                className="rounded-xl font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                {t("१० अंकी खरा नंबर (६ ते ९ ने सुरू; ९९९९९९९९९९ सारखे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; 9999999999 prohibited)")}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("मालमत्ता कर नोंदणी क्र. / घर क्र. *", "Property Tax / House No. *")}</label>
                            <Input required name="propertyNo" placeholder={t("उदा. WMC-TAX-4521 किंवा घर क्र. 124", "Property Tax No.")} className="rounded-xl" />
                          </div>
                        </div>

                        {/* Section 2: Connection Details */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">२</span>
                            {t("नळ जोडणी तपशील", "Connection Details")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("जोडणी प्रकार *", "Connection Type *")}</label>
                              <select required name="connectionType" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value="घरगुती नळ जोडणी (Domestic)">{t("घरगुती नळ जोडणी (Domestic)", "Domestic Connection")}</option>
                                <option value="व्यावसायिक / हॉटेल जोडणी (Commercial)">{t("व्यावसायिक जोडणी (Commercial)", "Commercial Connection")}</option>
                                <option value="औद्योगिक जोडणी (Industrial)">{t("औद्योगिक जोडणी (Industrial)", "Industrial Connection")}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("पाईप आकार *", "Pipe Size *")}</label>
                              <select required name="pipeSize" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value='१/२" (अर्धा इंच - मानक)'>1/2" (Half Inch - Standard)</option>
                                <option value='३/४" (पाऊण इंच)'>3/4" (Three-quarter Inch)</option>
                                <option value='१" (एक इंच)'>1" (One Inch)</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("नळ जोडणीचे अचूक ठिकाण व पत्ता *", "Site Address *")}</label>
                            <Textarea required name="address" rows={2} placeholder={t("सविस्तर पत्ता...", "Full address...")} className="rounded-xl" />
                          </div>
                        </div>
                      </div>
                    )}

                    {data.key === "construction-permit" && (
                      <div className="space-y-6">
                        {/* Section 1: Land & Owner */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">१</span>
                            {t("जागा व मालकाचा तपशील", "Land & Owner Details")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("जमीन मालकाचे पूर्ण नाव *", "Land Owner Full Name *")}</label>
                              <Input required name="ownerName" placeholder={t("मालकाचे नाव...", "Owner name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                                <span className="text-[10px] font-mono text-muted-foreground">{mobileValue.length}/10 {t("अंक", "digits")}</span>
                              </div>
                              <Input
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
                                className="rounded-xl font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                {t("१० अंकी खरा नंबर (६ ते ९ ने सुरू; ९९९९९९९९९९ सारखे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; 9999999999 prohibited)")}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("सी.टी.एस. क्र. / गट नंबर / प्लॉट क्र. *", "CTS / Survey / Plot No. *")}</label>
                            <Input required name="ctsNo" placeholder={t("उदा. CTS No. 1542, Plot 8", "e.g. CTS No. 1542")} className="rounded-xl" />
                          </div>
                        </div>

                        {/* Section 2: Construction Details */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">२</span>
                            {t("बांधकाम प्रस्ताव तपशील", "Construction Proposal")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("बांधकामाचा प्रकार *", "Construction Type *")}</label>
                              <select required name="constructionType" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value="नवीन निवासी इमारत (New Residential)">{t("नवीन निवासी इमारत (New Residential)", "New Residential")}</option>
                                <option value="व्यावसायिक संकुल (Commercial)">{t("व्यावसायिक संकुल (Commercial)", "Commercial Complex")}</option>
                                <option value="निवासी + व्यावसायिक मिश्र">{t("निवासी + व्यावसायिक मिश्र", "Mixed Use")}</option>
                                <option value="अतिरिक्त मजला / विस्तार">{t("अतिरिक्त मजला / विस्तार", "Floor Addition / Extension")}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("प्रस्तावित चटई क्षेत्रफळ (चौ. फूट) *", "Built-up Area (Sq.Ft) *")}</label>
                              <Input required name="areaSqFt" type="number" placeholder="उदा. 1250" className="rounded-xl" />
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("नोंदणीकृत वास्तुविशारद / अभियंता नाव *", "Registered Architect Name *")}</label>
                              <Input required name="architectName" placeholder={t("अभियंत्याचे नाव...", "Architect name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("बांधकामाचा संपूर्ण पत्ता *", "Full Site Address *")}</label>
                              <Input required name="address" placeholder={t("जागेचा संपूर्ण पत्ता...", "Full address...")} className="rounded-xl" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {data.key === "property-tax" && (
                      <div className="space-y-6">
                        {/* Section 1: Owner & Property */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">१</span>
                            {t("मालमत्ता व मालक तपशील", "Owner & Property Details")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("मालकाचे पूर्ण नाव *", "Owner Full Name *")}</label>
                              <Input required name="ownerName" placeholder={t("पूर्ण नाव...", "Full name...")} className="rounded-xl" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                                <span className="text-[10px] font-mono text-muted-foreground">{mobileValue.length}/10 {t("अंक", "digits")}</span>
                              </div>
                              <Input
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
                                className="rounded-xl font-mono"
                              />
                              <p className="text-[10px] text-muted-foreground">
                                {t("१० अंकी खरा नंबर (६ ते ९ ने सुरू; ९९९९९९९९९९ सारखे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; 9999999999 prohibited)")}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("विद्यमान मालमत्ता क्रमांक (असल्यास)", "Existing Assessment No. (If any)")}</label>
                            <Input name="propertyNo" placeholder={t("उदा. WMC-PROP-0092 (पर्यायी)", "Optional")} className="rounded-xl" />
                          </div>
                        </div>

                        {/* Section 2: Mutation & Purpose */}
                        <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 border-b border-border/60 pb-2">
                            <span className="w-6 h-6 rounded-lg gov-gradient text-white flex items-center justify-center text-xs">२</span>
                            {t("अर्जाचा उद्देश व प्रकार", "Application Purpose & Type")}
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("अर्जाचा उद्देश *", "Purpose *")}</label>
                              <select required name="purpose" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value="नवीन कर आकारणी नोंद">{t("नवीन कर आकारणी नोंद", "New Assessment")}</option>
                                <option value="खरेदीखतानुसार नाव बदल (फेरफार)">{t("खरेदीखतानुसार नाव बदल (फेरफार)", "Name Change via Sale Deed")}</option>
                                <option value="वारस हक्क नोंद (वारसा फेरफार)">{t("वारस हक्क नोंद (वारसा फेरफार)", "Succession Mutation")}</option>
                                <option value="क्षेत्रफळ दुरुस्ती किंवा बदल">{t("क्षेत्रफळ दुरुस्ती किंवा बदल", "Area Revision")}</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-foreground">{t("मालमत्ता प्रकार *", "Property Type *")}</label>
                              <select required name="propertyType" className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm">
                                <option value="निवासी (Residential)">{t("निवासी (Residential)", "Residential")}</option>
                                <option value="व्यावसायिक (Commercial)">{t("व्यावसायिक (Commercial)", "Commercial")}</option>
                                <option value="मोकळा भूखंड (Open Plot)">{t("मोकळा भूखंड (Open Plot)", "Open Plot")}</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-foreground">{t("मालमत्तेचा संपूर्ण पत्ता *", "Full Property Address *")}</label>
                            <Textarea required name="address" rows={2} placeholder={t("गल्ली, लँडमार्क, घर नंबर...", "Address...")} className="rounded-xl" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SECTION: MANDATORY DOCUMENT UPLOADS */}
                    <div className="p-5 rounded-2xl bg-amber-500/5 border-2 border-dashed border-amber-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-amber-600" />
                          {t("आवश्यक कागदपत्रे व पुरावे अपलोड करा * (अनिवार्य)", "Upload Required Documents & Proof * (Mandatory)")}
                        </label>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {t("कमाल १० MB", "Max 10 MB")}
                        </span>
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer p-6 rounded-xl bg-card border border-border text-center hover:border-primary hover:bg-primary/5 transition-all space-y-1"
                      >
                        <Upload className="w-7 h-7 text-primary mx-auto" />
                        <p className="text-xs font-bold text-foreground">
                          {t("कागदपत्रे निवडण्यासाठी येथे क्लिक करा (PDF / JPG / PNG)", "Click here to choose verification files (PDF / JPG / PNG)")}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {t("उदा. पावती, ७/१२ उतारा, ओळखपत्र, नोंदणी स्लिप", "e.g. Receipt, 7/12 extract, ID proof, discharge slip")}
                        </p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {/* Uploaded Files Preview */}
                      {files.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ✓ {files.length} {t("कागदपत्रे जोडली:", "documents attached:")}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {files.map((f, i) => (
                              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border text-xs">
                                <span className="truncate max-w-[180px] font-medium">{f.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(i)}
                                  className="text-muted-foreground hover:text-destructive p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold">
                        ⚠️ {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="gov-gradient text-white w-full py-6 text-base font-black rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {submitting ? (
                        <>
                          <LoaderCircle className="w-5 h-5 mr-2 animate-spin" />
                          <span>{t("अर्ज नोंदवत आहे...", "Submitting Application...")}</span>
                        </>
                      ) : (
                        <>
                          <span>{t("अर्ज सबमिट करा व ट्रॅकिंग आयडी मिळवा", "Submit Application & Get Tracking ID")}</span>
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const serviceData: Record<string, ServiceData> = {
  "property-tax": {
    key: "property-tax",
    icon: Home, title: "मालमत्ता कर भरणा व नोंदणी", titleEn: "Property Tax Payment & Registration",
    fee: "मालमत्तेनुसार बदलते", feeEn: "Varies by property",
    time: "तात्काळ ते ७ दिवस", timeEn: "Instant to 7 days",
    desc: "आपल्या मालमत्तेचा कर ऑनलाइन भरा, नवीन कर आकारणीसाठी किंवा मालकी हक्क फेरफारसाठी ऑनलाइन अर्ज करा.",
    descEn: "Pay property tax online, apply for new property assessment or mutation.",
    documents: ["मालमत्ता कर बिल / मागील पावती", "खरेदीखत किंवा इंडेक्स २", "ओळखपत्र (आधार/पॅन)", "वारस नोंद पुरावा (लागू असल्यास)"],
    documentsEn: ["Property tax bill / previous receipt", "Sale Deed or Index-II", "ID proof (Aadhaar/PAN)", "Succession document (if applicable)"],
    steps: ["तपशील भरा", "खरेदीखत / पावती अपलोड करा", "अर्ज सबमिट करा", "ट्रॅकिंग आयडी मिळवा", "अर्जाची प्रगती तपासा"],
    stepsEn: ["Fill details", "Upload sale deed / receipt", "Submit application", "Get tracking ID", "Track status online"],
  },
  "water-bill": {
    key: "water-bill",
    icon: Droplets, title: "नवीन पाणी नळ जोडणी व बिल सेवा", titleEn: "Water Bill & New Tap Connection",
    fee: "सरकारी नियमानुसार", feeEn: "As per council rules",
    time: "७ ते १५ कामकाजी दिवस", timeEn: "7-15 working days",
    desc: "नवीन नळ जोडणी मिळवण्यासाठी अथवा पाणी बिल भरण्यासाठी थेट अर्ज करा. अधिकृत पावती व ट्रॅकिंग मिळवा.",
    descEn: "Apply for new tap connection or water billing service directly online.",
    documents: ["मालमत्ता कर भरणा पावती", "घरमालकी पुरावा किंवा ७/१२", "अर्जदाराचे ओळखपत्र (आधार कार्ड)"],
    documentsEn: ["Property tax paid receipt", "Ownership proof or 7/12", "Applicant ID proof (Aadhaar)"],
    steps: ["तपशील भरा", "जोडणीचा प्रकार निवडा", "कागदपत्रे अपलोड करा", "थेट ट्रॅकिंग आयडी मिळवा"],
    stepsEn: ["Fill details", "Select connection type", "Upload documents", "Receive instant tracking ID"],
  },
  "birth-certificate": {
    key: "birth-certificate",
    icon: FileText, title: "जन्म दाखला अर्ज", titleEn: "Birth Certificate Application",
    fee: "₹ ५० (शासकीय नियमानुसार)", feeEn: "₹ 50 (Official Fee)",
    time: "३ ते ७ कामकाजी दिवस", timeEn: "3 to 7 working days",
    desc: "वाई नगरपरिषदेच्या हद्दीत झालेल्या जन्माचा अधिकृत दाखला मिळवण्यासाठी ऑनलाइन अर्ज करा.",
    descEn: "Apply online to receive official birth certificate within Wai municipal limits.",
    documents: ["रुग्णालय जन्म नोंद स्लिप / डिस्चार्ज कार्ड", "आई-वडिलांचे आधार कार्ड", "निवासी पत्ता पुरावा"],
    documentsEn: ["Hospital birth slip / discharge card", "Parents' Aadhaar cards", "Address proof"],
    steps: ["बालकाचा व पालकांचा तपशील भरा", "रुग्णालय स्लिप अपलोड करा", "अर्ज सबमिट करा", "ट्रॅकिंग आयडी मिळवा"],
    stepsEn: ["Fill child & parents details", "Upload hospital slip", "Submit form", "Get tracking ID"],
  },
  "death-certificate": {
    key: "death-certificate",
    icon: Skull, title: "मृत्यू दाखला अर्ज", titleEn: "Death Certificate Application",
    fee: "₹ ५० (शासकीय नियमानुसार)", feeEn: "₹ 50 (Official Fee)",
    time: "३ ते ७ कामकाजी दिवस", timeEn: "3 to 7 working days",
    desc: "अधिकृत मृत्यू दाखल्यासाठी ऑनलाइन अर्ज करा. नोंदणी पडताळणीनंतर डिजिटल प्रत वितरित केली जाईल.",
    descEn: "Apply online for official death certificate. Delivered upon municipal verification.",
    documents: ["स्मशानभूमी नोंद पावती", "डॉक्टरांचे वैद्यकीय मृत्यू प्रमाणपत्र", "मृत व्यक्ती व अर्जदाराचे आधार कार्ड"],
    documentsEn: ["Crematorium receipt", "Doctor's medical certificate", "Deceased & applicant ID proof"],
    steps: ["मृत व्यक्ती व अर्जदार तपशील भरा", "स्मशानभूमी पावती अपलोड करा", "अर्ज सादर करा", "ट्रॅकिंग आयडी मिळवा"],
    stepsEn: ["Fill deceased & applicant details", "Upload crematorium receipt", "Submit application", "Get tracking ID"],
  },
  "construction-permit": {
    key: "construction-permit",
    icon: HardHat, title: "बांधकाम परवानगी व नकाशा मंजुरी", titleEn: "Construction Permit & Plan Sanction",
    fee: "चटई क्षेत्रफळ व नियमांनुसार", feeEn: "As per built-up area rules",
    time: "१५ ते ३० कामकाजी दिवस", timeEn: "15 to 30 working days",
    desc: "नवीन निवासी किंवा व्यावसायिक इमारतीचे बांधकाम, अतिरिक्त मजला किंवा दुरुस्ती परवानगीसाठी ऑनलाइन अर्ज.",
    descEn: "Apply for building plan sanction and construction permission for residential or commercial projects.",
    documents: ["जागेचा ७/१२ उतारा / पी.आर. कार्ड", "अभियंता प्रमाणित बांधकाम नकाशा (Blueprint)", "मालकी हक्क दस्तऐवज", "ओळखपत्र"],
    documentsEn: ["7/12 extract / PR card", "Architect certified blueprint plan", "Ownership documents", "ID proof"],
    steps: ["प्लॉट व बांधकाम माहिती भरा", "नकाशा व ७/१२ अपलोड करा", "अर्ज सबमिट करा", "जागा तपासणी व मंजुरी"],
    stepsEn: ["Fill plot & proposed specs", "Upload blueprint & land records", "Submit application", "Site inspection & sanction"],
  },
};

export const PropertyTax = () => <ServicePage data={serviceData["property-tax"]} />;
export const WaterBill = () => <ServicePage data={serviceData["water-bill"]} />;
export const BirthCertificate = () => <ServicePage data={serviceData["birth-certificate"]} />;
export const DeathCertificate = () => <ServicePage data={serviceData["death-certificate"]} />;
export const ConstructionPermit = () => <ServicePage data={serviceData["construction-permit"]} />;

// Dedicated Complaint Redressal Page with department selection, complaint types, photo upload, and instant tracking ID
export const Complaint = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="py-10 bg-gradient-to-b from-background via-muted/30 to-background border-b">
        <div className="container mx-auto px-4 max-w-4xl mb-6">
          <div className="gov-gradient rounded-3xl p-6 md:p-8 text-primary-foreground shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30 flex-shrink-0">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t("नागरी तक्रार निवारण कक्ष", "Citizen Grievance Redressal")}
                </span>
                <h1 className="text-2xl md:text-3xl font-black text-white">{t("थेट नागरी तक्रार नोंदणी", "Direct Grievance Registration")}</h1>
                <p className="text-primary-foreground/90 text-xs md:text-sm mt-1">
                  {t(
                    "पाणी पुरवठा, रस्ते व खड्डे, स्वच्छता, कचरा, पथदिवे, गटारे इत्यादी नागरी समस्यांची थेट नोंदणी करा. तात्काळ ट्रॅकिंग आयडी प्राप्त करा.",
                    "Register civic issues directly for water, roads, potholes, sanitation, streetlights, drainage, etc. Receive instant tracking ID."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <ComplaintForm standalone={true} />
      </div>
    </PageLayout>
  );
};
