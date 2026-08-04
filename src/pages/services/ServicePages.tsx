import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Home, Droplets, MessageSquare, FileText, Skull, HardHat,
  ArrowRight, CheckCircle2, Clock, AlertCircle, Upload, Sparkles, ShieldCheck, CheckCircle, Send
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface ServiceData {
  icon: LucideIcon;
  title: string; titleEn: string;
  desc: string; descEn: string;
  fee: string; feeEn: string;
  time: string; timeEn: string;
  documents: string[]; documentsEn: string[];
  steps: string[]; stepsEn: string[];
}

const ServicePage = ({ data }: { data: ServiceData }) => {
  const { t } = useLanguage();
  const Icon = data.icon;
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
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
                    <Sparkles className="w-3.5 h-3.5" />
                    {t("डिजिटल नागरी सेवा सेतू", "Digital Citizen Service Portal")}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-black text-white">{t(data.title, data.titleEn)}</h1>
                  <p className="text-primary-foreground/90 text-sm font-medium mt-1">
                    {t("वाई नगर परिषद, जिल्हा सातारा", "Wai Municipal Council, Satara")}
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
                  <Sparkles className="w-5 h-5 text-primary" />
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
                <div className="text-center space-y-1 border-b border-border pb-5">
                  <h2 className="text-2xl font-black text-foreground">{t("ऑनलाइन अर्ज / मागणी पत्रक", "Online Application Form")}</h2>
                  <p className="text-xs text-muted-foreground">{t("खालील फॉर्ममध्ये योग्य माहिती भरून ऑनलाइन अर्ज सादर करा.", "Fill out the form below to submit your application directly.")}</p>
                </div>

                {submitted ? (
                  <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">{t("अर्ज यशस्वीरीत्या सादर झाला!", "Application Submitted Successfully!")}</h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      {t("तुमचा अर्ज नोंदवला गेला आहे. अर्जाचा आयडी व पुढील अपडेट्स तुमच्या मोबाइल नंबरवर SMS द्वारे पाठवले जातील.", "Your application ID and further status updates have been generated.")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{t("पूर्ण नाव *", "Full Name *")}</label>
                        <Input required placeholder={t("तुमचे नाव...", "Enter name...")} className="rounded-xl" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                        <Input required placeholder="98XXXXXXXX" type="tel" className="rounded-xl" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{t("ई-मेल (पर्यायी)", "Email (Optional)")}</label>
                        <Input placeholder="example@mail.com" type="email" className="rounded-xl" />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-foreground">{t("वार्ड / प्रभाग क्रमांक", "Ward Number")}</label>
                        <Input placeholder={t("वार्ड क्र. १ ते १७", "Ward 1 to 17")} className="rounded-xl" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{t("अर्जाचा तपशील / पत्ता *", "Application Address / Description *")}</label>
                      <Textarea required placeholder={t("सविस्तर तपशील किंवा पत्ता प्रविष्ट करा...", "Enter detailed address or request details...")} rows={3} className="rounded-xl" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">{t("आवश्यक कागदपत्रे अपलोड करा", "Upload Documents")}</label>
                      <label className="flex items-center justify-center gap-3 border-2 border-dashed border-border rounded-2xl p-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                        <Upload className="w-6 h-6 text-primary" />
                        <div className="text-center">
                          <span className="text-xs font-bold text-foreground block">
                            {files ? `${files.length} ${t("कागदपत्रे निवडली", "files selected")}` : t("कागदपत्रे निवडा (PDF/JPG)", "Choose files (PDF/JPG)")}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{t("कमाल आकार: ५ MB", "Max size: 5 MB")}</span>
                        </div>
                        <input type="file" onChange={(e) => setFiles(e.target.files)} className="hidden" multiple />
                      </label>
                    </div>

                    <Button type="submit" className="gov-gradient text-white w-full py-6 text-base font-black rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <span>{t("अर्ज सबमिट करा", "Submit Application")}</span>
                      <Send className="w-4 h-4 ml-2" />
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
    icon: Home, title: "मालमत्ता कर भरणा", titleEn: "Property Tax Payment",
    fee: "मालमत्तेनुसार बदलते", feeEn: "Varies by property",
    time: "तात्काळ", timeEn: "Instant",
    desc: "आपल्या मालमत्तेचा कर ऑनलाइन भरा. मालमत्ता क्रमांक टाकून थकबाकी तपासा आणि ऑनलाइन भरणा करा.",
    descEn: "Pay your property tax online. Enter property number to check dues and make payment.",
    documents: ["मालमत्ता कर बिल", "मालमत्ता नोंदणी क्रमांक", "ओळखपत्र (आधार/पॅन)", "मागील भरणा पावती"],
    documentsEn: ["Property tax bill", "Property registration number", "ID proof (Aadhaar/PAN)", "Previous payment receipt"],
    steps: ["मालमत्ता क्रमांक टाका", "थकबाकी तपासा", "रक्कम निवडा", "ऑनलाइन पेमेंट करा", "पावती डाउनलोड करा"],
    stepsEn: ["Enter property number", "Check dues", "Select amount", "Make online payment", "Download receipt"],
  },
  "water-bill": {
    icon: Droplets, title: "पाणी बिल भरणा", titleEn: "Water Bill Payment",
    fee: "बिलानुसार", feeEn: "As per bill",
    time: "तात्काळ", timeEn: "Instant",
    desc: "पाणी बिल ऑनलाइन भरा. ग्राहक क्रमांक वापरून बिल तपासा व डिजिटल पावती मिळवा.",
    descEn: "Pay water bill online. Check bill using customer number.",
    documents: ["ग्राहक क्रमांक", "मागील बिल प्रत", "ओळखपत्र"],
    documentsEn: ["Customer number", "Previous bill copy", "ID proof"],
    steps: ["ग्राहक क्रमांक टाका", "चालू बिल पहा", "ऑनलाइन पेमेंट करा", "पावती डाउनलोड करा"],
    stepsEn: ["Enter customer number", "View current bill", "Make online payment", "Download receipt"],
  },
  complaint: {
    icon: MessageSquare, title: "तक्रार नोंदवा", titleEn: "Register Complaint",
    fee: "मोफत", feeEn: "Free",
    time: "24-72 तास प्रतिसाद", timeEn: "24-72 hours response",
    desc: "नगरपालिका सेवांबद्दल ऑनलाइन तक्रार नोंदवा. तक्रार क्रमांक मिळवून प्रगतीचा थेट मागोवा घ्या.",
    descEn: "Register complaints about municipal services. Get complaint number and track progress.",
    documents: ["ओळखपत्र", "तक्रारीचे छायाचित्र (पर्यायी)", "पत्ता पुरावा"],
    documentsEn: ["ID proof", "Complaint photo (optional)", "Address proof"],
    steps: ["तक्रारीचा प्रकार निवडा", "तपशील भरा", "फोटो अपलोड करा", "तक्रार सबमिट करा", "तक्रार क्रमांक नोंदवा"],
    stepsEn: ["Select complaint type", "Fill details", "Upload photo", "Submit complaint", "Note complaint number"],
  },
  "birth-certificate": {
    icon: FileText, title: "जन्म दाखला", titleEn: "Birth Certificate",
    fee: "₹ 50", feeEn: "₹ 50",
    time: "7 कामकाजी दिवस", timeEn: "7 working days",
    desc: "जन्म दाखला मिळवण्यासाठी ऑनलाइन अर्ज करा. रुग्णालय नोंदणी क्रमांक आवश्यक.",
    descEn: "Apply for birth certificate online. Hospital registration number required.",
    documents: ["रुग्णालय जन्म नोंदणी", "पालकांचे ओळखपत्र", "पत्ता पुरावा", "लग्न प्रमाणपत्र"],
    documentsEn: ["Hospital birth record", "Parents' ID proof", "Address proof", "Marriage certificate"],
    steps: ["ऑनलाइन अर्ज भरा", "कागदपत्रे अपलोड करा", "शुल्क भरा", "अर्ज स्वीकृती", "दाखला डाउनलोड/संकलन"],
    stepsEn: ["Fill online application", "Upload documents", "Pay fee", "Application accepted", "Download/collect certificate"],
  },
  "death-certificate": {
    icon: Skull, title: "मृत्यू दाखला", titleEn: "Death Certificate",
    fee: "₹ 50", feeEn: "₹ 50",
    time: "7 कामकाजी दिवस", timeEn: "7 working days",
    desc: "मृत्यू दाखला मिळवण्यासाठी ऑनलाइन अर्ज करा.",
    descEn: "Apply online to get a death certificate.",
    documents: ["मृत्यू नोंदणी प्रमाणपत्र", "मृत व्यक्तीचे ओळखपत्र", "अर्जदाराचे ओळखपत्र", "वैद्यकीय प्रमाणपत्र"],
    documentsEn: ["Death registration certificate", "Deceased's ID proof", "Applicant's ID proof", "Medical certificate"],
    steps: ["ऑनलाइन अर्ज भरा", "कागदपत्रे अपलोड करा", "शुल्क भरा", "पडताळणी", "दाखला वितरण"],
    stepsEn: ["Fill online application", "Upload documents", "Pay fee", "Verification", "Certificate distribution"],
  },
  "construction-permit": {
    icon: HardHat, title: "बांधकाम परवानगी", titleEn: "Construction Permit",
    fee: "₹ 500 - ₹ 5,000", feeEn: "₹ 500 - ₹ 5,000",
    time: "15-30 कामकाजी दिवस", timeEn: "15-30 working days",
    desc: "नवीन बांधकाम किंवा दुरुस्तीसाठी परवानगी अर्ज. नकाशा व कागदपत्रे अपलोड करा.",
    descEn: "Apply for new construction or repair permission. Upload plans and documents.",
    documents: ["जमीन मालकी पुरावा (7/12 उतारा)", "बांधकाम नकाशा (अभियंता प्रमाणित)", "ओळखपत्र", "जुने बांधकाम परवाना (असल्यास)", "ना-हरकत प्रमाणपत्रे"],
    documentsEn: ["Land ownership proof (7/12 extract)", "Building plan (Engineer certified)", "ID proof", "Old construction permit (if any)", "No objection certificates"],
    steps: ["अर्ज भरा", "नकाशा व कागदपत्रे अपलोड करा", "शुल्क भरा", "तपासणी (जागेवर भेट)", "परवानगी मंजुरी/नामंजुरी"],
    stepsEn: ["Fill application", "Upload plans & documents", "Pay fee", "Inspection (site visit)", "Approval/Rejection"],
  },
};

export const PropertyTax = () => <ServicePage data={serviceData["property-tax"]} />;
export const WaterBill = () => <ServicePage data={serviceData["water-bill"]} />;
export const Complaint = () => <ServicePage data={serviceData.complaint} />;
export const BirthCertificate = () => <ServicePage data={serviceData["birth-certificate"]} />;
export const DeathCertificate = () => <ServicePage data={serviceData["death-certificate"]} />;
export const ConstructionPermit = () => <ServicePage data={serviceData["construction-permit"]} />;
