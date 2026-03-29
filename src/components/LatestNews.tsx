import { CalendarDays } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveNews, type NewsRecord } from "@/lib/news";

const LatestNews = () => {
  const { t, lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [news, setNews] = useState<NewsRecord[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = subscribeToActiveNews(setNews);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || news.length === 0) return;

    let animId: number;
    const speed = 0.5;

    const animate = () => {
      if (!isPaused && el) {
        el.scrollTop += speed;
        if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
          el.scrollTop = 0;
        }
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, news.length]);

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">
          {t("ताज्या घडामोडी", "Latest Updates")}
        </h2>
        <div
          className="max-w-3xl mx-auto h-[320px] overflow-hidden rounded-xl border bg-card"
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {!isFirebaseConfigured || news.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <p className="text-sm text-muted-foreground">
                {!isFirebaseConfigured
                  ? t(
                      "बातम्या दाखवण्यासाठी Firebase configure करा.",
                      "Configure Firebase to load news."
                    )
                  : t(
                      "सध्या कोणत्याही बातम्या उपलब्ध नाहीत.",
                      "No news available right now."
                    )}
              </p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {(news.length >= 4 ? [...news, ...news] : news).map((item, i) => {
                const url = item.externalUrl
                  ? item.externalUrl.match(/^https?:\/\//) ? item.externalUrl : `https://${item.externalUrl}`
                  : null;
                return (
                  <a
                    key={i}
                    href={url || "#"}
                    target={url ? "_blank" : undefined}
                    rel={url ? "noopener noreferrer" : undefined}
                    onClick={!url ? (e) => e.preventDefault() : undefined}
                    className="flex items-start gap-4 p-4 hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-2.5">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-1">
                        {lang === "mr" ? item.date : item.dateEn}
                      </p>
                      <p className="text-sm font-medium group-hover:text-primary transition-colors">
                        {lang === "mr" ? item.title : item.titleEn}
                      </p>
                    </div>
                    <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full flex-shrink-0">
                      {lang === "mr" ? item.tag : item.tagEn}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
