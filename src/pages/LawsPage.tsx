import React, { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, ExternalLink, Sparkles, Search, Scale, ShieldCheck, X, FileCheck2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ACTS = [
  { sr: "१", mr: "महाराष्ट्र नगरपरिषदा, नगरपंचायती व औद्योगिक नगरी अधिनियम १९६५", en: "Maharashtra Municipal Councils, Nagar Panchayats and Industrial Townships Act, 1965", url: "https://drive.google.com/file/d/1AlBJPTS3cj3JTrRiuCIaXd3nnTWD2v5V/view" },
  { sr: "२", mr: "महाराष्ट्र प्रादेशिक नगररचना अधिनियम, १९६६", en: "Maharashtra Regional and Town Planning Act, 1966", url: "https://drive.google.com/file/d/100Np3_67xwLsdOhju0vbNEhOMQ-l5dRl/view" },
  { sr: "३", mr: "भूमी संपादन अधिनियम, १८८४", en: "Land Acquisition Act, 1884", url: "https://drive.google.com/file/d/1r4HzjOHaeMNUuC0kkOgJx7mq6TECyRSz/view" },
  { sr: "४", mr: "जन्म-मृत्यू अधिनियम", en: "Birth and Death Registration Act", url: "https://drive.google.com/file/d/1O2a_s8C_huQxQcz0Nf0Tl0gx5wnHWmXS/view" },
  { sr: "५", mr: "माहितीचा अधिकार अधिनियम, २००५", en: "Right to Information Act, 2005", url: "https://drive.google.com/file/d/1LZycn__7mFcRFgyV1yURBJLKxm06yWfF/view" },
  { sr: "७", mr: "महाराष्ट्र (नागरी क्षेत्र) झाडे तोडण्यावर बंदी अधिनियम, १९७५", en: "Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975", url: "https://drive.google.com/file/d/1oYoLhNICHjr-eY7SQPhiY-U3iedfeHDj/view" },
  { sr: "८", mr: "लोक सेवाहक्क अधिनियम, २०१५", en: "Right to Public Services Act, 2015", url: "https://drive.google.com/file/d/1FMrGCJePRyOM3_gKQtktw0TVqXDQSYTo/view" },
  { sr: "९", mr: "लेखा संहिता", en: "Accounts Code", url: "https://drive.google.com/file/d/1-LoUXj4o6EHhFm6JPqxIWDbN7KfexwQF/view" },
];

const RULES: { mr: string; en: string }[] = [
  { mr: "महाराष्ट्र नगरपरिषद (पालिका सदस्य नामनिर्देशित करणे) नियम", en: "Maharashtra Municipal Council (Nomination of Municipal Members) Rules" },
  { mr: "महाराष्ट्र नगरपरिषद (अध्यक्ष निवडणूक) नियम", en: "Maharashtra Municipal Council (Election of President) Rules" },
  { mr: "महाराष्ट्र नगरपरिषद (उपाध्यक्ष निवडणूक) नियम", en: "Maharashtra Municipal Council (Election of Vice-President) Rules" },
  { mr: "महाराष्ट्र नगरपरिषद निवडणूक नियम, १९६६", en: "Maharashtra Municipal Council Election Rules, 1966" },
  { mr: "महाराष्ट्र नगरपरिषद (पालिका सदस्यांना करासंबंधी विशेष नोटीस काढणे) नियम, १९६७", en: "Maharashtra Municipal Council (Special Notice to Members regarding Tax) Rules, 1967" },
  { mr: "महाराष्ट्र नगरपरिषद (संरक्षित पिण्याच्या पाण्याच्या पुरवठा करण्याबाबतच्या योजनांच्या अटी व शर्ती) नियम, १९७०", en: "Maharashtra Municipal Council (Terms & Conditions of Protected Drinking Water Supply Schemes) Rules, 1970" },
  { mr: "महाराष्ट्र नगरपरिषद (पाणी पुरवठा राखीव निधी विनियमन) नियम, १९७०", en: "Maharashtra Municipal Council (Water Supply Reserve Fund Regulation) Rules, 1970" },
  { mr: "महाराष्ट्र नगरपरिषद (अध्यक्ष मानधन किंवा अतिथी भत्ता) नियम, १९६७", en: "Maharashtra Municipal Council (President's Honorarium or Guest Allowance) Rules, 1967" },
  { mr: "महाराष्ट्र नगरपरिषद (विषय समित्यांच्या निवडणूका) नियम, १९६६ / महाराष्ट्र नगरपरिषद (कामकाज चालविणे) नियम, १९६६", en: "Maharashtra Municipal Council (Election of Subject Committees) Rules, 1966 / (Conduct of Business) Rules, 1966" },
  { mr: "महाराष्ट्र नगरपरिषद (स्थावर मालमत्तेचे हस्तांतरण) नियम, १९८३", en: "Maharashtra Municipal Council (Transfer of Immovable Property) Rules, 1983" },
  { mr: "महाराष्ट्र नगरपरिषद (वादातील तडजोड) नियम, १९६७", en: "Maharashtra Municipal Council (Compromise in Disputes) Rules, 1967" },
  { mr: "महाराष्ट्र नगरपरिषद (स्वेच्छाधिन करासंबंधीच्या उपविधीतील इतर बाबी) नियम, १९७०", en: "Maharashtra Municipal Council (Other Matters in Bye-laws on Discretionary Tax) Rules, 1970" },
  { mr: "महाराष्ट्र नगरपरिषद (कराधिन उपविधीची स्थानिकरित्या पुनःप्रसिद्धी) नियम, १९६७", en: "Maharashtra Municipal Council (Local Republication of Tax Bye-laws) Rules, 1967" },
  { mr: "महाराष्ट्र नगरपरिषद (नगरपरिषदेस देय असलेल्या रकमांच्या संबंधातील बट्टा व व्याज) नियम, १९७०", en: "Maharashtra Municipal Council (Rebate and Interest on Amounts Due to Council) Rules, 1970" },
  { mr: "महाराष्ट्र नगरपरिषद (अटकावून ठेवलेल्या किंवा जप्त केलेल्या जंगम व स्थावर मालमत्तेची विक्री) नियम, १९६७", en: "Maharashtra Municipal Council (Sale of Detained or Seized Movable and Immovable Property) Rules, 1967" },
  { mr: "महाराष्ट्र नगरपरिषद (नाशवंत मालमत्तेची विक्री) नियम, १९६६", en: "Maharashtra Municipal Council (Sale of Perishable Property) Rules, 1966" },
  { mr: "महाराष्ट्र नगरपरिषद (वसुल करता न येण्याजोग्या येणे असलेल्या रकमा निर्लेखित करणे) नियम, १९६६", en: "Maharashtra Municipal Council (Writing Off Irrecoverable Dues) Rules, 1966" },
  { mr: "महाराष्ट्र नगरपरिषद (कोंडवाडे) नियम, १९७०", en: "Maharashtra Municipal Council (Pound) Rules, 1970" },
  { mr: "महाराष्ट्र नगरपरिषद (एकत्रित मालमत्ता कर) नियम, १९६९", en: "Maharashtra Municipal Council (Consolidated Property Tax) Rules, 1969" },
  { mr: "महाराष्ट्र नगरपरिषद (जाहिरात कर) नियम, १९७०", en: "Maharashtra Municipal Council (Advertisement Tax) Rules, 1970" },
  { mr: "महाराष्ट्र नगरपरिषद (शो-टॅक्स) नियम, १९६७", en: "Maharashtra Municipal Council (Show Tax) Rules, 1967" },
  { mr: "महाराष्ट्र 'ब' वर्ग नगरपरिषदांसाठी लागू असलेले आदर्श उपविधी व नियंत्रण नियमावली", en: "Model Bye-laws and Control Regulations applicable to Maharashtra 'B' Class Municipal Councils" },
  { mr: "महाराष्ट्र नगरपरिषदां लेखा संहिता नियम, १९७१", en: "Maharashtra Municipal Councils Accounts Code Rules, 1971" },
  { mr: "महाराष्ट्र नागरी सेवा नियम, १९८१", en: "Maharashtra Civil Services Rules, 1981" },
  { mr: "महाराष्ट्र नागरी सेवा (सेवेच्या सर्वसाधारण शर्ती) नियम", en: "Maharashtra Civil Services (General Conditions of Service) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (पदग्रहण कालावधी, परकिय सेवा) नियम", en: "Maharashtra Civil Services (Joining Time, Foreign Service) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (रजा) नियम", en: "Maharashtra Civil Services (Leave) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (वेतन) नियम", en: "Maharashtra Civil Services (Pay) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (शिस्त व अपिल) नियम", en: "Maharashtra Civil Services (Discipline and Appeal) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (वर्तणूक) नियम", en: "Maharashtra Civil Services (Conduct) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (निवृत्ती वेतन) नियम", en: "Maharashtra Civil Services (Pension) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (सुधारित वेतन) नियम", en: "Maharashtra Civil Services (Revised Pay) Rules" },
  { mr: "महाराष्ट्र नागरी सेवा (निवृत्ती वेतन अंशराशीकरण) नियम", en: "Maharashtra Civil Services (Commutation of Pension) Rules" },
  { mr: "महाराष्ट्र सर्वसाधारण भविष्य निर्वाह निधी नियम", en: "Maharashtra General Provident Fund Rules" },
];

const BYELAWS: { mr: string; en: string }[] = [
  { mr: "स्थायी समिती व विषय समित्या यांमध्ये विषयांचे वाटप", en: "Distribution of subjects between Standing Committee and Subject Committees" },
  { mr: "कर्मचाऱ्यांना तारण देणे", en: "Providing security to employees" },
  { mr: "अधिकाऱ्यांना व कर्मचाऱ्यांना देण्यात येणाऱ्या रजेचे विनियम", en: "Regulations for leave granted to officers and employees" },
  { mr: "नेमणूकांचे एकत्रिकरण", en: "Consolidation of appointments" },
  { mr: "अधिकारी व कर्मचारी यांना प्रवास व वाहनभत्ते", en: "Travel and conveyance allowances to officers and employees" },
  { mr: "कर्मचाऱ्यांच्या सेवेच्या कालावधीचे विनियमन करणे", en: "Regulation of service period of employees" },
  { mr: "निवृत्ती वेतन व इतर लाभ", en: "Pension and other benefits" },
  { mr: "भविष्य निर्वाह निधी", en: "Provident Fund" },
  { mr: "निलंबनाधीन अधिकाऱ्यांना व कर्मचाऱ्यांना देण्यात येणाऱ्या निर्वाह भत्त्यांचे नियमन", en: "Regulation of subsistence allowance to suspended officers and employees" },
  { mr: "नगरपरिषद कर्मचाऱ्यांना गणवेश पुरविणे", en: "Providing uniforms to municipal council employees" },
  { mr: "अधिकारी व कर्मचारी यांची वर्तणूक व शिस्त", en: "Conduct and discipline of officers and employees" },
  { mr: "वाहनांवरील कर", en: "Tax on vehicles" },
  { mr: "पथकर", en: "Toll tax" },
  { mr: "कुत्र्यांवरील कर", en: "Tax on dogs" },
  { mr: "विशेष स्वच्छता विषयक कर", en: "Special sanitation tax" },
  { mr: "पाणी पुरवठा व विशेष पाणीपट्टी", en: "Water supply and special water tax" },
  { mr: "विशेष शिक्षण कर", en: "Special education tax" },
  { mr: "सार्वजनिक रस्ते आणि ठिकाणे, मोकळ्या जागा व त्यांचा तात्पुरता भोगवटा करणे", en: "Temporary occupation of public roads, places and open spaces" },
  { mr: "नगरपरिषद व खाजगी बाजारपेठा आणि कत्तलखाने यांचे नियमन", en: "Regulation of municipal and private markets and slaughterhouses" },
  { mr: "मागणी संबंधीची नोटीस, अधिपत्र, अटकावून ठेवलेल्या गुराढोरांची परिरक्षा संबंधीची फी", en: "Fee for demand notices, warrants, and custody of detained cattle" },
  { mr: "रस्ते व रिकाम्या जागा", en: "Roads and open spaces" },
  { mr: "सार्वजनिक रस्त्यावर फेरीने माल विकण्याकरिता लायसन्स देणे", en: "Licensing for hawking goods on public roads" },
  { mr: "सार्वजनिक रस्त्यावर हातगाड्या चालविण्यासाठी लायसन्स देण्याबाबत", en: "Licensing for operating handcarts on public roads" },
  { mr: "सर्वेक्षकांना लायसेन्स देणे", en: "Licensing of surveyors" },
  { mr: "इमारत", en: "Buildings" },
  { mr: "बाह्य छपरे व भिंती ज्वालाग्राही असण्यावरील निर्बंध", en: "Restrictions on flammable outer roofs and walls" },
  { mr: "सार्वजनिक करमणूकींच्या ठिकाणी आगीस प्रतिबंध करण्याबाबत", en: "Prevention of fire at places of public entertainment" },
  { mr: "मृतांच्या विल्हेवाटीसाठी जागांची परिरक्षा", en: "Maintenance of places for disposal of the dead" },
  { mr: "जनावरांच्या प्रेतांची विल्हेवाट", en: "Disposal of carcasses of animals" },
  { mr: "तबेले गोठे इ. सारख्या जागांचे नियमन", en: "Regulation of stables, cowsheds and similar places" },
  { mr: "कारखान्यांचे नियमन", en: "Regulation of factories" },
  { mr: "कारखाने किंवा इतर जागा यामध्ये शिटीच्या किंवा भोंग्याचा वापर करण्याबाबत लायसेन्स", en: "Licensing for use of whistles or sirens in factories or other places" },
  { mr: "विनिर्दिष्ठ प्रयोजनासाठी वापर करण्याकरिता जागांचे नियमन", en: "Regulation of places for specified purposes" },
  { mr: "जागात किंवा जागांवर विनिर्दिष्ठ पदार्थ साठविण्याचे नियम", en: "Rules for storing specified articles in or on premises" },
  { mr: "कोणत्याही जागेत घरगुती वापराशिवाय इतर प्रयोजनार्थ विनिर्दिष्ठ केलेल्या वस्तू ठेवणे", en: "Keeping specified articles for purposes other than domestic use" },
  { mr: "अभिलेखाची तपासणी, प्रती व तपास", en: "Inspection, copies and search of records" },
  { mr: "नगरपालिकेच्या मालकीच्या मोटार वाहनांचा वापर करणे", en: "Use of motor vehicles owned by the municipality" },
  { mr: "अध्यक्ष, उपाध्यक्ष, समित्यांचे सभापती इत्यादी (प्रवास व दैनिक भत्ते)", en: "President, Vice-President, Committee Chairpersons etc. (Travel and Daily Allowances)" },
  { mr: "इमारती व जमिनी (मेहेतर काम व सफाई) यांच्याशी संबंधित आदर्श उप-विधी", en: "Model bye-laws related to buildings and lands (scavenging and cleaning)" },
  { mr: "घनकचरा व्यवस्थापन व साफसफाई नियोजन उपविधी", en: "Solid Waste Management and Cleanliness Planning Bye-laws" },
];

const STANDING_ORDER_URL = "https://drive.google.com/file/d/1t71_G_c3tIZ_Fz0ERa3Jgl3SpWtoIyZ4/view";

const ActRow = ({ item, preview, setPreview }: {
  item: typeof ACTS[0];
  preview: string | null;
  setPreview: (u: string | null) => void;
}) => {
  const { t } = useLanguage();
  const embedUrl = item.url ? item.url.replace("/view", "/preview") : "";
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <span className="text-primary font-mono font-extrabold text-xs w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            {item.sr}
          </span>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm md:text-base font-extrabold text-foreground leading-snug group-hover:text-primary transition-colors">
            {t(item.mr, item.en)}
          </p>
        </div>

        {item.url && (
          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setPreview(preview === embedUrl ? null : embedUrl)}
              className="flex items-center gap-1.5 text-xs border border-primary/30 text-primary bg-primary/5 px-4 py-2 rounded-xl font-bold hover:bg-primary/20 transition-all shadow-sm"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>{t("पहा", "Preview")}</span>
            </button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs gov-gradient text-white font-black px-4 py-2 rounded-xl hover:opacity-90 shadow-md hover:shadow-lg transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t("डाउनलोड", "Download")}</span>
            </a>
          </div>
        )}
      </div>

      {preview === embedUrl && (
        <div className="border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300 bg-card">
          <div className="gov-gradient text-primary-foreground px-6 py-3.5 flex items-center justify-between font-black text-sm">
            <span>{t("अधिनियम दस्तऐवज पूर्वावलोकन", "Act Document Preview")}</span>
            <button onClick={() => setPreview(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <iframe src={embedUrl} className="w-full h-[520px]" title="preview" allow="autoplay" />
        </div>
      )}
    </div>
  );
};

const ListRow = ({ sr, mr, en, url }: { sr: number; mr: string; en: string; url?: string }) => {
  const { t } = useLanguage();
  const defaultPdfUrl = url || "https://drive.google.com/file/d/1AlBJPTS3cj3JTrRiuCIaXd3nnTWD2v5V/view";
  const embedUrl = defaultPdfUrl.replace("/view", "/preview");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border rounded-2xl px-5 py-4 hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <span className="text-primary font-mono font-extrabold text-xs w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            {sr}
          </span>
          <FileCheck2 className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
          <p className="text-xs md:text-sm font-extrabold text-foreground group-hover:text-primary transition-colors leading-relaxed">
            {t(mr, en)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setShowPreview((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] border border-primary/30 text-primary bg-primary/5 px-3 py-1.5 rounded-xl font-bold hover:bg-primary/20 transition-all shadow-sm"
          >
            <ExternalLink className="h-3 w-3" />
            <span>{t("पहा", "Preview")}</span>
          </button>
          <a
            href={defaultPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] gov-gradient text-white font-black px-3 py-1.5 rounded-xl hover:opacity-90 shadow-md hover:shadow-lg transition-all"
          >
            <Download className="h-3 w-3" />
            <span>{t("PDF डाउनलोड", "PDF Download")}</span>
          </a>
        </div>
      </div>

      {showPreview && (
        <div className="border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-300 bg-card">
          <div className="gov-gradient text-primary-foreground px-5 py-3 flex items-center justify-between font-black text-xs">
            <span>{t("नियम / उपविधी PDF पूर्वावलोकन", "Rules / Bye-laws PDF Preview")}</span>
            <button onClick={() => setShowPreview(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe src={embedUrl} className="w-full h-[450px]" title="rule-preview" allow="autoplay" />
        </div>
      )}
    </div>
  );
};

const LawsPage = () => {
  const { t } = useLanguage();
  const [preview, setPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredActs = ACTS.filter((a) =>
    a.mr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRules = RULES.filter((r) =>
    r.mr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByelaws = BYELAWS.filter((b) =>
    b.mr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    {t("नगरपालिका वैधानिक चौकट", "Legal & Regulatory Framework")}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-white">{t("कायदे, नियम व उपविधी", "Laws & Regulations")}</h1>
                  <p className="text-primary-foreground/90 text-sm md:text-base font-medium mt-2 max-w-xl">
                    {t(
                      "वाई नगर परिषदेच्या कामकाजाशी संबंधित सर्व शासकीय अधिनियम, नियम, उपविधी व स्थायी आदेश दस्तऐवज.",
                      "Acts, Rules, Municipal Bye-laws & Standing Orders for Wai Municipal Council governance."
                    )}
                  </p>
                </div>

                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-4xl shadow-xl flex-shrink-0">
                  ⚖️
                </div>
              </div>
            </div>

            {/* Controls: Search Bar & Tabs */}
            <div className="space-y-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("कायदे, नियम किंवा उपविधी शोधा...", "Search acts, rules, or bye-laws...")}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                />
              </div>

              <Tabs defaultValue="acts">
                <TabsList className="p-1.5 bg-card border border-border rounded-2xl gap-2 shadow-sm w-full sm:w-auto overflow-x-auto justify-start flex-wrap">
                  <TabsTrigger value="acts" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                    📜 {t("अधिनियम (Acts)", "Acts")} ({filteredActs.length})
                  </TabsTrigger>
                  <TabsTrigger value="rules" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                    📋 {t("नियम (Rules)", "Rules")} ({filteredRules.length})
                  </TabsTrigger>
                  <TabsTrigger value="byelaws" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                    📁 {t("उपविधी (Bye-laws)", "Bye-laws")} ({filteredByelaws.length})
                  </TabsTrigger>
                  <TabsTrigger value="standing" className="rounded-xl px-5 py-2.5 text-xs font-extrabold data-[state=active]:gov-gradient data-[state=active]:text-white">
                    📌 {t("स्थायी निदेश", "Standing Orders")}
                  </TabsTrigger>
                </TabsList>

                {/* ACTS */}
                <TabsContent value="acts" className="mt-6 space-y-4">
                  {filteredActs.length === 0 && (
                    <p className="text-center py-8 text-sm text-muted-foreground bg-card rounded-2xl border border-border">{t("कोणताही अधिनियम सापडला नाही.", "No matching acts found.")}</p>
                  )}
                  {filteredActs.map((act) => (
                    <ActRow key={act.sr} item={act} preview={preview} setPreview={setPreview} />
                  ))}
                </TabsContent>

                {/* RULES */}
                <TabsContent value="rules" className="mt-6 space-y-3">
                  {filteredRules.length === 0 && (
                    <p className="text-center py-8 text-sm text-muted-foreground bg-card rounded-2xl border border-border">{t("कोणताही नियम सापडला नाही.", "No matching rules found.")}</p>
                  )}
                  {filteredRules.map((rule, i) => <ListRow key={i} sr={i + 1} mr={rule.mr} en={rule.en} />)}
                </TabsContent>

                {/* BYE-LAWS */}
                <TabsContent value="byelaws" className="mt-6 space-y-3">
                  {filteredByelaws.length === 0 && (
                    <p className="text-center py-8 text-sm text-muted-foreground bg-card rounded-2xl border border-border">{t("कोणतीही उपविधी सापडली नाही.", "No matching bye-laws found.")}</p>
                  )}
                  {filteredByelaws.map((bl, i) => <ListRow key={i} sr={i + 1} mr={bl.mr} en={bl.en} />)}
                </TabsContent>

                {/* STANDING ORDERS */}
                <TabsContent value="standing" className="mt-6 space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border border-border rounded-3xl p-6 shadow-md hover:shadow-xl transition-all">
                    <div className="flex items-center gap-3.5 flex-1">
                      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <Scale className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-foreground">{t("स्थायी निदेश — वाई नगर परिषद", "Standing Orders — Wai Municipal Council")}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{t("नगरपालिका प्रशासकीय कामकाज व कार्यपद्धती स्थायी निदेश", "Official standing orders governing council business and procedures.")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                      <button
                        onClick={() => setPreview(preview ? null : STANDING_ORDER_URL.replace("/view", "/preview"))}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs border border-primary/30 text-primary bg-primary/5 px-4 py-2.5 rounded-xl font-bold hover:bg-primary/20 transition-all shadow-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{t("पहा", "Preview")}</span>
                      </button>

                      <a
                        href={STANDING_ORDER_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs gov-gradient text-white font-black px-4 py-2.5 rounded-xl hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                      >
                        <Download className="h-4 w-4" />
                        <span>{t("डाउनलोड", "Download")}</span>
                      </a>
                    </div>
                  </div>

                  {preview && (
                    <div className="border-2 border-primary/30 rounded-3xl overflow-hidden shadow-2xl bg-card animate-in fade-in duration-300">
                      <div className="gov-gradient text-primary-foreground px-6 py-3.5 flex items-center justify-between font-black text-sm">
                        <span>{t("स्थायी निदेश दस्तऐवज पूर्वावलोकन", "Standing Orders Preview")}</span>
                        <button onClick={() => setPreview(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <iframe src={preview} className="w-full h-[580px]" title="Standing Orders Preview" allow="autoplay" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default LawsPage;
