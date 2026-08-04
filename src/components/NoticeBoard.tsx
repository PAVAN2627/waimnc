import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, Image as ImageIcon, Megaphone, Bell, Calendar, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { formatNoticeDate, subscribeToActiveNotices, type NoticeRecord } from "@/lib/notices";

const NoticeBoard = () => {
  const { lang, t } = useLanguage();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = subscribeToActiveNotices(setNotices);
    return () => unsubscribe();
  }, []);

  return (
    <section id="notices" className="py-14 bg-gradient-to-b from-background to-muted/30 border-b">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("अधिकृत सूचना व जाहीर प्रगटन", "Official Notices")}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center justify-center gap-2">
            <Megaphone className="w-7 h-7 text-primary animate-bounce-gentle" />
            <span>{t("सूचना फलक", "Notice Board")}</span>
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            {t("वाई नगरपरिषदेचे महत्त्वाचे शासन निर्णय, परिपत्रके व जाहीर प्रगटन", "Official updates & notices from Wai Municipal Council")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden backdrop-blur-md">
            {/* Header Ribbon */}
            <div className="gov-gradient text-primary-foreground px-6 py-4 font-bold text-base flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 animate-pulse" />
                <span>{t("नवीन सूचना / जाहिराती", "Active Announcements")}</span>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                {notices.length} {t("सूचना", "Notices")}
              </span>
            </div>

            {/* Content List */}
            <div className="max-h-[480px] overflow-y-auto divide-y divide-border/60">
              {!isFirebaseConfigured && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {t("सूचना दाखवण्यासाठी Firebase configure करा.", "Configure Firebase to load notices.")}
                </div>
              )}

              {isFirebaseConfigured && notices.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {t("सध्या कोणतीही सक्रिय सूचना उपलब्ध नाही.", "No active notices available right now.")}
                </div>
              )}

              {notices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-5 hover:bg-primary/5 transition-colors group flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      <span>{formatNoticeDate(notice.createdAt, lang)}</span>
                      {notice.tag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {t(notice.tag, notice.tagEn)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {t(notice.title, notice.titleEn || notice.title)}
                    </h3>

                    {notice.content && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                        {t(notice.content, notice.contentEn || notice.content)}
                      </p>
                    )}

                    {/* Action Links */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {notice.attachmentType === "pdf" && notice.attachmentBase64 && (
                        <a
                          href={notice.attachmentBase64}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 px-3 py-1 rounded-lg font-semibold hover:bg-red-500/20 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {t("PDF डाऊनलोड", "Download PDF")}
                        </a>
                      )}
                      {notice.externalUrl && (
                        <a
                          href={notice.externalUrl.match(/^https?:\/\//) ? notice.externalUrl : `https://${notice.externalUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/30 px-3 py-1 rounded-lg font-semibold hover:bg-primary/20 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {t("लिंक उघडा", "Open Link")}
                        </a>
                      )}
                      {notice.attachmentType === "image" && notice.attachmentBase64 && (
                        <a
                          href={notice.attachmentBase64}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg font-semibold hover:bg-emerald-500/20 transition-all"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          {t("प्रतिमा पहा", "View Image")}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeBoard;
