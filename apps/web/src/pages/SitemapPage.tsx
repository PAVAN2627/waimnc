import React from "react";
import PageLayout from "@/components/PageLayout";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2,
  FileText,
  Users,
  Shield,
  MapPin,
  ExternalLink,
  Phone,
  Landmark,
  Compass,
  Download,
} from "lucide-react";

interface SitemapSection {
  titleMr: string;
  titleEn: string;
  icon: any;
  items: {
    labelMr: string;
    labelEn: string;
    url: string;
    isExternal?: boolean;
    descriptionMr?: string;
    descriptionEn?: string;
  }[];
}

const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    titleMr: "मुख्य पृष्ठ व परिचय",
    titleEn: "About Council & Leadership",
    icon: Landmark,
    items: [
      { labelMr: "मुख्य पृष्ठ (Home)", labelEn: "Home Page", url: "/" },
      { labelMr: "नगरपालिका परिचय", labelEn: "Overview of Municipality", url: "/about/introduction" },
      { labelMr: "ऐतिहासिक वारसा", labelEn: "Heritage & History of Wai", url: "/about/history" },
      { labelMr: "प्रशासकीय रचना", labelEn: "Administrative Structure", url: "/about/structure" },
      { labelMr: "मा. नगराध्यक्ष", labelEn: "Municipal President Profile", url: "/about/mayor" },
      { labelMr: "मा. मुख्याधिकारी", labelEn: "Chief Officer Office", url: "/about/chief-officer" },
      { labelMr: "नगरसेवक यादी (२६ निर्वाचित लोकप्रतिनिधी)", labelEn: "Elected Corporators (26 Officials)", url: "/about/corporators" },
    ],
  },
  {
    titleMr: "ऑनलाइन नागरिक सेवा",
    titleEn: "Citizen Online Services",
    icon: FileText,
    items: [
      { labelMr: "नागरी तक्रार नोंदणी", labelEn: "Grievance Redressal Registration", url: "/services/complaint" },
      { labelMr: "तक्रार व अर्ज स्थिती ट्रॅकिंग", labelEn: "Track Grievance / Application", url: "/track" },
      { labelMr: "मालमत्ता कर भरणा व आकारणी", labelEn: "Property Tax Payment & Assessment", url: "/services/property-tax" },
      { labelMr: "पाणी पुरवठा व मीटर बिल", labelEn: "Water Supply & Meter Bill", url: "/services/water-bill" },
      { labelMr: "जन्म दाखला अर्ज", labelEn: "Birth Certificate Application", url: "/services/birth-certificate" },
      { labelMr: "मृत्यू दाखला अर्ज", labelEn: "Death Certificate Application", url: "/services/death-certificate" },
      { labelMr: "बांधकाम परवाना", labelEn: "Building Permission / Construction Permit", url: "/services/construction-permit" },
    ],
  },
  {
    titleMr: "शासकीय योजना व उपक्रम",
    titleEn: "Government Schemes",
    icon: Compass,
    items: [
      { labelMr: "सर्व शासकीय योजना पोर्टल", labelEn: "All Schemes Portal", url: "/schemes/all" },
      { labelMr: "केंद्र शासन पुरस्कृत योजना", labelEn: "Central Government Schemes", url: "/schemes/central" },
      { labelMr: "महाराष्ट्र शासन योजना", labelEn: "State Government Schemes", url: "/schemes/state" },
      { labelMr: "नगरपरिषद स्थानिक उपक्रम", labelEn: "Local Municipal Schemes", url: "/schemes/local" },
      { labelMr: "प्रधानमंत्री आवास योजना (PMAY)", labelEn: "Pradhan Mantri Awas Yojana", url: "/schemes/pmay" },
      { labelMr: "स्वच्छ भारत अभियान", labelEn: "Swachh Bharat Mission (Clean Wai)", url: "/schemes/swachh-bharat" },
    ],
  },
  {
    titleMr: "प्रशासकीय विभाग",
    titleEn: "Municipal Departments",
    icon: Building2,
    items: [
      { labelMr: "सामान्य प्रशासन विभाग", labelEn: "General Administration", url: "/departments/general-admin" },
      { labelMr: "आरोग्य व स्वच्छता विभाग", labelEn: "Health & Sanitation", url: "/departments/health" },
      { labelMr: "पाणीपुरवठा विभाग", labelEn: "Water Supply Works", url: "/departments/water" },
      { labelMr: "बांधकाम विभाग (PWD)", labelEn: "Public Works Department", url: "/departments/civil" },
      { labelMr: "नगररचना व नियोजन", labelEn: "Town Planning & Development", url: "/departments/planning" },
      { labelMr: "कर आकारणी व संकलन", labelEn: "Property & Local Tax Department", url: "/departments/tax" },
      { labelMr: "विद्युत व दिवाबत्ती विभाग", labelEn: "Electrical & Street Lighting", url: "/departments/electrical" },
      { labelMr: "माहिती तंत्रज्ञान कक्ष (IT)", labelEn: "Computer & IT Department", url: "/departments/computer" },
      { labelMr: "अग्निशमन विभाग", labelEn: "Fire & Disaster Management", url: "/departments/fire" },
      { labelMr: "जन्म-मृत्यू नोंदणी विभाग", labelEn: "Birth & Death Registration Cell", url: "/departments/birth-death" },
      { labelMr: "लेखा व वित्त विभाग", labelEn: "Finance & Accounts", url: "/departments/accounts" },
      { labelMr: "अभिलेख कक्ष", labelEn: "Records Room", url: "/departments/records" },
      { labelMr: "दिव्यांग कल्याण कक्ष", labelEn: "Disability Welfare Cell", url: "/departments/disabled" },
      { labelMr: "महिला व बालकल्याण कक्ष", labelEn: "Women & Child Welfare Cell", url: "/departments/women" },
      { labelMr: "निवडणूक कक्ष", labelEn: "Election Cell", url: "/departments/election" },
      { labelMr: "आस्थापना विभाग", labelEn: "Establishment Department", url: "/departments/establishment" },
    ],
  },
  {
    titleMr: "कायदे, नियम व निविदा",
    titleEn: "Acts, Tenders & Sabha",
    icon: Shield,
    items: [
      { labelMr: "ई-निविदा व लिलाव", labelEn: "E-Tenders & Procurement", url: "/tenders" },
      { labelMr: "कायदे, नियम व उपविधी", labelEn: "Laws, Rules & Byelaws", url: "/laws" },
      { labelMr: "महत्त्वाचे अधिनियम", labelEn: "Important Acts & Regulations", url: "/acts" },
      { labelMr: "शहर विकास योजना (DP)", labelEn: "City Development Plan", url: "/vikas-yojna" },
      { labelMr: "लाईव्ह सभा व ठराव", labelEn: "Live Sabha & Resolutions", url: "/live-sabha" },
      { labelMr: "शासकीय पोर्टल्स", labelEn: "Official Government Portals", url: "/portals" },
    ],
  },
  {
    titleMr: "पर्यटन, गॅलरी व संपर्क",
    titleEn: "Tourism, Gallery & Desk",
    icon: MapPin,
    items: [
      { labelMr: "वाई पर्यटन स्थळे व मंदिरे", labelEn: "Wai Heritage & Tourism", url: "/tourism" },
      { labelMr: "छायाचित्र दालन (गॅलरी)", labelEn: "Photo & Events Gallery", url: "/gallery" },
      { labelMr: "नागरी संपर्क व मदत कक्ष", labelEn: "Contact Us & Citizen Helpdesk", url: "/contact" },
      { labelMr: "XML Sitemap (शोध इंजिन सूची)", labelEn: "XML Sitemap (Raw Machine Feed)", url: "/sitemap.xml", isExternal: true },
      { labelMr: "HTML Sitemap (मशीन व क्रॉलर फाइल)", labelEn: "HTML Sitemap File (Direct Crawler)", url: "/sitemap.html", isExternal: true },
    ],
  },
];

const SitemapPage: React.FC = () => {
  const { t, lang } = useLanguage();

  return (
    <PageLayout>
      <div className="py-10 bg-background min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl space-y-8">
          
          {/* Header Banner */}
          <div className="gov-gradient rounded-3xl p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full pointer-events-none" />
            
            <div className="max-w-2xl space-y-2 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/30">
                <Compass className="w-3.5 h-3.5" />
                {t("संकेतस्थळ मार्गदर्शक", "Portal Navigation Directory")}
              </span>
              <h1 className="text-3xl md:text-5xl font-black">
                {t("साइटमॅप (HTML Sitemap)", "HTML Sitemap")}
              </h1>
              <p className="text-white/90 text-sm md:text-base font-medium">
                {t(
                  "वाई नगरपरिषदेच्या अधिकृत संकेतस्थळावरील सर्व पाने, सेवा, विभाग आणि योजनांची संपूर्ण वर्गवारी सूची.",
                  "Complete indexed directory of all citizen services, municipal departments, government schemes, and statutory pages."
                )}
              </p>
            </div>
          </div>

          {/* Quick Sitemap Links Strip */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm flex-wrap text-xs font-semibold">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-primary" />
              <span>{t("सर्च इंजिन व क्रॉलर फाइल्स:", "Search Engine & Crawler Files:")}</span>
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 font-mono font-bold"
              >
                <span>sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/sitemap.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 font-mono font-bold"
              >
                <span>sitemap.html (Static)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors flex items-center gap-1 font-mono"
              >
                <span>robots.txt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Grid of Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITEMAP_SECTIONS.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div
                  key={idx}
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-base font-black text-foreground">
                        {t(section.titleMr, section.titleEn)}
                      </h2>
                    </div>

                    <ul className="space-y-1.5">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          {item.isExternal ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
                            >
                              <span className="font-semibold text-primary group-hover:underline">
                                {t(item.labelMr, item.labelEn)}
                              </span>
                              <ExternalLink className="w-3 h-3 opacity-60 flex-shrink-0" />
                            </a>
                          ) : (
                            <Link
                              to={item.url}
                              className="group flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all"
                            >
                              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                {t(item.labelMr, item.labelEn)}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                →
                              </span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default SitemapPage;
