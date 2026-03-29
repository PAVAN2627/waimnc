import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ImageIcon, Pencil, X, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import AutoTranslateButton from "@/components/AutoTranslateButton";
import { subscribeToOfficials, createOfficial, deleteOfficial, updateOfficial, type OfficialRecord } from "@/lib/officials";

function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      const MAX = 400;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const c = document.createElement("canvas");
      c.width = width; c.height = height;
      c.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const WARDS = Array.from({ length: 17 }, (_, i) => String(i + 1));
const empty = { nameMr: "", nameEn: "", ward: "", party: "", phone: "", photoBase64: "", order: 1, status: "active" as const };

const AdminOfficials = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<OfficialRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToOfficials(setItems);
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await imageToBase64(file);
    setForm((f) => ({ ...f, photoBase64: base64 }));
    e.target.value = "";
  };

  const startEdit = (item: OfficialRecord) => {
    setEditingId(item.id);
    setForm({ nameMr: item.nameMr, nameEn: item.nameEn, ward: item.ward, party: item.party, phone: item.phone, photoBase64: item.photoBase64, order: item.order, status: item.status });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameMr) return;
    try {
      setSaving(true);
      if (editingId) {
        await updateOfficial(editingId, form);
        toast({ title: t("यशस्वी", "Success"), description: t("नगरसेवक अद्यतनित केला.", "Corporator updated.") });
        setEditingId(null);
      } else {
        await createOfficial(form);
        toast({ title: t("यशस्वी", "Success"), description: t("नगरसेवक जोडला.", "Corporator added.") });
      }
      setForm(empty);
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this corporator?"))) return;
    try {
      setDeleting(id);
      await deleteOfficial(id);
      if (editingId === id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const toggleStatus = (item: OfficialRecord) =>
    updateOfficial(item.id, { status: item.status === "active" ? "inactive" : "active" });

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("नगरसेवक व्यवस्थापन", "Corporators Management")}</h1>
      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("नगरसेवक संपादित करा", "Edit Corporator") : t("नवीन नगरसेवक जोडा", "Add Corporator")}
              {editingId && <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Name (English)</label>
                  <input className={inputCls} placeholder="Shri. Vijay Jadhav" value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
                </div>
                <div className="flex items-end pb-0.5">
                  <AutoTranslateButton fields={[{ value: form.nameEn, onTranslated: (v) => setForm((f) => ({ ...f, nameMr: v })) }]} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">{t("नाव (मराठी) *", "Name (Marathi) *")}</label>
                <input required className={inputCls} placeholder="श्री. विजय जाधव" value={form.nameMr} onChange={(e) => setForm((f) => ({ ...f, nameMr: e.target.value }))} />
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("वार्ड क्र.", "Ward No.")}</label>
                  <select className={inputCls} value={form.ward} onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}>
                    <option value="">{t("निवडा", "Select")}</option>
                    {WARDS.map((w) => <option key={w} value={w}>{t(`वार्ड ${w}`, `Ward ${w}`)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("पक्ष", "Party")}</label>
                  <input className={inputCls} placeholder="NCP / BJP / INC..." value={form.party} onChange={(e) => setForm((f) => ({ ...f, party: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("मोबाइल", "Phone")}</label>
                  <input className={inputCls} placeholder="98XXXXXXXX" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("क्रम", "Order")}</label>
                  <input type="number" min={1} className={inputCls} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("फोटो", "Photo")}</label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      <ImageIcon className="h-4 w-4 mr-1" />{t("फोटो निवडा", "Choose")}
                    </Button>
                    {form.photoBase64 && <img src={form.photoBase64} className="h-10 w-10 object-cover rounded-full border" />}
                    {form.photoBase64 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, photoBase64: "" }))}>✕</Button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
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

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.length === 0 && <p className="text-sm text-muted-foreground col-span-3">{t("कोणतेही नगरसेवक नाहीत.", "No corporators yet.")}</p>}
        {items.map((item) => (
          <Card key={item.id} className={editingId === item.id ? "border-primary ring-1 ring-primary" : ""}>
            <CardContent className="p-4 text-center space-y-1.5">
              {item.photoBase64
                ? <img src={item.photoBase64} className="w-20 h-20 object-cover rounded-full border-2 border-primary mx-auto mb-2" />
                : <div className="w-20 h-20 bg-muted rounded-full border-2 border-primary mx-auto mb-2 flex items-center justify-center text-3xl">👤</div>
              }
              <p className="font-semibold text-sm">{item.nameMr}</p>
              {item.nameEn && <p className="text-xs text-muted-foreground">{item.nameEn}</p>}
              {item.ward && <p className="text-xs text-primary font-medium">{t(`वार्ड ${item.ward}`, `Ward ${item.ward}`)}</p>}
              {item.party && <span className="inline-block text-xs bg-accent px-2 py-0.5 rounded-full">{item.party}</span>}
              {item.phone && <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Phone className="h-3 w-3" />{item.phone}</p>}
              <div className="flex items-center justify-center gap-2 pt-1">
                <button onClick={() => toggleStatus(item)} className={`text-xs px-2 py-0.5 rounded-full ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {item.status === "active" ? t("सक्रिय", "Active") : t("निष्क्रिय", "Inactive")}
                </button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(item)}>
                  <Pencil className="h-3.5 w-3.5 text-primary" />
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 w-7 p-0" disabled={deleting === item.id} onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOfficials;
