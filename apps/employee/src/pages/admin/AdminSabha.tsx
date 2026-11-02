import { useEffect, useRef, useState, useMemo } from "react";
import { Plus, Trash2, Video, FileText, Pencil, X, Search, Calendar, Filter, Sparkles, Download, ExternalLink, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { uploadMedia } from "@/lib/api";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  subscribeToSabha, createSabha, deleteSabha, updateSabha, sortSabhaNewestFirst,
  SABHA_CATEGORIES,
  type SabhaRecord, type MeetingState, type SabhaCategory,
} from "@/lib/sabha";

function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const currentYear = new Date().getFullYear();

const empty = {
  type: "previous" as MeetingState,
  sabhaType: "sarvasadharan" as SabhaCategory,
  year: currentYear,
  tharavNumber: "",
  titleMr: "",
  titleEn: "",
  date: new Date().toISOString().slice(0, 10),
  time: "11:00",
  videoUrl: "",
  minutesBase64: "",
  minutesName: "",
  status: "active" as const,
};

const AdminSabha = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<SabhaRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [pdfMode, setPdfMode] = useState<"file" | "drive">("file");

  const pdfRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeToSabha(setItems);
  }, []);

  // Only extract years that actually have recorded sabha meetings (for filtering)
  const filterYears = useMemo(() => {
    const yearsSet = new Set<number>();
    items.forEach((item) => {
      if (item.year) yearsSet.add(item.year);
      else if (item.date) {
        const y = parseInt(item.date.slice(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [items]);

  // Suggestions for create form datalist
  const formYearSuggestions = useMemo(() => {
    const set = new Set<number>([currentYear, currentYear - 1, currentYear - 2, 2020]);
    filterYears.forEach((y) => set.add(y));
    return Array.from(set).sort((a, b) => b - a);
  }, [filterYears]);

  useEffect(() => {
    if (selectedYear !== "all" && !filterYears.includes(Number(selectedYear))) {
      setSelectedYear("all");
    }
  }, [filterYears, selectedYear]);

  // Filtered & sorted newest first
  const filteredItems = useMemo(() => {
    let result = sortSabhaNewestFirst(items);

    if (selectedYear !== "all") {
      const y = parseInt(selectedYear, 10);
      result = result.filter((i) => i.year === y || (i.date && i.date.startsWith(selectedYear)));
    }

    if (selectedType !== "all") {
      result = result.filter((i) => i.sabhaType === selectedType);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (i) =>
          i.titleMr.toLowerCase().includes(q) ||
          i.titleEn.toLowerCase().includes(q) ||
          (i.tharavNumber && i.tharavNumber.toLowerCase().includes(q))
      );
    }

    return result;
  }, [items, selectedYear, selectedType, searchQuery]);

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: t("फाईल खूप मोठी आहे", "File too large"), description: t("कमाल आकार १५ MB", "Max 15 MB"), variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const res = await uploadMedia(file, "sabha");
      setForm((f) => ({ ...f, minutesBase64: res.viewUrl, minutesName: file.name }));
      toast({ title: t("इतिवृत्त व ठराव PDF यशस्वीरित्या जोडले", "Minutes & Tharav PDF uploaded") });
    } catch (err) {
      console.warn("Direct upload fallback:", err);
      const base64 = await pdfToBase64(file);
      setForm((f) => ({ ...f, minutesBase64: base64, minutesName: file.name }));
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const startEdit = (item: SabhaRecord) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      sabhaType: item.sabhaType || "sarvasadharan",
      year: item.year || (item.date ? parseInt(item.date.slice(0, 4), 10) : currentYear),
      tharavNumber: item.tharavNumber || "",
      titleMr: item.titleMr,
      titleEn: item.titleEn,
      date: item.date,
      time: item.time,
      videoUrl: item.videoUrl,
      minutesBase64: item.minutesBase64,
      minutesName: item.minutesName,
      status: item.status,
    });
    if (item.minutesUrl && (item.minutesUrl.includes("drive.google.com") || item.minutesUrl.includes("docs.google.com"))) {
      setPdfMode("drive");
    } else if (item.minutesBase64 && item.minutesBase64.startsWith("http") && (item.minutesBase64.includes("drive.google.com") || item.minutesBase64.includes("docs.google.com"))) {
      setPdfMode("drive");
    } else {
      setPdfMode("file");
    }
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(empty);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleMr || !form.date) {
      toast({ title: t("कृपया आवश्यक माहिती भरा", "Please fill required fields"), variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      const parsedYear = form.date ? parseInt(form.date.slice(0, 4), 10) : form.year;
      const payload = {
        ...form,
        year: parsedYear || form.year,
      };

      if (editingId) {
        await updateSabha(editingId, payload);
        setItems((prev) =>
          prev.map((s) => (s.id === editingId ? { ...s, ...payload } : s))
        );
        toast({ title: t("यशस्वी", "Success"), description: t("सभा व ठराव अद्यतनित केला.", "Sabha & Tharav updated.") });
        setEditingId(null);
      } else {
        const created = await createSabha(payload);
        setItems((prev) => [created, ...prev]);
        toast({ title: t("यशस्वी", "Success"), description: t("नवीन सभा व ठराव जोडला गेला.", "New Sabha & Tharav added.") });
      }
      setForm(empty);
    } catch {
      toast({ title: t("त्रुटी", "Error"), description: t("जतन करताना अडचण आली.", "Failed to save."), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("ही सभा व ठराव नक्की हटवायचे आहेत का?", "Delete this sabha & tharav?"))) return;
    try {
      setDeleting(id);
      await deleteSabha(id);
      setItems((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  const toggleStatus = async (item: SabhaRecord) => {
    const next = item.status === "active" ? "inactive" : "active";
    try {
      await updateSabha(item.id, { status: next });
      setItems((prev) => prev.map((s) => (s.id === item.id ? { ...s, status: next } : s)));
      toast({
        title: next === "active" ? t("सक्रिय केले", "Activated") : t("निष्क्रिय केले", "Deactivated"),
      });
    } catch (err: any) {
      toast({ title: t("त्रुटी", "Error"), description: err?.message, variant: "destructive" });
    }
  };

  const inputCls = "w-full border rounded-xl px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary focus:outline-none";

  const getSabhaTypeMeta = (type: SabhaCategory) => {
    return SABHA_CATEGORIES.find((c) => c.key === type) || SABHA_CATEGORIES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="gov-gradient rounded-3xl p-6 md:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 border border-white/30">
              <Calendar className="w-3.5 h-3.5" />
              {t("नगरपरिषद कामकाज अभिलेख", "Municipal Council Proceedings")}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white">
              {t("सभा व ठराव व्यवस्थापन (Sabha / Tharav)", "Sabha & Resolutions Management")}
            </h1>
            <p className="text-primary-foreground/90 text-xs md:text-sm mt-1 max-w-xl">
              {t(
                "सर्वसाधारण सभा, विशेष सभा व स्थायी समिती सभांचे आयोजन, अजेंडा, व्हिडिओ प्रसारण व मंजूर ठराव PDF व्यवस्थापन.",
                "Manage General Body, Special, and Standing Committee meetings, live broadcasts, agendas, and resolution PDFs."
              )}
            </p>
          </div>

          <Button
            onClick={() => {
              cancelEdit();
              setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
            }}
            className="bg-white text-primary hover:bg-white/90 font-bold rounded-xl shadow-lg"
          >
            <Plus className="w-4 h-4 mr-1" />
            {t("नवीन सभा / ठराव जोडा", "Add Sabha / Tharav")}
          </Button>
        </div>
      </div>

      {/* Add / Edit Form Card */}
      <div ref={formRef}>
        <Card className={`rounded-2xl shadow-md border ${editingId ? "border-primary ring-2 ring-primary/20" : ""}`}>
          <CardHeader className="bg-muted/40 border-b py-4">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
                <span>{editingId ? t("सभा व ठराव संपादित करा", "Edit Sabha / Tharav") : t("नवीन सभा व ठराव नोंदणी", "Add New Sabha / Tharav")}</span>
              </div>
              {editingId && (
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  {t("रद्द करा", "Cancel")}
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Sabha Category, State (Upcoming/Previous), Year */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 3 Sabha Types */}
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("सभेचा प्रकार (3 Types of Sabha) *", "Type of Sabha *")}
                  </label>
                  <select
                    className={inputCls}
                    value={form.sabhaType}
                    onChange={(e) => setForm((f) => ({ ...f, sabhaType: e.target.value as SabhaCategory }))}
                  >
                    <option value="sarvasadharan">{t("सर्वसाधारण सभा (Sarvasadharan Sabha)", "General Body Meeting")}</option>
                    <option value="vishesh">{t("विशेष सभा (Vishesh Sabha)", "Special Meeting")}</option>
                    <option value="sthayi_samiti">{t("स्थायी समिती सभा (Sthayi Samiti Sabha)", "Standing Committee Meeting")}</option>
                  </select>
                </div>

                {/* State: Upcoming vs Previous */}
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("सभेची स्थिती (Status) *", "Meeting State *")}
                  </label>
                  <select
                    className={inputCls}
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as MeetingState }))}
                  >
                    <option value="previous">{t("मागील सभा व ठराव प्रसिद्ध (Previous / Tharav Published)", "Previous / Published Tharav")}</option>
                    <option value="upcoming">{t("आगामी सभा (Upcoming Meeting)", "Upcoming Meeting")}</option>
                  </select>
                </div>

                {/* Year - writable input with datalist */}
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("सभेचे वर्ष (Year - टाईप करा किंवा निवडा) *", "Meeting Year (Type or Select) *")}
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2099}
                    required
                    list="employee-sabha-years-list"
                    className={inputCls}
                    value={form.year || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setForm((f) => ({ ...f, year: isNaN(val) ? currentYear : val }));
                    }}
                    placeholder={t("उदा. 2026, 2024, 2020...", "e.g. 2026, 2024, 2020...")}
                  />
                  <datalist id="employee-sabha-years-list">
                    {formYearSuggestions.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </datalist>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">
                    {t("वर्ष हाताने टाईप करू शकता (उदा. 2020, 2021, 2022...) किंवा यादीतून निवडा.", "Type any year directly (e.g. 2020, 2021...) or choose.")}
                  </span>
                </div>
              </div>

              {/* Row 2: Date, Time, Tharav Number */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("सभेची तारीख (Date) *", "Meeting Date *")}
                  </label>
                  <input
                    type="date"
                    required
                    className={inputCls}
                    value={form.date}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      const parsedYear = parseInt(newDate.slice(0, 4), 10);
                      setForm((f) => ({
                        ...f,
                        date: newDate,
                        year: !isNaN(parsedYear) ? parsedYear : f.year,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("सभेची वेळ (Time)", "Meeting Time")}
                  </label>
                  <input
                    type="time"
                    className={inputCls}
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("ठराव / विषय क्र. (Tharav No.)", "Resolution / Item No.")}
                  </label>
                  <input
                    className={inputCls}
                    placeholder={t("उदा. ठराव क्र. १२/२०२६", "e.g. Res. No. 12/2026")}
                    value={form.tharavNumber}
                    onChange={(e) => setForm((f) => ({ ...f, tharavNumber: e.target.value }))}
                  />
                </div>
              </div>

              {/* Row 3: Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">Title / Agenda (English)</label>
                  <input
                    className={inputCls}
                    placeholder="General Council Meeting discussion on DP Road"
                    value={form.titleEn}
                    onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("सभेचा विषय / ठराव शीर्षक (मराठी) *", "Meeting Title / Agenda (Marathi) *")}
                  </label>
                  <input
                    required
                    className={inputCls}
                    placeholder="उदा. वाई शहरातील रस्ते व पाणीपुरवठा विकास कामांना मंजुरी"
                    value={form.titleMr}
                    onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))}
                  />
                </div>
              </div>

              <AutoTranslateButton
                fields={[
                  { value: form.titleEn, onTranslated: (v) => setForm((f) => ({ ...f, titleMr: v })) },
                ]}
              />

              {/* Row 4: Video URL and PDF Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1 text-foreground">
                    {t("व्हिडिओ / थेट प्रक्षेपण URL (YouTube Live / Recording)", "Video / Recording URL")}
                  </label>
                  <input
                    className={inputCls}
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.videoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-foreground">
                      {t("इतिवृत्त व ठराव (PDF अपलोड किंवा Google Drive लिंक)", "Minutes & Resolution (PDF or Drive Link)")}
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPdfMode("file")}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                          pdfMode === "file" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t("PDF फाईल", "PDF File")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPdfMode("drive")}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                          pdfMode === "drive" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {t("गुगल ड्राईव्ह लिंक", "Drive Link")}
                      </button>
                    </div>
                  </div>

                  {pdfMode === "file" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pdfRef.current?.click()}
                        className="rounded-xl border-dashed"
                      >
                        <FileText className="h-4 w-4 mr-1 text-primary" />
                        {form.minutesName ? t("PDF बदला", "Change PDF") : t("ठराव PDF अपलोड करा", "Upload Tharav PDF")}
                      </Button>
                      {form.minutesName && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] font-mono">
                          {form.minutesName}
                        </span>
                      )}
                      {(form.minutesBase64 || form.minutesUrl) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setForm((f) => ({ ...f, minutesBase64: "", minutesUrl: "", minutesName: "" }))}
                          className="text-destructive h-8 px-2"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        className={inputCls}
                        placeholder="https://drive.google.com/file/d/... किंवा थेट दस्तऐवज लिंक"
                        value={form.minutesUrl || (form.minutesBase64?.startsWith("http") ? form.minutesBase64 : "")}
                        onChange={(e) => {
                          const val = e.target.value.trim();
                          setForm((f) => ({
                            ...f,
                            minutesUrl: val,
                            minutesBase64: val,
                            minutesName: val ? "Google Drive Document" : "",
                          }));
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        {t("येथे गुगल ड्राईव्ह / शेअर केलेली थेट लिंक पेस्ट करा.", "Paste your Google Drive or shared direct document link here.")}
                      </span>
                    </div>
                  )}
                  <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    {t("रद्द करा", "Cancel")}
                  </Button>
                )}
                <Button type="submit" disabled={saving} className="gov-gradient text-white font-bold">
                  {saving
                    ? t("जतन करत आहे...", "Saving...")
                    : editingId
                    ? t("सभा व ठराव अद्यतन करा", "Update Sabha / Tharav")
                    : t("सभा व ठराव जोडा", "Add Sabha / Tharav")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar for Meetings List */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card border shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Year Filter: only shown if there are actually recorded sabhas */}
          {filterYears.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border rounded-xl px-3 py-1.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">{t("सर्व वर्षे (All Years)", "All Years")}</option>
                {filterYears.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>
          )}

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="border rounded-xl px-3 py-1.5 text-xs font-bold bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">{t("सर्व सभा (All Types)", "All Sabha Types")}</option>
              {SABHA_CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {lang === "mr" ? c.labelMr : c.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("ठराव किंवा विषय शोधा...", "Search tharav or topic...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Sabha & Tharav List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {t("सभा व ठराव यादी (नवीनतम आधी - Newest First)", "Sabha & Tharav List (Newest First)")} ({filteredItems.length})
          </h2>
          <span className="text-xs text-muted-foreground">
            {t("तारीख व वेळेनुसार क्रमवारी", "Sorted by date & time")}
          </span>
        </div>

        {filteredItems.map((item) => {
          const cat = getSabhaTypeMeta(item.sabhaType);
          const isUpcoming = item.type === "upcoming";

          return (
            <Card
              key={item.id}
              className={`rounded-2xl transition-all hover:shadow-md border ${
                editingId === item.id ? "border-primary ring-2 ring-primary/20" : ""
              }`}
            >
              <CardContent className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      isUpcoming ? "bg-red-500/10 text-red-600" : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isUpcoming ? <Video className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${cat.badgeClass}`}>
                        {lang === "mr" ? cat.labelMr : cat.labelEn}
                      </span>

                      {item.tharavNumber && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-muted border text-foreground">
                          {item.tharavNumber}
                        </span>
                      )}

                      <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date} {item.time && `(${item.time})`}</span>
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.2 rounded-full ${
                          isUpcoming ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isUpcoming ? t("आगामी", "Upcoming") : t("मागील / ठराव", "Completed / Tharav")}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm md:text-base text-foreground leading-snug">
                      {item.titleMr}
                    </h3>
                    {item.titleEn && item.titleEn !== item.titleMr && (
                      <p className="text-xs text-muted-foreground font-medium">{item.titleEn}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {item.videoUrl && (
                        <a
                          href={item.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5 fill-current flex-shrink-0" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                          <span>{t("व्हिडिओ पहा (YouTube)", "Watch Video")}</span>
                        </a>
                      )}

                      {item.minutesBase64 && (
                        <a
                          href={item.minutesBase64}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-100 flex-shrink-0" />
                          <span>{item.minutesName || t("ठराव PDF वाचा", "View/Read PDF")}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => toggleStatus(item)}
                    className={`text-xs px-2.5 py-1 rounded-full font-bold border transition-all ${
                      item.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {item.status === "active" ? t("सक्रिय", "Active") : t("निष्क्रिय", "Inactive")}
                  </button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(item)}
                    className="rounded-xl hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 rounded-xl"
                    disabled={deleting === item.id}
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="p-12 text-center bg-card rounded-2xl border text-muted-foreground space-y-2">
            <Calendar className="w-10 h-10 mx-auto opacity-40" />
            <p className="font-bold">{t("निवडलेल्या निकषांनुसार कोणतीही सभा किंवा ठराव सापडला नाही.", "No meetings or resolutions match your filter.")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSabha;
