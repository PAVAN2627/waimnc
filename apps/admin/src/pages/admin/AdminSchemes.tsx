import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ImageIcon, Pencil, X, BookOpen, FileText, Upload, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { uploadMedia } from "@/lib/api";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  subscribeToSchemes, createScheme, deleteScheme, updateScheme,
  type SchemeRecord, type SchemeCategory,
} from "@/lib/schemes";

function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const MAX = 1000;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const c = document.createElement("canvas");
      c.width = width; c.height = height;
      c.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(c.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const empty = {
  category: "central" as SchemeCategory,
  titleMr: "", titleEn: "",
  descMr: "", descEn: "",
  eligibilityMr: "", eligibilityEn: "",
  benefitsMr: "", benefitsEn: "",
  externalUrl: "", imageBase64: "",
  status: "active" as const,
};

const CATEGORIES: { value: SchemeCategory; labelMr: string; labelEn: string }[] = [
  { value: "central", labelMr: "केंद्र सरकार", labelEn: "Central Govt" },
  { value: "state", labelMr: "राज्य सरकार", labelEn: "State Govt" },
  { value: "local", labelMr: "स्थानिक", labelEn: "Local" },
  { value: "other", labelMr: "इतर", labelEn: "Other" },
];

const AdminSchemes = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<SchemeRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [grDocMode, setGrDocMode] = useState<"file" | "drive">("file");
  const [isUploadingGr, setIsUploadingGr] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const grFileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToSchemes(setItems);
  }, []);

  const handleGrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 20 MB", variant: "destructive" });
      return;
    }
    try {
      setIsUploadingGr(true);
      const res = await uploadMedia(file, "schemes");
      setForm((f) => ({ ...f, externalUrl: res.viewUrl }));
      toast({ title: t("शासन निर्णय PDF Vercel Blob वर सुरक्षित केले ✓", "GR PDF uploaded to Vercel Blob ✓") });
    } catch (err: any) {
      toast({ title: t("अपलोड अयशस्वी", "Upload failed"), description: err?.message, variant: "destructive" });
    } finally {
      setIsUploadingGr(false);
      e.target.value = "";
    }
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" });
      return;
    }
    setForm((f) => ({ ...f, imageBase64: "" }));
    try {
      setSaving(true);
      const res = await uploadMedia(file, "schemes");
      setForm((f) => ({ ...f, imageBase64: res.viewUrl }));
      toast({ title: t("फोटो Vercel Blob वर अपलोड केला", "Photo uploaded to Vercel Blob") });
    } catch (err) {
      console.warn("Direct upload fallback:", err);
      const b64 = await imageToBase64(file);
      setForm((f) => ({ ...f, imageBase64: b64 }));
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const startEdit = (item: SchemeRecord) => {
    setEditingId(item.id);
    setForm({
      category: item.category, titleMr: item.titleMr, titleEn: item.titleEn,
      descMr: item.descMr, descEn: item.descEn,
      eligibilityMr: item.eligibilityMr, eligibilityEn: item.eligibilityEn,
      benefitsMr: item.benefitsMr, benefitsEn: item.benefitsEn,
      externalUrl: item.externalUrl, imageBase64: item.imageBase64, status: item.status,
    });
    if (item.externalUrl && (item.externalUrl.includes("drive.google.com") || item.externalUrl.includes("docs.google.com"))) {
      setGrDocMode("drive");
    } else {
      setGrDocMode("file");
    }
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleMr) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateScheme(editingId, form);
        setItems((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...form } : s))
        );
        toast({ title: t("यशस्वी", "Success"), description: t("योजना अद्यतनित केली.", "Scheme updated.") });
        setEditingId(null);
      } else {
        const created = await createScheme(form);
        setItems((prev) => [created, ...prev]);
        toast({ title: t("यशस्वी", "Success"), description: t("योजना जोडली.", "Scheme added.") });
      }
      setForm(empty);
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this scheme?"))) return;
    try {
      setDeleting(id);
      await deleteScheme(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const toggleStatus = async (item: SchemeRecord) => {
    const next = item.status === "active" ? "inactive" : "active";
    try {
      await updateScheme(item.id, { status: next });
      setItems((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: next } : s)));
      toast({
        title: next === "active" ? t("योजना सक्रिय केली", "Scheme activated") : t("योजना निष्क्रिय केली", "Scheme deactivated"),
      });
    } catch (err: any) {
      toast({ title: t("त्रुटी", "Error"), description: err?.message || t("स्थिती बदलता आली नाही.", "Failed to update status."), variant: "destructive" });
    }
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";

  const categoryLabel = (cat: SchemeCategory) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? t(found.labelMr, found.labelEn) : cat;
  };

  const categoryColor: Record<SchemeCategory, string> = {
    central: "bg-blue-100 text-blue-700",
    state: "bg-orange-100 text-orange-700",
    local: "bg-green-100 text-green-700",
    other: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("योजना व्यवस्थापन", "Schemes Management")}</h1>

      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("योजना संपादित करा", "Edit Scheme") : t("नवीन योजना जोडा", "Add New Scheme")}
              {editingId && (
                <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={cancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: category + status */}
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("श्रेणी *", "Category *")}</label>
                  <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SchemeCategory }))}>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{t(c.labelMr, c.labelEn)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("स्थिती", "Status")}</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))}>
                    <option value="active">{t("सक्रिय", "Active")}</option>
                    <option value="inactive">{t("निष्क्रिय", "Inactive")}</option>
                  </select>
                </div>
              </div>

              {/* English fields */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">English</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Title (English)</label>
                  <input className={inputCls} value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Description (English)</label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.descEn} onChange={(e) => setForm((f) => ({ ...f, descEn: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Eligibility (English)</label>
                  <textarea rows={3} className={inputCls + " resize-none"} placeholder="One condition per line" value={form.eligibilityEn} onChange={(e) => setForm((f) => ({ ...f, eligibilityEn: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Benefits (English)</label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.benefitsEn} onChange={(e) => setForm((f) => ({ ...f, benefitsEn: e.target.value }))} />
                </div>
              </div>

              {/* Translate All */}
              <AutoTranslateButton fields={[
                { value: form.titleEn, onTranslated: (v) => setForm((f) => ({ ...f, titleMr: v })) },
                { value: form.descEn, onTranslated: (v) => setForm((f) => ({ ...f, descMr: v })) },
                { value: form.eligibilityEn, onTranslated: (v) => setForm((f) => ({ ...f, eligibilityMr: v })) },
                { value: form.benefitsEn, onTranslated: (v) => setForm((f) => ({ ...f, benefitsMr: v })) },
              ]} />

              {/* Marathi fields */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">मराठी</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("शीर्षक (मराठी) *", "Title (Marathi) *")}</label>
                  <input required className={inputCls} value={form.titleMr} onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("वर्णन (मराठी)", "Description (Marathi)")}</label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.descMr} onChange={(e) => setForm((f) => ({ ...f, descMr: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("पात्रता (मराठी)", "Eligibility (Marathi)")}</label>
                  <textarea rows={3} className={inputCls + " resize-none"} placeholder={t("प्रत्येक ओळीत एक अट", "One condition per line")} value={form.eligibilityMr} onChange={(e) => setForm((f) => ({ ...f, eligibilityMr: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("फायदे (मराठी)", "Benefits (Marathi)")}</label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.benefitsMr} onChange={(e) => setForm((f) => ({ ...f, benefitsMr: e.target.value }))} />
                </div>
              </div>

              {/* Row 6: Scheme GR Document (Vercel Blob PDF or Drive Link) + Image */}
              <div className="space-y-3">
                <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                      <FileText className="w-4 h-4 text-primary" />
                      {t("योजना शासन निर्णय (GR) / माहितीपत्रक", "Scheme GR / Guideline Document")}
                      <span className="text-muted-foreground font-normal text-[11px]">({t("ऐच्छिक", "Optional")})</span>
                    </label>

                    <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border/60">
                      <button
                        type="button"
                        onClick={() => setGrDocMode("file")}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                          grDocMode === "file"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Upload className="w-3 h-3 inline mr-1" />
                        {t("PDF फाईल (Vercel Blob)", "PDF File")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGrDocMode("drive")}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                          grDocMode === "drive"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        {t("गुगल ड्राईव्ह लिंक", "Drive Link")}
                      </button>
                    </div>
                  </div>

                  {grDocMode === "file" ? (
                    <div className="space-y-2">
                      <input
                        ref={grFileRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleGrUpload}
                        className="hidden"
                      />
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploadingGr}
                          onClick={() => grFileRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingGr
                            ? t("Vercel Blob वर अपलोड होत आहे...", "Uploading to Vercel Blob...")
                            : t("शासन निर्णय PDF निवडा (कमाल २० MB)", "Choose GR PDF (Max 20 MB)")}
                        </Button>

                        {form.externalUrl && !form.externalUrl.includes("drive.google.com") && !form.externalUrl.includes("docs.google.com") && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t("Vercel Blob वर सुरक्षित", "Stored in Vercel Blob")}</span>
                            <a
                              href={form.externalUrl}
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
                              onClick={() => setForm({ ...form, externalUrl: "" })}
                            >
                              ✕
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <input
                        type="url"
                        className={inputCls}
                        placeholder={t(
                          "गुगल ड्राईव्ह लिंक पेस्ट करा (https://drive.google.com/...)",
                          "Paste Google Drive scheme link (https://drive.google.com/...)"
                        )}
                        value={form.externalUrl}
                        onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        {t("गुगल ड्राईव्ह लिंक थेट Supabase मध्ये सुरक्षित केली जाईल.", "Google Drive link will be stored directly in Supabase.")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="text-sm font-medium block mb-1">{t("फोटो", "Photo")}</label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      <ImageIcon className="h-4 w-4 mr-1" />{t("फोटो निवडा", "Choose Photo")}
                    </Button>
                    {form.imageBase64 && <img src={form.imageBase64} className="h-12 w-20 object-cover rounded border" />}
                    {form.imageBase64 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, imageBase64: "" }))}>✕</Button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gov-gradient text-primary-foreground">
                  {saving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतन करा", "Update") : t("जोडा", "Add Scheme")}
                </Button>
                {editingId && <Button type="button" variant="outline" onClick={cancelEdit}>{t("रद्द करा", "Cancel")}</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("कोणत्याही योजना नाहीत.", "No schemes yet.")}</p>
        )}
        {items.map((item) => (
          <Card key={item.id} className={editingId === item.id ? "border-primary ring-1 ring-primary" : ""}>
            <CardContent className="p-4 flex items-start gap-4">
              {item.imageBase64
                ? <img src={item.imageBase64} className="w-20 h-16 object-cover rounded flex-shrink-0" />
                : <div className="w-20 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-muted-foreground" />
                  </div>
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor[item.category]}`}>
                    {categoryLabel(item.category)}
                  </span>
                </div>
                <p className="font-semibold text-sm">{item.titleMr}</p>
                {item.titleEn && <p className="text-xs text-muted-foreground">{item.titleEn}</p>}
                {item.descMr && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.descMr}</p>}
                {item.externalUrl && (
                  <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline mt-1 block truncate">{item.externalUrl}</a>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleStatus(item)}
                  className={`text-xs px-2 py-1 rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {item.status === "active" ? t("सक्रिय", "Active") : t("निष्क्रिय", "Inactive")}
                </button>
                <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4 text-primary" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" disabled={deleting === item.id} onClick={() => handleDelete(item.id)}>
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

export default AdminSchemes;
