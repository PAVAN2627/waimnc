import { useEffect, useState } from "react";
import { Download, ExternalLink, FileText, Image as ImageIcon, Megaphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { formatNoticeDate, subscribeToActiveNotices, type NoticeRecord } from "@/lib/notices";

const NoticeBoard = () => {
  const { lang, t } = useLanguage();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return;
    }

    const unsubscribe = subscribeToActiveNotices(setNotices);
    return () => unsubscribe();
  }, []);

  return (
    <section id="notices" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6 justify-center">
          <Megaphone className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold">{t("सूचना फलक", "Notice Board")}</h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="gov-gradient text-primary-foreground px-4 py-3 font-semibold text-sm flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              {t("सूचना / जाहिराती", "Notices / Announcements")}
            </div>
            <div className="h-[420px] overflow-y-auto divide-y divide-border">
              {!isFirebaseConfigured && (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  {t("सूचना दाखवण्यासाठी Firebase configure करा.", "Configure Firebase to load notices.")}
                </div>
              )}

              {isFirebaseConfigured && notices.length === 0 && (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  {t("सध्या कोणतीही सक्रिय सूचना उपलब्ध नाही.", "No active notices are available right now.")}
                </div>
              )}

              {notices.map((notice) => (
                <div key={notice.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{formatNoticeDate(notice.createdAt, lang)}</p>
                      <p className="text-sm font-medium mt-0.5">{t(notice.title, notice.titleEn || notice.title)}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {t(notice.content || "", notice.contentEn || notice.content || "")}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {notice.attachmentType === "pdf" && notice.attachmentBase64 && (
                          <a
                            href={notice.attachmentBase64}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2.5 py-1 rounded-md font-medium hover:bg-destructive/20 transition-colors"
                          >
                            <Download className="w-3 h-3" />
                            {t("PDF डाउनलोड", "Download PDF")}
                          </a>
                        )}
                        {notice.externalUrl && (
                          <a
                            href={notice.externalUrl.match(/^https?:\/\//) ? notice.externalUrl : `https://${notice.externalUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-md font-medium hover:bg-primary/20 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {t("लिंक उघडा", "Open Link")}
                          </a>
                        )}
                        {notice.attachmentType === "image" && notice.attachmentBase64 && (
                          <a
                            href={notice.attachmentBase64}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md font-medium hover:bg-emerald-200 transition-colors"
                          >
                            <ImageIcon className="w-3 h-3" />
                            {t("प्रतिमा पहा", "View image")}
                          </a>
                        )}
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {t(notice.tag, notice.tagEn)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                      {notice.attachmentType === "pdf" && notice.attachmentBase64 && (
                        <a href={notice.attachmentBase64} target="_blank" rel="noopener noreferrer" title={t("PDF उघडा", "Open PDF")}>
                          <FileText className="w-5 h-5 text-destructive hover:opacity-70 transition-opacity" />
                        </a>
                      )}
                      {notice.externalUrl && (
                        <a
                          href={notice.externalUrl.match(/^https?:\/\//) ? notice.externalUrl : `https://${notice.externalUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={t("लिंक उघडा", "Open Link")}
                        >
                          <ExternalLink className="w-5 h-5 text-primary hover:opacity-70 transition-opacity" />
                        </a>
                      )}
                      {notice.attachmentType === "image" && notice.attachmentBase64 && (
                        <a href={notice.attachmentBase64} target="_blank" rel="noopener noreferrer" title={t("प्रतिमा पहा", "View Image")}>
                          <ImageIcon className="w-5 h-5 text-emerald-600 hover:opacity-70 transition-opacity" />
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
