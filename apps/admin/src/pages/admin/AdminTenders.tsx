import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, FileText, Pencil, X, Calendar, DollarSign, Upload, CheckCircle2, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import { fetchAdminTenders, createTender, updateTender, deleteTender, uploadMedia } from "@/lib/api";

export interface TenderRecord {
  id: string;
  tenderNumber: string;
  titleMr: string;
  titleEn: string;
  department: string;
  category: string;
  estimatedCost: number | null;
  tenderFee: number | null;
  emdAmount: number | null;
  publishDate: string;
  submissionEndDate: string;
  openingDate: string | null;
  documentUrl: string | null;
  status: "ACTIVE" | "CLOSED" | "ARCHIVED";
}

const emptyForm = {
  tenderNumber: "",
  titleMr: "",
  titleEn: "",
  department: "बांधकाम विभाग",
  category: "सिव्हिल कामे",
  estimatedCost: "",
  tenderFee: "",
  emdAmount: "",
  publishDate: new Date().toISOString().split("T")[0],
  submissionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  openingDate: "",
  documentUrl: "",
  status: "ACTIVE" as const,
};

const DEPARTMENTS = [
  "बांधकाम विभाग",
  "विद्युत विभाग",
  "आरोग्य व स्वच्छता",
  "पाणी पुरवठा",
  "सामान्य प्रशासन",
  "माहिती तंत्रज्ञान",
];

export default function AdminTenders() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [tenders, setTenders] = useState<TenderRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docMode, setDocMode] = useState<"file" | "drive">("file");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const loadTenders = async () => {
    try {
      const data = await fetchAdminTenders();
      setTenders(data || []);
    } catch (err) {
      console.warn("Failed to load tenders:", err);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast({ title: t("फाइल खूप मोठी आहे", "File too large"), description: "Max 25 MB", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const res = await uploadMedia(file, "tenders");
      setForm((f) => ({ ...f, documentUrl: res.viewUrl }));
      toast({ title: t("निविदा PDF Vercel Blob वर अपलोड केले", "Tender PDF uploaded to Vercel Blob") });
    } catch (err) {
      toast({ title: t("अपलोड अयशस्वी", "Upload failed"), variant: "destructive" });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleMr.trim() || !form.tenderNumber.trim()) {
      toast({ title: t("कृपया आवश्यक माहिती भरा", "Please fill required fields"), variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        tenderNumber: form.tenderNumber.trim(),
        titleMr: form.titleMr.trim(),
        titleEn: form.titleEn?.trim() || form.titleMr.trim(),
        department: form.department,
        category: form.category,
        estimatedCost: form.estimatedCost ? parseFloat(form.estimatedCost) : null,
        tenderFee: form.tenderFee ? parseFloat(form.tenderFee) : null,
        emdAmount: form.emdAmount ? parseFloat(form.emdAmount) : null,
        publishDate: form.publishDate,
        submissionEndDate: form.submissionEndDate,
        openingDate: form.openingDate || null,
        documentUrl: form.documentUrl || null,
        status: form.status,
      };

      if (editingId) {
        await updateTender(editingId, payload);
        toast({ title: t("निविदा अद्यतनित केली", "Tender updated successfully") });
      } else {
        await createTender(payload);
        toast({ title: t("नवीन निविदा प्रसिद्ध केली", "New tender published successfully") });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadTenders();
    } catch (err: any) {
      toast({ title: t("त्रुटी", "Error"), description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: TenderRecord) => {
    setEditingId(item.id);
    setForm({
      tenderNumber: item.tenderNumber,
      titleMr: item.titleMr,
      titleEn: item.titleEn,
      department: item.department,
      category: item.category,
      estimatedCost: item.estimatedCost ? String(item.estimatedCost) : "",
      tenderFee: item.tenderFee ? String(item.tenderFee) : "",
      emdAmount: item.emdAmount ? String(item.emdAmount) : "",
      publishDate: item.publishDate ? item.publishDate.split("T")[0] : "",
      submissionEndDate: item.submissionEndDate ? item.submissionEndDate.split("T")[0] : "",
      openingDate: item.openingDate ? item.openingDate.split("T")[0] : "",
      documentUrl: item.documentUrl || "",
      status: item.status,
    });
    if (item.documentUrl && (item.documentUrl.includes("drive.google.com") || item.documentUrl.includes("docs.google.com"))) {
      setDocMode("drive");
    } else {
      setDocMode("file");
    }
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("ही निविदा हटवायची आहे का?", "Are you sure you want to delete this tender?"))) return;
    try {
      await deleteTender(id);
      setTenders((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      toast({ title: t("निविदा हटवली", "Tender deleted") });
    } catch (err: any) {
      toast({ title: t("त्रुटी", "Error"), description: err.message, variant: "destructive" });
    }
  };

  const toggleStatus = async (item: TenderRecord) => {
    const next: "ACTIVE" | "CLOSED" = item.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    try {
      await updateTender(item.id, { status: next });
      setTenders((prev) => prev.map((t) => (t.id === item.id ? { ...t, status: next } : t)));
      toast({
        title: next === "ACTIVE" ? t("निविदा सक्रिय केली", "Tender activated") : t("निविदा बंद केली", "Tender closed"),
      });
    } catch (err: any) {
      toast({ title: t("त्रुटी", "Error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("ई-निविदा व्यवस्थापन", "E-Tender Management")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("नगरपरिषदेच्या निविदा प्रसिद्ध करा व दस्तऐवज Vercel Blob वर व्यवस्थापित करा.", "Publish municipal tenders and manage documents via Vercel Blob.")}
          </p>
        </div>
      </div>

      {/* Tender Editor Form */}
      <Card ref={formRef}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{editingId ? t("निविदा संपादित करा", "Edit Tender") : t("नवीन निविदा प्रसिद्ध करा", "Publish New Tender")}</span>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                <X className="w-4 h-4 mr-1" /> {t("रद्द करा", "Cancel")}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold">{t("निविदा क्रमांक (Tender No.)", "Tender Number")} *</label>
                <Input
                  value={form.tenderNumber}
                  onChange={(e) => setForm({ ...form, tenderNumber: e.target.value })}
                  placeholder="उदा. WMC-TEND-2026-001"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold">{t("विभाग (Department)", "Department")}</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full h-10 px-3 text-sm rounded-md border border-input bg-background"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold">{t("निविदा शीर्षक (मराठी)", "Title (Marathi)")} *</label>
                <Input
                  value={form.titleMr}
                  onChange={(e) => setForm({ ...form, titleMr: e.target.value })}
                  placeholder="उदा. मुख्य रस्ता सिमेंट काँक्रीटीकरण कामे"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">{t("निविदा शीर्षक (English)", "Title (English)")}</label>
                  <AutoTranslateButton
                    sourceText={form.titleMr}
                    onTranslated={(text) => setForm((f) => ({ ...f, titleEn: text }))}
                  />
                </div>
                <Input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="e.g. Main Road Concreting Work"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">{t("अंदाजित रक्कम (₹)", "Estimated Cost (₹)")}</label>
                <Input
                  type="number"
                  value={form.estimatedCost}
                  onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })}
                  placeholder="4500000"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">{t("बयाणा रक्कम - EMD (₹)", "EMD Amount (₹)")}</label>
                <Input
                  type="number"
                  value={form.emdAmount}
                  onChange={(e) => setForm({ ...form, emdAmount: e.target.value })}
                  placeholder="45000"
                />
              </div>

              <div>
                <label className="text-xs font-semibold">{t("प्रसिद्धी तारीख (Publish Date)", "Publish Date")}</label>
                <Input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) => setForm({ ...form, publishDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold">{t("अंतिम मुदत (Submission End Date)", "Submission Deadline")}</label>
                <Input
                  type="date"
                  value={form.submissionEndDate}
                  onChange={(e) => setForm({ ...form, submissionEndDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Tender PDF (Vercel Blob) or Google Drive Link */}
            <div className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  {t("निविदा दस्तऐवज (Tender Specification / Document)", "Tender Document (PDF or Drive Link)")}
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
                <div className="flex items-center gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleDocumentUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? t("अपलोड होत आहे...", "Uploading to Vercel Blob...") : t("PDF निवडा (कमाल २५ MB)", "Upload PDF (Max 25 MB)")}
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
              ) : (
                <div className="space-y-1.5">
                  <Input
                    type="url"
                    placeholder={t(
                      "गुगल ड्राईव्ह निविदा दस्तऐवज लिंक पेस्ट करा (https://drive.google.com/...)",
                      "Paste Google Drive tender link (https://drive.google.com/...)"
                    )}
                    value={form.documentUrl}
                    onChange={(e) => setForm({ ...form, documentUrl: e.target.value })}
                    className="text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    {t("गुगल ड्राईव्ह लिंक थेट Supabase डेटाबेसमध्ये सुरक्षित केली जाईल.", "Google Drive link will be stored directly in Supabase database.")}
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" disabled={saving || uploading} className="gov-gradient text-white">
              {saving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतनित करा", "Update Tender") : t("प्रसिद्ध करा", "Publish Tender")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tenders List */}
      <div className="space-y-3">
        {tenders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              {t("कोणतीही निविदा उपलब्ध नाही.", "No tenders published yet.")}
            </CardContent>
          </Card>
        ) : (
          tenders.map((tItem) => (
            <Card key={tItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded">
                      {tItem.tenderNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      tItem.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}>
                      {tItem.status === "ACTIVE" ? t("चालू", "ACTIVE") : t("बंद", "CLOSED")}
                    </span>
                    <span className="text-xs text-muted-foreground">• {tItem.department}</span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">
                    {lang === "mr" ? tItem.titleMr : (tItem.titleEn || tItem.titleMr)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    {tItem.estimatedCost && (
                      <span>{t("अंदाजित रक्कम: ₹", "Est. Cost: ₹")}{tItem.estimatedCost.toLocaleString("en-IN")}</span>
                    )}
                    <span>{t("मुदत: ", "Deadline: ")}{tItem.submissionEndDate.split("T")[0]}</span>
                    {tItem.documentUrl && (
                      <a
                        href={tItem.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(tItem)}
                  >
                    {tItem.status === "ACTIVE" ? t("बंद करा", "Close") : t("सक्रिय करा", "Activate")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(tItem)}>
                    <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tItem.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

