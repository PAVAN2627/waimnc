import { Phone, Mail, Bell, Moon, Sun, Sparkles, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveNotices, type NoticeRecord } from "@/lib/notices";

const TopHeader = () => {
  const [dark, setDark] = useState(false);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const { lang, setLang, t } = useLanguage();

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsub = subscribeToActiveNotices(setNotices);
    return () => unsub();
  }, []);

  const handleNoticeClick = (notice: NoticeRecord) => {
    if (notice.attachmentBase64) {
      window.open(notice.attachmentBase64, "_blank", "noopener,noreferrer");
    } else if (notice.externalUrl) {
      const url = notice.externalUrl.match(/^https?:\/\//) ? notice.externalUrl : `https://${notice.externalUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const marqueeContent = notices.length > 0
    ? notices.map((n, i) => {
        const title = lang === "mr" ? n.title : (n.titleEn || n.title);
        const hasLink = n.attachmentBase64 || n.externalUrl;
        return (
          <span key={n.id}>
            {hasLink ? (
              <button
                onClick={() => handleNoticeClick(n)}
                className="hover:underline cursor-pointer font-medium"
                title={title}
              >
                📢 {title}
              </button>
            ) : (
              <span>📢 {title}</span>
            )}
            {i < notices.length - 1 && <span className="mx-4 opacity-50">|</span>}
          </span>
        );
      })
    : <span>{t("📢 वाई नगर परिषदेत आपले स्वागत आहे", "📢 Welcome to Wai Municipal Council")}</span>;

  return (
    <div className="gov-gradient text-primary-foreground text-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between py-1.5 px-4 gap-2">
        {/* Contact */}
        <div className="flex items-center gap-4 flex-wrap">
          <a href="tel:18001234567" className="flex items-center gap-1 hover:underline">
            <Phone className="w-3.5 h-3.5" />
            <span>{t("हेल्पलाइन: 1800-123-4567", "Helpline: 1800-123-4567")}</span>
          </a>
          <a href="mailto:info@wainagarpalika.gov.in" className="flex items-center gap-1 hover:underline">
            <Mail className="w-3.5 h-3.5" />
            <span>info@wainagarpalika.gov.in</span>
          </a>
        </div>

        {/* Marquee */}
        <div className="flex items-center gap-3 overflow-hidden flex-1 mx-4">
          <Bell className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <span className="marquee inline-block">{marqueeContent}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {/* Quick Search Launcher */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-quick-search"))}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-all border border-white/20"
          >
            <Search className="w-3 h-3 text-white" />
            <span className="hidden sm:inline font-medium">{t("शोध (Ctrl+K)", "Search (Ctrl+K)")}</span>
          </button>

          {/* Language toggle */}
          <div className="flex gap-1 text-xs">
            <button onClick={() => setLang("mr")} className={`px-2 py-0.5 rounded transition-colors ${lang === "mr" ? "bg-primary-foreground text-primary font-bold shadow-sm" : "hover:underline"}`}>
              मराठी
            </button>
            <button onClick={() => setLang("en")} className={`px-2 py-0.5 rounded transition-colors ${lang === "en" ? "bg-primary-foreground text-primary font-bold shadow-sm" : "hover:underline"}`}>
              English
            </button>
          </div>

          {/* Dark mode */}
          <button onClick={toggleDark} className="p-1 rounded hover:bg-primary-foreground/20 transition-colors" title={t("थीम बदला", "Toggle theme")}>
            {dark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
