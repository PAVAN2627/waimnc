import { useEffect, useRef, useState } from "react";
import { ExternalLink, Megaphone, Paperclip, Plus, Trash2, Pencil, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  createNotice, deleteNotice, formatNoticeDate, subscribeToAllNotices,
  toggleNoticeStatus, updateNotice, type NoticeRecord,
} from "@/lib/notices";

const empty = { title: "", titleEn: "", content: "", contentEn: "", tag: "", tagEn: "", externalUrl: "" };

const AdminNotices = () => {
  const { lang, t } = useLanguage();
  const { toast } = useToast();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToAllNotices(setNotices);
  }, []);

  const startEdit = (notice: NoticeRecord) => {
    setEditingId(notice.id);
    setForm({ title: notice.title, titleEn: notice.titleEn, content: notice.content, contentEn: notice.contentEn, tag: notice.tag, tagEn: notice.tagEn, externalUrl: notice.externalUrl });
    setSelectedFile(null);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); setSelectedFile(null); };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    try {
      setIsSaving(true);
      if (editingId) {
        await updateNotice(editingId, { title: form.title, titleEn: form.titleEn, content: form.content, contentEn: form.contentEn, tag: form.tag, tagEn: form.tagEn, externalUrl: form.externalUrl });
        toast({ title: t("यशस्वी", "Success"), description: t("सूचना अद्यतनित केली.", "Notice updated.") });
        setEditingId(null);
      } else {
        await createNotice({ ...form, file: selectedFile });
        toast({ title: t("यशस्वी", "Success"), description: t("सूचना जतन केली.", "Notice saved.") });
      }
      setForm(empty);
      setSelectedFile(null);
    } catch (err) {
      toast({ title: t("त्रुटी", "Error"), description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const handleToggle = async (notice: NoticeRecord) => {
    await toggleNoticeStatus(notice.id, notice.status === "active" ? "inactive" : "active");
  };

  const handleDelete = async (notice: NoticeRecord) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this notice?"))) return;
    await deleteNotice(notice);
    if (editingId === notice.id) cancelEdit();
    toast({ title: t("हटवले", "Deleted") });
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("सूचना व्यवस्थापन", "Notice Management")}</h1>

      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("सूचना संपादित करा", "Edit Notice") : t("नवीन सूचना जोडा", "Add New Notice")}
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
                <Input placeholder={t("शीर्षक (मराठी) *", "Title (Marathi) *")} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Title (English)</label>
                <Input placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t("मजकूर (मराठी) *", "Content (Marathi) *")}</span>
                  <AutoTranslateButton sourceValue={form.contentEn} onTranslated={(v) => setForm((f) => ({ ...f, content: v }))} />
                </div>
                <Textarea placeholder={t("मजकूर (मराठी) *", "Content (Marathi) *")} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={3} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Content (English)</label>
                <Textarea placeholder="Content (English)" value={form.contentEn} onChange={(e) => setForm((f) => ({ ...f, contentEn: e.target.value }))} rows={3} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{t("टॅग (मराठी)", "Tag (Marathi)")}</span>
                  <AutoTranslateButton sourceValue={form.tagEn} onTranslated={(v) => setForm((f) => ({ ...f, tag: v }))} />
                </div>
                <Input placeholder={t("टॅग (मराठी)", "Tag (Marathi)")} value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tag (English)</label>
                <Input placeholder="Tag (English)" value={form.tagEn} onChange={(e) => setForm((f) => ({ ...f, tagEn: e.target.value }))} />
              </div>
            </div>
            <Input placeholder={t("बाह्य लिंक (URL, ऐच्छिक)", "External URL (optional)")} value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} />
            {!editingId && (
              <div>
                <label className="text-sm font-medium block mb-1">{t("PDF / फोटो संलग्न करा (max 5MB)", "Attach PDF / Photo (max 5MB)")}</label>
                <input type="file" accept="application/pdf,image/*" className={inputCls} onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                {selectedFile && <p className="text-xs text-muted-foreground mt-1">{selectedFile.name}</p>}
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSaving || !isFirebaseConfigured} className="gov-gradient text-primary-foreground">
                {isSaving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतन करा", "Update") : t("सूचना जोडा", "Add Notice")}
              </Button>
              {editingId && <Button variant="outline" onClick={cancelEdit}>{t("रद्द करा", "Cancel")}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {notices.length === 0 && isFirebaseConfigured && (
          <p className="text-sm text-muted-foreground">{t("कोणतीही सूचना नाही.", "No notices yet.")}</p>
        )}
        {notices.map((notice) => (
          <Card key={notice.id} className={`${notice.status !== "active" ? "opacity-60" : ""} ${editingId === notice.id ? "border-primary ring-1 ring-primary" : ""}`}>
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Megaphone className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-sm">{lang === "mr" ? notice.title : notice.titleEn || notice.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${notice.status === "active" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                    {notice.status === "active" ? t("सक्रिय", "Active") : t("निष्क्रिय", "Inactive")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{lang === "mr" ? notice.content : notice.contentEn || notice.content}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatNoticeDate(notice.createdAt, lang)}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{lang === "mr" ? notice.tag : notice.tagEn || notice.tag}</span>
                  {notice.attachmentBase64 && (
                    <a href={notice.attachmentBase64} target="_blank" rel="noreferrer" download={notice.attachmentName} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Paperclip className="h-3 w-3" />{notice.attachmentName || t("संलग्नक", "Attachment")}
                    </a>
                  )}
                  {notice.externalUrl && (
                    <a href={notice.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />{t("लिंक", "Link")}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleToggle(notice)}>
                  {notice.status === "active" ? t("बंद करा", "Disable") : t("सक्रिय करा", "Activate")}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(notice)}>
                  <Pencil className="h-4 w-4 text-primary" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(notice)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminNotices;
