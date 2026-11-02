import { useEffect, useRef, useState } from "react";
import { ExternalLink, Megaphone, Paperclip, Plus, Trash2, Pencil, X, Upload, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import { uploadMedia } from "@/lib/api";
import {
  createNotice, deleteNotice, formatNoticeDate, subscribeToAllNotices,
  setNoticeStatus, updateNotice, type NoticeRecord, type NoticeStatus,
} from "@/lib/notices";

const empty = { title: "", titleEn: "", content: "", contentEn: "", tag: "", tagEn: "", externalUrl: "", documentUrl: "" };

const AdminNotices = () => {
  const { lang, t } = useLanguage();
  const { toast } = useToast();
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [docMode, setDocMode] = useState<"file" | "drive">("file");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToAllNotices(setNotices);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: t("फाइल खूप मोठी आहे", "File too large"), description: "Max 20 MB", variant: "destructive" });
      return;
    }
    try {
      setIsUploadingDoc(true);
      const res = await uploadMedia(file, "notices");
      setForm((f) => ({ ...f, documentUrl: res.viewUrl }));
      toast({ title: t("सूचना PDF Vercel Blob वर सुरक्षित केली ✓", "Notice PDF uploaded to Vercel Blob ✓") });
    } catch (err: any) {
      toast({ title: t("अपलोड अयशस्वी", "Upload failed"), description: err?.message, variant: "destructive" });
    } finally {
      setIsUploadingDoc(false);
      e.target.value = "";
    }
  };

  const startEdit = (notice: NoticeRecord) => {
    setEditingId(notice.id);
    const doc = (notice as any).documentUrl || notice.attachmentBase64 || "";
    setForm({
      title: notice.title,
      titleEn: notice.titleEn,
      content: notice.content,
      contentEn: notice.contentEn,
      tag: notice.tag,
      tagEn: notice.tagEn,
      externalUrl: notice.externalUrl || "",
      documentUrl: doc,
    });
    if ((notice.externalUrl && notice.externalUrl.includes("drive.google.com")) || (doc && doc.includes("drive.google.com"))) {
      setDocMode("drive");
    } else {
      setDocMode("file");
    }
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    try {
      setIsSaving(true);
      const effectiveDocUrl = docMode === "drive" ? (form.documentUrl || form.externalUrl) : form.documentUrl;
      const effectiveExtUrl = docMode === "drive" ? (form.externalUrl || form.documentUrl) : form.externalUrl;

      if (editingId) {
        await updateNotice(editingId, {
          title: form.title,
          titleEn: form.titleEn,
          content: form.content,
          contentEn: form.contentEn,
          tag: form.tag,
          tagEn: form.tagEn,
          externalUrl: effectiveExtUrl,
          documentUrl: effectiveDocUrl,
        } as any);
        setNotices((prev) =>
          prev.map((n) =>
            n.id === editingId
              ? {
                  ...n,
                  title: form.title,
                  titleEn: form.titleEn,
                  content: form.content,
                  contentEn: form.contentEn,
                  tag: form.tag,
                  tagEn: form.tagEn,
                  externalUrl: effectiveExtUrl,
                  attachmentBase64: effectiveDocUrl,
                }
              : n
          )
        );
        toast({ title: t("यशस्वी", "Success"), description: t("सूचना अद्यतनित केली.", "Notice updated.") });
        setEditingId(null);
      } else {
        const created = await createNotice({
          title: form.title,
          titleEn: form.titleEn,
          content: form.content,
          contentEn: form.contentEn,
          tag: form.tag,
          tagEn: form.tagEn,
          externalUrl: effectiveExtUrl,
          file: null,
        });
        if (effectiveDocUrl && created?.id) {
          await updateNotice(created.id, { documentUrl: effectiveDocUrl } as any);
          created.attachmentBase64 = effectiveDocUrl;
        }
        setNotices((prev) => [created, ...prev]);
        toast({ title: t("यशस्वी", "Success"), description: t("सूचना जतन केली.", "Notice saved.") });
      }
      setForm(empty);
    } catch (err) {
      toast({ title: t("त्रुटी", "Error"), description: err instanceof Error ? err.message : "", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (notice: NoticeRecord) => {
    const nextStatus: NoticeStatus = notice.status === "active" ? "inactive" : "active";
    try {
      await setNoticeStatus(notice.id, nextStatus);
      setNotices((prev) => prev.map((n) => n.id === notice.id ? { ...n, status: nextStatus } : n));
      toast({
        title: nextStatus === "active" ? t("सूचना सक्रिय केली", "Notice activated") : t("सूचना बंद केली", "Notice deactivated"),
      });
    } catch (err: any) {
      toast({
        title: t("त्रुटी", "Error"),
        description: err?.message || t("स्थिती बदलता आली नाही.", "Failed to change status."),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (notice: NoticeRecord) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this notice?"))) return;
    try {
      await deleteNotice(notice.id);
      setNotices((prev) => prev.filter((n) => n.id !== notice.id));
      if (editingId === notice.id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch (err: any) {
      toast({
        title: t("त्रुटी", "Error"),
        description: err?.message || t("हटवता आले नाही.", "Failed to delete."),
        variant: "destructive",
      });
    }
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <div className="space-y-8 font-devanagari">
      
      {/* Hero Banner Header */}
      <div className="gov-gradient rounded-3xl p-5 sm:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
              <Megaphone className="w-3.5 h-3.5" />
              {t("शासकीय निविदा व प्रसिद्धी", "Official Notices & Press Releases")}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{t("सूचना व्यवस्थापन", "Notice Management")}</h1>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1">
              {t("नवीन सूचना, निविदा व जाहीर प्रगटनांची नोंदणी आणि थेट प्रसारण अद्यतन.", "Publish, edit, or archive official municipal notices & circulars.")}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            📢
          </div>
        </div>
      </div>

      <div ref={formRef}>
        <Card className={`rounded-3xl border border-border shadow-xl overflow-hidden transition-all duration-300 ${editingId ? "ring-2 ring-primary border-primary" : ""}`}>
          <CardHeader className="bg-muted/40 border-b border-border">
            <CardTitle className="text-base font-black flex items-center gap-2 text-foreground">
              {editingId ? <Pencil className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-primary" />}
              <span>{editingId ? t("सूचना संपादित करा", "Edit Notice") : t("नवीन सूचना जोडा", "Add New Notice")}</span>
              {editingId && <Button type="button" variant="ghost" size="sm" className="ml-auto rounded-xl" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">English</p>
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder="Title (English)" value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
              <Input placeholder="Tag (English)" value={form.tagEn} onChange={(e) => setForm((f) => ({ ...f, tagEn: e.target.value }))} />
            </div>
            <Textarea placeholder="Content (English)" value={form.contentEn} onChange={(e) => setForm((f) => ({ ...f, contentEn: e.target.value }))} rows={3} />
            <AutoTranslateButton fields={[
              { value: form.titleEn, onTranslated: (v) => setForm((f) => ({ ...f, title: v })) },
              { value: form.tagEn, onTranslated: (v) => setForm((f) => ({ ...f, tag: v })) },
              { value: form.contentEn, onTranslated: (v) => setForm((f) => ({ ...f, content: v })) },
            ]} />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">मराठी</p>
            <div className="grid md:grid-cols-2 gap-3">
              <Input placeholder={t("शीर्षक (मराठी) *", "Title (Marathi) *")} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Input placeholder={t("टॅग (मराठी)", "Tag (Marathi)")} value={form.tag} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))} />
            </div>
            <Textarea placeholder={t("मजकूर (मराठी) *", "Content (Marathi) *")} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={3} />
            {/* Notice Document (Vercel Blob PDF or Drive Link) */}
            <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                  <FileText className="w-4 h-4 text-primary" />
                  {t("अधिकृत सूचना दस्तऐवज (PDF किंवा गुगल ड्राईव्ह लिंक)", "Notice Document (PDF or Drive Link)")}
                  <span className="text-muted-foreground font-normal text-[11px]">({t("ऐच्छिक", "Optional")})</span>
                </label>

                {/* Mode Toggle Buttons */}
                <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border/60">
                  <button
                    type="button"
                    onClick={() => setDocMode("file")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      docMode === "file"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Upload className="w-3 h-3 inline mr-1" />
                    {t("PDF फाईल (Vercel Blob)", "PDF File")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocMode("drive")}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      docMode === "drive"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ExternalLink className="w-3 h-3 inline mr-1" />
                    {t("गुगल ड्राईव्ह लिंक", "Drive Link")}
                  </button>
                </div>
              </div>

              {docMode === "file" ? (
                <div className="space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 flex-wrap">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingDoc}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploadingDoc
                        ? t("Vercel Blob वर अपलोड होत आहे...", "Uploading to Vercel Blob...")
                        : t("PDF / फोटो निवडा (कमाल २० MB)", "Choose PDF / Photo (Max 20 MB)")}
                    </Button>

                    {form.documentUrl && !form.documentUrl.includes("drive.google.com") && !form.documentUrl.includes("docs.google.com") && (
                      <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t("Vercel Blob वर सुरक्षित", "Stored in Vercel Blob")}</span>
                        <a
                          href={form.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline font-semibold ml-1 inline-flex items-center gap-0.5"
                        >
                          {t("पहा", "View")}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1 text-xs text-destructive hover:bg-transparent"
                          onClick={() => setForm({ ...form, documentUrl: "" })}
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Input
                    type="url"
                    placeholder={t(
                      "गुगल ड्राईव्ह किंवा डॉक्युमेंट लिंक पेस्ट करा (https://drive.google.com/...)",
                      "Paste Google Drive notice link (https://drive.google.com/...)"
                    )}
                    value={form.externalUrl || form.documentUrl}
                    onChange={(e) => setForm({ ...form, externalUrl: e.target.value, documentUrl: e.target.value })}
                    className="text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {t("गुगल ड्राईव्ह लिंक थेट Supabase मध्ये सुरक्षित केली जाईल.", "Google Drive link will be stored directly in Supabase.")}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={isSaving } className="gov-gradient text-primary-foreground">
                {isSaving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतन करा", "Update") : t("सूचना जोडा", "Add Notice")}
              </Button>
              {editingId && <Button variant="outline" onClick={cancelEdit}>{t("रद्द करा", "Cancel")}</Button>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {notices.length === 0  && (
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
