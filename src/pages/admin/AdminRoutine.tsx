import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Calendar, ImageIcon, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import {
  subscribeToRoutine, createRoutine, deleteRoutine, updateRoutine,
  type RoutineRecord,
} from "@/lib/routine";

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

const empty = { date: "", titleMr: "", titleEn: "", descMr: "", descEn: "", imageBase64: "", status: "active" as const };

const AdminRoutine = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<RoutineRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToRoutine(setItems);
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" }); return; }
    const b64 = await imageToBase64(file);
    setForm((f) => ({ ...f, imageBase64: b64 }));
    e.target.value = "";
  };

  const startEdit = (item: RoutineRecord) => {
    setEditingId(item.id);
    setForm({ date: item.date, titleMr: item.titleMr, titleEn: item.titleEn, descMr: item.descMr, descEn: item.descEn, imageBase64: item.imageBase64, status: item.status });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.titleMr) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateRoutine(editingId, form);
        toast({ title: t("यशस्वी", "Success"), description: t("दिनक्रम अद्यतनित केला.", "Entry updated.") });
        setEditingId(null);
      } else {
        await createRoutine(form);
        toast({ title: t("यशस्वी", "Success"), description: t("दिनक्रम जोडला.", "Entry added.") });
      }
      setForm(empty);
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this entry?"))) return;
    try {
      setDeleting(id);
      await deleteRoutine(id);
      if (editingId === id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const toggleStatus = (item: RoutineRecord) =>
    updateRoutine(item.id, { status: item.status === "active" ? "inactive" : "active" });

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("दिनक्रम व्यवस्थापन", "Routine Management")}</h1>

      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("दिनक्रम संपादित करा", "Edit Entry") : t("नवीन दिनक्रम जोडा", "Add New Entry")}
              {editingId && <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("तारीख *", "Date *")}</label>
                  <input type="date" required className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("स्थिती", "Status")}</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "active" | "inactive" }))}>
                    <option value="active">{t("सक्रिय", "Active")}</option>
                    <option value="inactive">{t("निष्क्रिय", "Inactive")}</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">{t("शीर्षक (मराठी) *", "Title (Marathi) *")}</label>
                    <AutoTranslateButton sourceValue={form.titleEn} onTranslated={(v) => setForm((f) => ({ ...f, titleMr: v }))} />
                  </div>
                  <input required className={inputCls} value={form.titleMr} onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("शीर्षक (इंग्रजी)", "Title (English)")}</label>
                  <input className={inputCls} value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">{t("वर्णन (मराठी)", "Description (Marathi)")}</label>
                    <AutoTranslateButton sourceValue={form.descEn} onTranslated={(v) => setForm((f) => ({ ...f, descMr: v }))} />
                  </div>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.descMr} onChange={(e) => setForm((f) => ({ ...f, descMr: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("वर्णन (इंग्रजी)", "Description (English)")}</label>
                  <textarea rows={3} className={inputCls + " resize-none"} value={form.descEn} onChange={(e) => setForm((f) => ({ ...f, descEn: e.target.value }))} />
                </div>
              </div>
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
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="gov-gradient text-primary-foreground">
                  {saving ? t("जतन करत आहे...", "Saving...") : editingId ? t("अद्यतन करा", "Update") : t("जोडा", "Add Entry")}
                </Button>
                {editingId && <Button type="button" variant="outline" onClick={cancelEdit}>{t("रद्द करा", "Cancel")}</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">{t("कोणतेही दिनक्रम नाहीत.", "No routine entries yet.")}</p>}
        {items.map((item) => (
          <Card key={item.id} className={editingId === item.id ? "border-primary" : ""}>
            <CardContent className="p-4 flex items-start gap-4">
              {item.imageBase64
                ? <img src={item.imageBase64} className="w-20 h-16 object-cover rounded flex-shrink-0" />
                : <div className="w-20 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0"><Calendar className="h-6 w-6 text-muted-foreground" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{item.date}</p>
                <p className="font-semibold text-sm">{item.titleMr}</p>
                {item.titleEn && <p className="text-xs text-muted-foreground">{item.titleEn}</p>}
                {item.descMr && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.descMr}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleStatus(item)} className={`text-xs px-2 py-1 rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
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

export default AdminRoutine;
