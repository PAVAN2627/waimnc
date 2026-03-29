import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Video, FileText, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  subscribeToSabha, createSabha, deleteSabha, updateSabha,
  type SabhaRecord, type SabhaType,
} from "@/lib/sabha";

function pdfToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const empty = { type: "upcoming" as SabhaType, titleMr: "", titleEn: "", date: "", time: "", videoUrl: "", minutesBase64: "", minutesName: "", status: "active" as const };

const AdminSabha = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<SabhaRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToSabha(setItems);
  }, []);

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" }); return; }
    const base64 = await pdfToBase64(file);
    setForm((f) => ({ ...f, minutesBase64: base64, minutesName: file.name }));
    e.target.value = "";
  };

  const startEdit = (item: SabhaRecord) => {
    setEditingId(item.id);
    setForm({ type: item.type, titleMr: item.titleMr, titleEn: item.titleEn, date: item.date, time: item.time, videoUrl: item.videoUrl, minutesBase64: item.minutesBase64, minutesName: item.minutesName, status: item.status });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleMr || !form.date) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateSabha(editingId, form);
        toast({ title: t("यशस्वी", "Success"), description: t("सभा अद्यतनित केली.", "Sabha updated.") });
        setEditingId(null);
      } else {
        await createSabha(form);
        toast({ title: t("यशस्वी", "Success"), description: t("सभा जोडली.", "Sabha added.") });
      }
      setForm(empty);
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this sabha?"))) return;
    try {
      setDeleting(id);
      await deleteSabha(id);
      if (editingId === id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const toggleStatus = (item: SabhaRecord) =>
    updateSabha(item.id, { status: item.status === "active" ? "inactive" : "active" });

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";
  const upcoming = items.filter((i) => i.type === "upcoming");
  const previous = items.filter((i) => i.type === "previous");

  const SabhaCard = ({ item }: { item: SabhaRecord }) => (
    <Card className={editingId === item.id ? "border-primary ring-1 ring-primary" : ""}>
      <CardContent className="p-4 flex items-center gap-4">
        {item.type === "upcoming"
          ? <Video className="h-8 w-8 text-primary flex-shrink-0" />
          : <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
        }
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{item.titleMr}</p>
          <p className="text-xs text-muted-foreground">{item.date} {item.time && `· ${item.time}`}</p>
          {item.videoUrl && <p className="text-xs text-primary truncate">{item.videoUrl}</p>}
          {item.minutesName && <p className="text-xs text-muted-foreground">{item.minutesName}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => toggleStatus(item)} className={`text-xs px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
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
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("लाईव्ह सभा व्यवस्थापन", "Live Sabha Management")}</h1>

      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("सभा संपादित करा", "Edit Sabha") : t("नवीन सभा जोडा", "Add Sabha")}
              {editingId && <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("प्रकार *", "Type *")}</label>
                  <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as SabhaType }))}>
                    <option value="upcoming">{t("आगामी", "Upcoming")}</option>
                    <option value="previous">{t("मागील", "Previous")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("तारीख *", "Date *")}</label>
                  <input type="date" required className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("वेळ", "Time")}</label>
                  <input type="time" className={inputCls} value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Title (English)</label>
                  <input className={inputCls} value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
                </div>
              </div>
              <AutoTranslateButton fields={[
                { value: form.titleEn, onTranslated: (v) => setForm((f) => ({ ...f, titleMr: v })) },
              ]} />
              <div>
                <label className="text-sm font-medium block mb-1">{t("शीर्षक (मराठी) *", "Title (Marathi) *")}</label>
                <input required className={inputCls} value={form.titleMr} onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))} />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("व्हिडिओ / लाईव्ह URL", "Video / Live URL")}</label>
                  <input className={inputCls} placeholder="https://youtube.com/..." value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("इतिवृत्त PDF", "Minutes PDF")}</label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => pdfRef.current?.click()}>
                      <FileText className="h-4 w-4 mr-1" />{t("PDF निवडा", "Choose PDF")}
                    </Button>
                    {form.minutesName && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{form.minutesName}</span>}
                    {form.minutesBase64 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, minutesBase64: "", minutesName: "" }))}>✕</Button>}
                  </div>
                  <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdf} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gov-gradient text-primary-foreground">
                  {saving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतन करा", "Update") : t("जोडा", "Add")}
                </Button>
                {editingId && <Button type="button" variant="outline" onClick={cancelEdit}>{t("रद्द करा", "Cancel")}</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-semibold mb-3">{t("आगामी सभा", "Upcoming Sabha")} ({upcoming.length})</h2>
        <div className="space-y-2">
          {upcoming.map((item) => <SabhaCard key={item.id} item={item} />)}
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">{t("कोणतीही आगामी सभा नाही.", "No upcoming sabhas.")}</p>}
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">{t("मागील सभा", "Previous Sabha")} ({previous.length})</h2>
        <div className="space-y-2">
          {previous.map((item) => <SabhaCard key={item.id} item={item} />)}
          {previous.length === 0 && <p className="text-sm text-muted-foreground">{t("कोणतीही मागील सभा नाही.", "No previous sabhas.")}</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminSabha;
