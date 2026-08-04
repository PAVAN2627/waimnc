import React, { useState } from "react";
import { Droplets, Home, AlertTriangle, Baby, HeartPulse, HardHat, FileSearch, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const QuickServices = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  const services = [
    {
      icon: Droplets,
      label: t("पाणी बिल भरा", "Pay Water Bill"),
      desc: t("ऑनलाइन पाणी बिल भरा व पावती मिळवा", "Pay water charges & download receipt"),
      category: "bills",
      color: "text-blue-500 group-hover:text-blue-400",
      accent: "from-blue-500/10 via-cyan-500/5 to-transparent hover:border-blue-500/40",
      badge: t("फास्ट", "Fast"),
      to: "/services/water-bill",
    },
    {
      icon: Home,
      label: t("मालमत्ता कर भरा", "Pay Property Tax"),
      desc: t("घरपट्टी कर ऑनलाइन सवलतीसह भरा", "Calculate & pay property tax with discount"),
      category: "bills",
      color: "text-amber-500 group-hover:text-amber-400",
      accent: "from-amber-500/10 via-orange-500/5 to-transparent hover:border-amber-500/40",
      badge: t("सवलत उपलब्ध", "Discount Active"),
      to: "/services/property-tax",
    },
    {
      icon: AlertTriangle,
      label: t("तक्रार नोंदवा", "Register Complaint"),
      desc: t("रस्ते, दिवाबत्ती, पाणी व कचरा तक्रार", "Report roads, streetlights, garbage issues"),
      category: "permits",
      color: "text-red-500 group-hover:text-red-400",
      accent: "from-red-500/10 via-rose-500/5 to-transparent hover:border-red-500/40",
      badge: t("२४x७ तत्पर", "24x7 Active"),
      to: "/services/complaint",
    },
    {
      icon: Baby,
      label: t("जन्म दाखला", "Birth Certificate"),
      desc: t("जन्म नोंदणी दाखला अर्ज व डाऊनलोड", "Apply & download verified birth certificate"),
      category: "certificates",
      color: "text-emerald-500 group-hover:text-emerald-400",
      accent: "from-emerald-500/10 via-teal-500/5 to-transparent hover:border-emerald-500/40",
      badge: t("डिजिटल सही", "Digital Sign"),
      to: "/services/birth-certificate",
    },
    {
      icon: HeartPulse,
      label: t("मृत्यू दाखला", "Death Certificate"),
      desc: t("मृत्यू नोंदणी दाखला त्वरित प्राप्त करा", "Apply & receive death registration cert"),
      category: "certificates",
      color: "text-rose-500 group-hover:text-rose-400",
      accent: "from-rose-500/10 via-pink-500/5 to-transparent hover:border-rose-500/40",
      badge: t("डिजिटल सही", "Digital Sign"),
      to: "/services/death-certificate",
    },
    {
      icon: HardHat,
      label: t("बांधकाम परवानगी", "Construction Permit"),
      desc: t("इमारत बांधकाम नकाशा मंजुरी अर्ज", "Submit building map & permit application"),
      category: "permits",
      color: "text-purple-500 group-hover:text-purple-400",
      accent: "from-purple-500/10 via-indigo-500/5 to-transparent hover:border-purple-500/40",
      badge: t("नगररचना", "Town Plan"),
      to: "/services/construction-permit",
    },
    {
      icon: FileSearch,
      label: t("अर्ज स्थिती ट्रॅक करा", "Track Application"),
      desc: t("आपल्या अर्जाची सद्यस्थिती तपासा", "Check live progress of submitted requests"),
      category: "all",
      color: "text-cyan-500 group-hover:text-cyan-400",
      accent: "from-cyan-500/10 via-sky-500/5 to-transparent hover:border-cyan-500/40",
      badge: t("रीयल टाईम", "Real-time"),
      to: "/track",
    },
  ];

  const categories = [
    { id: "all", label: t("सर्व नागरी सेवा", "All Services") },
    { id: "bills", label: t("कर व बिल भरणा", "Taxes & Bills") },
    { id: "certificates", label: t("दाखले व नोंदणी", "Certificates") },
    { id: "permits", label: t("परवानग्या व तक्रार", "Permits & Grievance") },
  ];

  const filteredServices = services.filter((s) => {
    const matchesCategory = activeTab === "all" || s.category === activeTab;
    const matchesSearch =
      !searchFilter ||
      s.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.desc.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="services" className="py-14 bg-background relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("नागरी सेवा सेतू पोर्टल", "Nagari Seva Setu Portal")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {t("महत्त्वाच्या ऑनलाइन नागरिक सेवा", "Important Online Citizen Services")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-2">
            {t("नागरिकांसाठी एकाच क्लिकवर जलद, पारदर्शक व कागदपत्रमुक्त शासकीय सेवा", "Fast, transparent & paperless civic services at your fingertips")}
          </p>
        </div>

        {/* Interactive Category Tabs & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto p-1 bg-muted/60 rounded-xl border border-border">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === cat.id
                    ? "bg-card text-primary shadow-md border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Filter Search */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder={t("सेवा शोधा...", "Search service...")}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-card border border-border text-sm outline-none focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredServices.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.to}
                to={s.to}
                className={`group relative bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden bg-gradient-to-b ${s.accent}`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-background border border-border shadow-inner group-hover:scale-110 transition-transform ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {s.badge}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors flex items-center justify-between">
                    <span>{s.label}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {s.desc}
                  </p>
                </div>

                {/* Action Link Footer */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    {t("डिजिटल अर्ज करा", "Apply Online")}
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickServices;
