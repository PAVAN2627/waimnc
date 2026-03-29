import { useState, useRef } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const getMenuItems = (t: (mr: string, en: string) => string) => [
  { label: t("मुख्य पृष्ठ", "Home"), href: "/" },
  {
    label: t("आमच्याबद्दल", "About Us"),
    children: [
      { label: t("नगरपालिकेचा परिचय", "Introduction"), href: "/about/introduction" },
      { label: t("इतिहास", "History"), href: "/about/history" },
      { label: t("प्रशासकीय रचना", "Administrative Structure"), href: "/about/structure" },
      { label: t("नगराध्यक्ष", "Mayor"), href: "/about/mayor" },
      { label: t("मुख्याधिकारी", "Chief Officer"), href: "/about/chief-officer" },
      { label: t("नगरसेवक", "Corporators"), href: "/about/corporators" },
      { label: t("⚖️ कायदे व नियम", "⚖️ Laws & Rules"), href: "/laws" },
      { label: t("🏛️ पर्यटन स्थळे", "🏛️ Tourist Spots"), href: "/tourism" },
    ],
  },
  {
    label: t("विभाग", "Departments"),
    children: [
      { label: t("सामान्य प्रशासन", "General Administration"), href: "/departments/general-admin" },
      { label: t("आरोग्य व स्वच्छता", "Health & Sanitation"), href: "/departments/health" },
      { label: t("पाणी पुरवठा", "Water Supply"), href: "/departments/water" },
      { label: t("बांधकाम (सिव्हिल)", "Civil Department"), href: "/departments/civil" },
      { label: t("नगररचना विभाग", "Town Planning"), href: "/departments/planning" },
      { label: t("कर व मूल्यांकन", "Tax & Assessment"), href: "/departments/tax" },
      { label: t("विद्युत विभाग", "Electrical Department"), href: "/departments/electrical" },
      { label: t("संगणक विभाग", "Computer Department"), href: "/departments/computer" },
      { label: t("अग्निशमन विभाग", "Fire Department"), href: "/departments/fire" },
      { label: t("जन्म-मृत्यू नोंदणी", "Birth-Death Registration"), href: "/departments/birth-death" },
      { label: t("लेखा विभाग", "Accounts Department"), href: "/departments/accounts" },
      { label: t("अभिलेख कक्ष", "Records Department"), href: "/departments/records" },
      { label: t("दिव्यांग विभाग", "Disabled Dept."), href: "/departments/disabled" },
      { label: t("महिला व बाल कल्याण", "Women & Child Welfare"), href: "/departments/women" },
    ],
  },
  {
    label: t("नागरिक सेवा", "Citizen Services"),
    children: [
      { label: t("मालमत्ता कर भरणा", "Property Tax Payment"), href: "/services/property-tax" },
      { label: t("पाणी बिल भरणा", "Water Bill Payment"), href: "/services/water-bill" },
      { label: t("तक्रार नोंदवा", "Register Complaint"), href: "/services/complaint" },
      { label: t("जन्म दाखला", "Birth Certificate"), href: "/services/birth-certificate" },
      { label: t("मृत्यू दाखला", "Death Certificate"), href: "/services/death-certificate" },
      { label: t("बांधकाम परवानगी", "Construction Permit"), href: "/services/construction-permit" },
    ],
  },
  {
    label: t("योजना", "Schemes"),
    children: [
      { label: t("केंद्र शासन योजना", "Central Govt. Schemes"), href: "/schemes/central" },
      { label: t("राज्य शासन योजना", "State Govt. Schemes"), href: "/schemes/state" },
      { label: t("नगरपालिकेच्या योजना", "Municipal Schemes"), href: "/schemes/local" },
      { label: t("प्रधानमंत्री आवास योजना", "PM Housing Scheme"), href: "/schemes/pmay" },
      { label: t("स्वच्छ भारत मिशन", "Swachh Bharat Mission"), href: "/schemes/swachh-bharat" },
    ],
  },
  { label: t("निविदा", "Tenders"), href: "/tenders" },
  { label: t("🔍 अर्ज ट्रॅक करा", "🔍 Track Application"), href: "/track" },
  { label: t("🎥 लाईव्ह सभा", "🎥 Live Sabha"), href: "/live-sabha" },
  { label: t("गॅलरी", "Gallery"), href: "/gallery" },
  { label: t("संपर्क", "Contact"), href: "/contact" },
];

const MainNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  const menuItems = getMenuItems(t);

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50 border-b-4 border-primary">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 py-2">
          <img
            src="/wai-logo-withoutbg.png"
            alt="वाई नगर परिषद"
            className="w-14 h-14 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">{t("वाई नगर परिषद", "Wai Municipal Council")}</h1>
            <p className="text-xs text-muted-foreground">{t("जिल्हा सातारा, महाराष्ट्र", "District Satara, Maharashtra")}</p>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="relative"
            >
              {item.href ? (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 px-3 py-5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  className="flex items-center gap-1 px-3 py-5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`} />
                </button>
              )}
              {item.children && openDropdown === item.label && (
                <>
                  {/* invisible overlay to close on outside click */}
                  <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                  <div className="absolute top-full left-0 bg-card shadow-xl rounded-b-lg border min-w-[240px] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors group/item"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover/item:bg-primary transition-colors" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>



        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-card border-t max-h-[70vh] overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.href ? (
                <Link
                  to={item.href}
                  className="block px-4 py-3 text-sm font-medium border-b hover:bg-accent"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium border-b hover:bg-accent"
                  onClick={() => setMobileDropdown(mobileDropdown === item.label ? null : item.label)}
                >
                  {item.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileDropdown === item.label ? "rotate-180" : ""}`} />
                </button>
              )}
              {item.children && mobileDropdown === item.label && (
                <div className="bg-muted">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block px-8 py-2.5 text-sm border-b border-muted hover:bg-accent"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default MainNav;
