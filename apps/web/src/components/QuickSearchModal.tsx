import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, Droplets, Home, AlertTriangle, Baby, HeartPulse, HardHat, FileText, Landmark, ShieldCheck, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const navigate = useNavigate();

  // Search Items List
  const searchDatabase = [
    { label: t("पाणी बिल भरणा", "Water Bill Payment"), type: "service", href: "/services/water-bill", icon: Droplets, keywords: "water bill pani bill municipal" },
    { label: t("मालमत्ता कर भरणा", "Property Tax Payment"), type: "service", href: "/services/property-tax", icon: Home, keywords: "property tax ghar patti kalamala" },
    { label: t("तक्रार नोंदवा", "Register Complaint"), type: "service", href: "/services/complaint", icon: AlertTriangle, keywords: "complaint takrar road garbage light" },
    { label: t("जन्म दाखला", "Birth Certificate"), type: "service", href: "/services/birth-certificate", icon: Baby, keywords: "birth certificate janma dakhla" },
    { label: t("मृत्यू दाखला", "Death Certificate"), type: "service", href: "/services/death-certificate", icon: HeartPulse, keywords: "death certificate mrutyu dakhla" },
    { label: t("बांधकाम परवानगी", "Construction Permit"), type: "service", href: "/services/construction-permit", icon: HardHat, keywords: "building permission bandhkam" },
    { label: t("अर्ज ट्रॅक करा", "Track Application Status"), type: "service", href: "/track", icon: FileText, keywords: "track application status arja" },
    { label: t("पर्यटन स्थळे", "Wai Tourism & Ghats"), type: "tourism", href: "/tourism", icon: Landmark, keywords: "tourism kashi vishweshwar ghat menavali vada" },
    { label: t("कायदे व नियम", "Municipal Laws & Rules"), type: "law", href: "/laws", icon: ShieldCheck, keywords: "act law rules kayde nagarparishad" },
    { label: t("निविदा (तेंडर्स)", "Tenders & Notices"), type: "tender", href: "/tenders", icon: FileText, keywords: "tender tender notice e-procurement" },
  ];

  // Keyboard shortcut listener (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search event
          window.dispatchEvent(new CustomEvent("open-quick-search"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredResults = searchDatabase.filter((item) => {
    const matchesCategory = category === "all" || item.type === category;
    const q = query.toLowerCase().trim();
    const matchesQuery = !q || item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const handleSelect = (href: string) => {
    onClose();
    setQuery("");
    navigate(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden relative">
        {/* Search Input Header */}
        <div className="p-4 border-b flex items-center gap-3 bg-muted/30">
          <Search className="w-5 h-5 text-primary animate-pulse-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("शोधा: पाणी बिल, कर, दाखला, तक्रार...", "Search: Water Bill, Tax, Certificate, Complaint...")}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base font-medium"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
              {t("पुसा", "Clear")}
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto text-xs font-semibold bg-muted/10">
          {[
            { id: "all", label: t("सर्व", "All") },
            { id: "service", label: t("नागरी सेवा", "Services") },
            { id: "tourism", label: t("पर्यटन", "Tourism") },
            { id: "law", label: t("कायदे", "Laws") },
            { id: "tender", label: t("निविदा", "Tenders") },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1 rounded-full border transition-all ${
                category === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-accent"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
          {filteredResults.length > 0 ? (
            filteredResults.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-primary transition-colors">{item.label}</div>
                      <div className="text-xs text-muted-foreground capitalize">{item.type} • {item.href}</div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-primary font-mono font-medium">
                    {t("उघडा →", "Open →")}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">{t("काहीही सापडले नाही", "No results found")}</p>
              <p className="text-xs opacity-75 mt-1">{t("कृपया इतर शब्द प्रयोग करून पहा", "Try searching with different keywords")}</p>
            </div>
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="p-3 border-t bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">ESC</kbd> {t("बंद करण्यासाठी", "to close")}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono">Ctrl + K</kbd> {t("कधीही शोधा", "Quick search")}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;
