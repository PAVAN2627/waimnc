import { Phone, Mail, Bell, Moon, Sun, Search } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotices } from "@/contexts/NoticeContext";
import type { NoticeRecord } from "@/lib/notices";

const TopHeader = () => {
  const [dark, setDark] = useState(false);
  const { notices } = useNotices();
  const { lang, setLang, t } = useLanguage();

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

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
    : <span>{t("📢 वाई नगरपरिषदेत आपले स्वागत आहे", "📢 Welcome to Wai Municipal Council")}</span>;

  return (
    <div className="gov-gradient text-primary-foreground text-sm">
      {/* Main Top Bar */}
      <div className="container mx-auto flex items-center justify-between py-1.5 px-3 sm:px-4 gap-2">
        {/* Contact Numbers */}
        <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs md:text-sm">
          <a href="tel:02167220022" className="flex items-center gap-1 hover:underline">
            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
            <span>02167-220022</span>
          </a>
          <a href="tel:1800233221" className="flex items-center gap-1 hover:underline hidden sm:flex">
            <span>{t("टोल फ्री: १८००२३३२२१", "Toll-Free: 1800233221")}</span>
          </a>
          <a href="mailto:waimunicipalcouncil@gmail.com" className="flex items-center gap-1 hover:underline hidden lg:flex">
            <Mail className="w-3.5 h-3.5" />
            <span>waimunicipalcouncil@gmail.com</span>
          </a>
        </div>

        {/* Desktop Marquee (Hidden on mobile to give dedicated row) */}
        <div className="hidden md:flex items-center gap-2 overflow-hidden flex-1 mx-4">
          <Bell className="w-3.5 h-3.5 flex-shrink-0 animate-pulse text-amber-300" />
          <div className="overflow-hidden whitespace-nowrap flex-1">
            <span className="marquee inline-block">{marqueeContent}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Quick Search Launcher */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-quick-search"))}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-all border border-white/20"
          >
            <Search className="w-3 h-3 text-white" />
            <span className="hidden sm:inline font-medium">{t("शोध (Ctrl+K)", "Search")}</span>
          </button>

          {/* Language toggle */}
          <div className="flex gap-0.5 text-[11px] sm:text-xs">
            <button
              onClick={() => setLang("mr")}
              className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${lang === "mr" ? "bg-primary-foreground text-primary font-bold shadow-sm" : "hover:underline"}`}
            >
              मराठी
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors ${lang === "en" ? "bg-primary-foreground text-primary font-bold shadow-sm" : "hover:underline"}`}
            >
              EN
            </button>
          </div>

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="p-1 rounded hover:bg-primary-foreground/20 transition-colors"
            title={t("थीम बदला", "Toggle theme")}
          >
            {dark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Dedicated Full-Width Mobile Announcement Marquee Strip */}
      <div className="md:hidden border-t border-white/20 bg-black/20 py-1 px-3 flex items-center gap-2 overflow-hidden text-xs">
        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1 shadow-sm">
          <Bell className="w-2.5 h-2.5 animate-pulse" />
          <span>{t("महत्त्वाचे", "Alert")}</span>
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <span className="marquee inline-block">{marqueeContent}</span>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
