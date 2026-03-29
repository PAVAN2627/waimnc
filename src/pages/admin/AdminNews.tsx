import { useEffect, useRef, useState } from "react";
import { CalendarDays, Newspaper, Plus, Trash2, Pencil, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  createNews, deleteNews, subscribeToAllNews, toggleNewsStatus, updateNews,
  type NewsRecord,
} from "@/lib/news";

const empty = { title: "", titleEn: "", date: "", dateEn: "", tag: "", tagEn: "", externalUrl: "" };

const AdminNews = () => {
  const { lang, t } = useLanguage();
  const { toast } = useToast();
  const [news, setNews] = useState<NewsRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToAllNews(setNews);
  }, []);

  const startEdit = (item: NewsRecord) => {
    setEditingId(item.id);
    setForm({ title: item.title, titleEn: item.titleEn, date: item.date, dateEn: item.dateEn, tag: item.tag, tagEn: item.tagEn, externalUrl: item.externalUrl });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    try {
      setIsSaving(true);
      if (editingId) {
        await updateNews(editingId, { ...form, updatedAt: Date.now() });
        toast({ title: t("यशस्वी", "Success"), description: t("बातमी अद्यतनित केली.", "News updated.") });
        setEditingId(null);
      } else {
        await createNews(form);
        toast({ title: t("यशस्वी", "Success"), description: t("बातमी जतन केली.", "News saved.") });
      }
      setForm(empty);
    } catch (err) {
      toast({ title: t("त्रुटी", "Error"), description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = async (item: NewsRecord) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this news?"))) return;
    await deleteNews(item.id);
    if (editingId === item.id) cancelEdit();
    toast({ title: t("हटवले", "Deleted") });
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("बातम्या व्यवस्थापन", "News Management")}</h1>

      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("बातमी संपादित करा", "Edit News") : t("नवीन बातमी जोडा", "Add New")}
              {editingId && <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t("शीर्षक (मराठी) *", "Title (Marathi) *")}</span>
                  <AutoTranslateButton sourceValue={form.titleEn} onTranslated={(v) => setForm((f) => ({ ...f, title: v }))} />
                </div>
                <input className={inputCls} placeholder={t("शीर्षक (मराठी) *", "Title (Marathi) *")} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title (English)</label>
                <input className={inputCls} placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t("टॅग (मराठी)", "Tag (Marathi)")}</span>
                  <AutoTranslateButton sourceValue={form.tagEn} onTranslated={(v) => setForm((f) => ({ ...f, tag: v }))} />
                </div>
                <input className={inputCls} placeholder={t("टॅग (मराठी)", "Tag (Marathi)")} value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tag (English)</label>
                <input className={inputCls} placeholder="Tag (English)" value={form.tagEn} onChange={(e) => setForm((f) => ({ ...f, tagEn: e.target.value }))} />
              </div>
              <input className={inputCls} placeholder={t("तारीख (मराठी)", "Date (Marathi)")} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              <input className={inputCls} placeholder="Date (English)" value={form.dateEn} onChange={(e) => setForm((f) => ({ ...f, dateEn: e.target.value }))} />
            </div>
            <input className={inputCls} placeholder={t("बाह्य लिंक (URL, ऐच्छिक)", "External URL (optional)")} value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} />
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSaving || !isFirebaseConfigured || !form.title.trim()} className="gov-gradient text-primary-foreground">
                {isSaving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतन करा", "Update") : t("जोडा", "Add")}
              </Button>
              {editingId && <Button variant="outline" onClick={cancelEdit}>{t("रद्द करा", "Cancel")}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            {t("सर्व बातम्या", "All News")} ({news.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {news.length === 0
            ? <p className="text-sm text-muted-foreground">{t("कोणत्याही बातम्या नाहीत.", "No news yet.")}</p>
            : (
              <div className="space-y-3">
                {news.map((item) => (
                  <div key={item.id} className={`flex items-start justify-between p-3 border rounded-lg gap-3 ${editingId === item.id ? "border-primary ring-1 ring-primary" : ""}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {item.status === "active" ? t("सक्रिय", "Active") : t("निष्क्रिय", "Inactive")}
                        </span>
                        <span className="text-xs bg-accent px-2 py-0.5 rounded-full">{lang === "mr" ? item.tag : item.tagEn}</span>
                      </div>
                      <p className="font-medium text-sm">{lang === "mr" ? item.title : item.titleEn}</p>
                      {(item.date || item.dateEn) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CalendarDays className="h-3 w-3" />{lang === "mr" ? item.date : item.dateEn}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => toggleNewsStatus(item.id, item.status === "active" ? "inactive" : "active")}>
                        {item.status === "active" ? t("बंद करा", "Disable") : t("सक्रिय करा", "Activate")}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNews;
