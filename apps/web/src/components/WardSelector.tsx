import { useState, useMemo } from "react";
import { MapPin, ChevronDown, Search, X, Check } from "lucide-react";
import { MUNICIPAL_WARDS, isUnknownWard } from "@wmc/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface WardSelectorProps {
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  includeUnknownOption?: boolean;
  unknownValue?: string;
  className?: string;
  name?: string;
}

const MR_TO_EN_DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

function normalizeDigits(str: string): string {
  return str
    .toLowerCase()
    .replace(/[०-९]/g, (d) => MR_TO_EN_DIGITS[d] || d);
}

export default function WardSelector({
  value,
  onChange,
  includeAllOption = false,
  includeUnknownOption = true,
  unknownValue = "माहिती नाही",
  className = "",
  name,
}: WardSelectorProps) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const numberedWards = useMemo(
    () =>
      MUNICIPAL_WARDS.filter((w) => !isUnknownWard(w.value)).map((w, idx) => ({
        ...w,
        index: idx + 1,
      })),
    []
  );

  const filteredWards = useMemo(() => {
    const q = normalizeDigits(query.trim());
    if (!q) return numberedWards;
    return numberedWards.filter((w) => {
      const hay = normalizeDigits(`${w.index}. ${w.value} ${w.labelMr} ${w.labelEn}`);
      return hay.includes(q);
    });
  }, [numberedWards, query]);

  const displayLabel = useMemo(() => {
    if (!value) {
      return t("प्रभाग निवडा...", "Select Ward...");
    }
    if (includeAllOption && value === "all") {
      return t("सर्व प्रभाग / वार्ड", "All Wards");
    }
    if (value === unknownValue || isUnknownWard(value)) {
      return t("माहिती नाही / अज्ञात प्रभाग", "Don't know / Unknown Ward");
    }
    const found = MUNICIPAL_WARDS.find((w) => w.value === value);
    if (found) {
      return lang === "mr" ? found.labelMr : `${found.labelEn} (${found.labelMr})`;
    }
    return `${t("प्रभाग", "Ward")} ${value}`;
  }, [value, includeAllOption, unknownValue, lang, t]);

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
          <MapPin className="w-4 h-4 text-primary shrink-0" />
          <span className="truncate font-medium">{displayLabel}</span>
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card border border-border w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm sm:text-base text-foreground">
                  {t("प्रभाग / वॉर्ड निवडा", "Select Municipal Ward")}
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
                  placeholder={t("प्रभाग क्रमांक शोधा (उदा. 1, 5, ११)...", "Search ward (e.g. 1, 5, 11)...")}
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

            {/* Scrollable Body */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-3">
              {/* All Wards Quick Option (Filter Mode) */}
              {includeAllOption && !query.trim() && (
                <button
                  type="button"
                  onClick={() => handleSelect("all")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    value === "all"
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/40 hover:bg-muted border-border text-foreground"
                  }`}
                >
                  <span>{t("सर्व प्रभाग / वार्ड", "All Wards")}</span>
                  {value === "all" && <Check className="w-4 h-4 shrink-0" />}
                </button>
              )}

              {/* Compact Ward Grid */}
              <div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t("प्रभाग १ ते ११ (निवडा)", "Wards 1 to 11 (Tap to select)")}
                </p>
                {filteredWards.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-6">
                    {t("कोणताही प्रभाग सापडला नाही.", "No matching ward found.")}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredWards.map((w) => {
                      const active = value === w.value;
                      return (
                        <button
                          key={w.value}
                          type="button"
                          onClick={() => handleSelect(w.value)}
                          className={`flex items-center justify-between gap-1.5 py-2.5 px-3 rounded-xl border text-left transition-all ${
                            active
                              ? "bg-primary text-primary-foreground border-primary shadow-md"
                              : "bg-card hover:bg-primary/10 hover:border-primary/40 border-border text-foreground"
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-extrabold block truncate">
                              {lang === "mr" ? w.labelMr : w.labelEn}
                            </span>
                            <span
                              className={`text-[10px] block truncate ${
                                active ? "text-primary-foreground/80" : "text-muted-foreground"
                              }`}
                            >
                              {lang === "mr" ? w.labelEn : w.labelMr}
                            </span>
                          </div>
                          {active && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Unknown Ward Option at Bottom */}
              {includeUnknownOption && !query.trim() && (
                <div className="pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => handleSelect(unknownValue)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      value !== "" && (value === unknownValue || (unknownValue === "माहिती नाही" && isUnknownWard(value)))
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    <span>{t("माहिती नाही / अज्ञात प्रभाग", "Don't know / Unknown Ward")}</span>
                    {value !== "" && (value === unknownValue || (unknownValue === "माहिती नाही" && isUnknownWard(value))) && (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
