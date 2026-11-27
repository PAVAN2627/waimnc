import { useState, useMemo } from "react";
import { Building2, ChevronDown, Search, X, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface DepartmentOption {
  value: string;
  labelMr: string;
  labelEn: string;
}

interface DepartmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: DepartmentOption[];
  className?: string;
  name?: string;
}

export default function DepartmentSelector({
  value,
  onChange,
  options,
  className = "",
  name,
}: DepartmentSelectorProps) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((d) =>
      `${d.value} ${d.labelMr} ${d.labelEn}`.toLowerCase().includes(q)
    );
  }, [options, query]);

  const displayLabel = useMemo(() => {
    if (!value) return t("विभाग निवडा...", "Select Department...");
    const found = options.find((d) => d.value === value);
    if (found) {
      return lang === "mr" ? found.labelMr : found.labelEn;
    }
    return value;
  }, [value, options, lang, t]);

  const handleSelect = (nextVal: string) => {
    onChange(nextVal);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between gap-2 border border-input rounded-lg px-3 py-2 text-sm bg-background hover:bg-muted/40 focus:ring-2 focus:ring-ring focus:outline-none transition-colors text-left ${className}`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span className={`truncate ${value ? "font-medium text-foreground" : "text-muted-foreground"}`}>
            {displayLabel}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card border border-border w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {t("संबंधित विभाग निवडा", "Select Municipal Department")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-border bg-background">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("विभाग शोधा (उदा. पाणी, आरोग्य, PMAY)...", "Search department (e.g. Water, Health, PMAY)...")}
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Grid Body */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {t("नगरपरिषद विभाग (निवडा)", "Municipal Departments (Tap to select)")}
              </p>
              {filteredOptions.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-6">
                  {t("कोणताही विभाग सापडला नाही.", "No matching department found.")}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredOptions.map((d, idx) => {
                    const active = value === d.value;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => handleSelect(d.value)}
                        className={`flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl border text-left transition-all ${
                          active
                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                            : "bg-card hover:bg-primary/10 hover:border-primary/40 border-border text-foreground"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-extrabold block truncate">
                            {idx + 1}. {lang === "mr" ? d.labelMr : d.labelEn}
                          </span>
                          <span
                            className={`text-[10px] block truncate ${
                              active ? "text-primary-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {lang === "mr" ? d.labelEn : d.labelMr}
                          </span>
                        </div>
                        {active && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
