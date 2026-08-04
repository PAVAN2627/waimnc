import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Droplets,
  Home,
  AlertTriangle,
  FileSearch,
  Sparkles,
  ShieldCheck,
  Building2,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const getSlides = (t: (mr: string, en: string) => string) => [
  {
    image: "/wai-temple.jpg",
    tag: t("ऐतिहासिक वारसा", "Historic Heritage"),
    title: t("स्वच्छ, सुंदर आणि स्मार्ट वाई शहर", "Clean, Beautiful & Smart Wai City"),
    subtitle: t("शिवछत्रपतींच्या पावन भूमीवर, कृष्णा नदीच्या तीरावर वसलेले ऐतिहासिक वाई शहर", "Historic Wai city situated on the banks of Krishna River"),
  },
  {
    image: "/kashi-vishweshwar.jpg",
    tag: t("दक्षिण काशी", "Dakshin Kashi"),
    title: t("काशी विश्वेश्वर मंदिर व कृष्णा काठ घाट", "Kashi Vishweshwar Temple & Krishna Ghats"),
    subtitle: t("वाईच्या कृष्णा नदीकाठावरील पवित्र व भव्य धार्मिक तीर्थक्षेत्र", "Sacred and majestic pilgrimage site on Krishna riverbank"),
  },
  {
    image: "/menavali-vada.jpg",
    tag: t("पेशवेकालीन वास्तू", "Peshwa Heritage"),
    title: t("नाना फडणवीस मेणवली वाडा", "Nana Fadnavis Menawali Wada"),
    subtitle: t("पेशव्यांचे मुत्सद्दी मंत्री नाना फडणवीस यांचा ऐतिहासिक वाडा व घाट", "Historic wada & ghat of Peshwa minister Nana Fadnavis"),
  },
  {
    image: "/pandavagad.jpg",
    tag: t("पर्यटन व ट्रेकिंग", "Tourism & Trekking"),
    title: t("पांडवगड किल्ला वाई", "Pandavgad Fort Wai"),
    subtitle: t("पांडवांशी जोडलेला ऐतिहासिक पांडवगड किल्ला", "Historic Pandavgad Fort linked to Pandavas"),
  },
  {
    image: "/mandhardevi.jpg",
    tag: t("पवित्र देवस्थान", "Sacred Shrine"),
    title: t("मांढरदेवी श्री काळुबाई देवस्थान", "Mandhardevi Shri Kalubai Shrine"),
    subtitle: t("वाई परिसरातील प्रसिद्ध व पवित्र श्री काळुबाई देवस्थान", "Famous sacred Kalubai Shrine near Wai"),
  },
];

export const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useLanguage();
  const slides = getSlides(t);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance slider
  useEffect(() => {
    autoScrollRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [slides.length]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-quick-search"));
  };

  return (
    <section className="relative bg-gradient-to-b from-primary/5 via-background to-muted/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-6 pb-12 overflow-hidden border-b">
      {/* Background Decorative Circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Top PMC/PCMC Style Government Badge Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {t("वाई नगरपरिषद", "Wai Municipal Council")}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              | {t("सातारा जिल्हा, महाराष्ट्र शासन", "Satara District, Govt of Maharashtra")}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {t("डिजिटल नागरी सेवा सेतू कार्यरत", "Digital Civic Portal Active")}
            </span>
          </div>
        </div>

        {/* Main PMC/PCMC Split Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Portal Tagline, Hero Search & Core Action Launchers */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t("नागरी सेवा सेतू डिजिटल व्यासपीठ", "Nagari Seva Setu Portal")}</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.15]">
              {t("समृद्ध, सुंदर व स्मार्ट ", "Prosperous, Smart & ")}
              <span className="bg-gradient-to-r from-amber-500 via-orange-600 to-primary bg-clip-text text-transparent">
                {t("वाई नगरपरिषद", "Wai Municipal Council")}
              </span>
            </h1>

            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {t(
                "कृष्णा काठावरील ऐतिहासिक 'दक्षिण काशी' वाई शहरातील नागरिकांसाठी ऑनलाइन कर भरणा, दाखले व तक्रार निवारण सेवा एकाच क्लिकवर.",
                "Online tax payments, certificates, and grievance redressal for citizens of historic Wai city."
              )}
            </p>

            {/* Embedded Interactive Search Bar */}
            <form onSubmit={handleHeroSearch} className="relative max-w-xl group">
              <div className="relative flex items-center rounded-2xl bg-card border-2 border-primary/30 shadow-lg group-hover:border-primary transition-all p-1.5 overflow-hidden">
                <Search className="w-5 h-5 text-primary ml-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t("शोधा: पाणी बिल, मालमत्ता कर, दाखला, तक्रार...", "Search: Water bill, Tax, Certificate, Complaint...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => window.dispatchEvent(new CustomEvent("open-quick-search"))}
                  className="w-full px-3 py-2 bg-transparent text-foreground text-sm placeholder:text-muted-foreground outline-none"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("open-quick-search"))}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs md:text-sm transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>{t("शोधा", "Search")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Hero Core Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/services/complaint"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.03] flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{t("तक्रार नोंदवा", "Report Grievance")}</span>
              </Link>

              <Link
                to="/tourism"
                className="px-5 py-3 rounded-xl bg-card hover:bg-accent border border-border text-foreground font-semibold text-sm shadow-sm transition-all hover:scale-[1.03] flex items-center gap-2"
              >
                <span>{t("वाई पर्यटन स्थळे →", "Wai Tourism →")}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: High-Impact Card Carousel & City Heritage Showcase */}
          <div className="lg:col-span-6 relative">
            {/* Carousel Container */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-border/80 shadow-2xl bg-card group">
              {/* Image Frame */}
              <div className="relative h-[340px] md:h-[400px] w-full overflow-hidden">
                <img
                  src={slides[current].image}
                  alt={slides[current].title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              </div>

              {/* Slide Floating Info Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <div className="inline-block px-3 py-1 rounded-md bg-amber-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider mb-2 shadow-md">
                  {slides[current].tag}
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-md">
                  {slides[current].title}
                </h3>
                <p className="text-xs md:text-sm text-slate-200 opacity-90 line-clamp-2 max-w-lg mb-4">
                  {slides[current].subtitle}
                </p>

                {/* Slider Controls & Navigation */}
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <div className="flex items-center gap-1.5">
                    {slides.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`h-2 rounded-full transition-all ${
                          idx === current ? "w-7 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
                      className="p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrent((current + 1) % slides.length)}
                      className="p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900 border border-white/20 text-white transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating PMC/PCMC-Style Quick Access Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
          {[
            {
              icon: Droplets,
              title: t("पाणी बिल भरणा", "Water Bill Payment"),
              sub: t("ऑनलाइन पावती मिळवा", "Instant Receipt"),
              color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
              to: "/services/water-bill",
            },
            {
              icon: Home,
              title: t("मालमत्ता कर भरणा", "Property Tax Payment"),
              sub: t("सवलतीसह कर भरा", "Pay Property Tax"),
              color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
              to: "/services/property-tax",
            },
            {
              icon: AlertTriangle,
              title: t("तक्रार निवारण", "Grievance Redressal"),
              sub: t("२४ तासांत नोंदणी", "Register 24x7"),
              color: "text-red-500 bg-red-500/10 border-red-500/30",
              to: "/services/complaint",
            },
            {
              icon: FileSearch,
              title: t("अर्ज स्थिती ट्रॅक", "Track Application"),
              sub: t("थेट प्रगती तपासा", "Live Status Check"),
              color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
              to: "/track",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.to}
                className="group p-4 rounded-2xl bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center gap-3.5"
              >
                <div className={`p-3 rounded-xl border ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
