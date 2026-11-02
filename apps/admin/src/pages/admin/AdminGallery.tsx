import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ImageIcon, Play, Pencil, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { uploadMedia } from "@/lib/api";
import {
  subscribeToGallery, createGalleryItem, deleteGalleryItem, updateGalleryItem,
  type GalleryRecord, type GalleryItemType,
} from "@/lib/gallery";

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

const empty = { type: "photo" as GalleryItemType, titleMr: "", titleEn: "", date: "", imageBase64: "", videoUrl: "", status: "active" as const };

const AdminGallery = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [items, setItems] = useState<GalleryRecord[]>([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
        return subscribeToGallery(setItems);
  }, []);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "File too large", description: "Max 5 MB", variant: "destructive" }); return; }
    try {
      setSaving(true);
      const res = await uploadMedia(file, "gallery");
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

  const startEdit = (item: GalleryRecord) => {
    setEditingId(item.id);
    setForm({ type: item.type, titleMr: item.titleMr, titleEn: item.titleEn, date: item.date, imageBase64: item.imageBase64, videoUrl: item.videoUrl, status: item.status });
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const cancelEdit = () => { setEditingId(null); setForm(empty); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleMr) return;
    if (form.type === "photo" && !form.imageBase64) { toast({ title: t("फोटो निवडा", "Choose a photo"), variant: "destructive" }); return; }
    if (form.type === "video" && !form.videoUrl) { toast({ title: t("व्हिडिओ URL द्या", "Enter video URL"), variant: "destructive" }); return; }
    try {
      setSaving(true);
      if (editingId) {
        await updateGalleryItem(editingId, form);
        setItems((prev) =>
          prev.map((g) => (g.id === editingId ? { ...g, ...form } : g))
        );
        toast({ title: t("यशस्वी", "Success"), description: t("आयटम अद्यतनित केला.", "Item updated.") });
        setEditingId(null);
      } else {
        const created = await createGalleryItem(form);
        setItems((prev) => [created, ...prev]);
        toast({ title: t("यशस्वी", "Success"), description: t("आयटम जोडला.", "Item added.") });
      }
      setForm(empty);
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("हे हटवायचे आहे का?", "Delete this item?"))) return;
    try {
      setDeleting(id);
      await deleteGalleryItem(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
      if (editingId === id) cancelEdit();
      toast({ title: t("हटवले", "Deleted") });
    } catch {
      toast({ title: t("त्रुटी", "Error"), variant: "destructive" });
    } finally { setDeleting(null); }
  };

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none";
  const photos = items.filter((i) => i.type === "photo");
  const videos = items.filter((i) => i.type === "video");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("गॅलरी व्यवस्थापन", "Gallery Management")}</h1>

      <div ref={formRef}>
        <Card className={editingId ? "border-primary ring-1 ring-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4" />}
              {editingId ? t("आयटम संपादित करा", "Edit Item") : t("नवीन आयटम जोडा", "Add Item")}
              {editingId && <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("प्रकार *", "Type *")}</label>
                  <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as GalleryItemType, imageBase64: "", videoUrl: "" }))}>
                    <option value="photo">{t("📷 फोटो", "📷 Photo")}</option>
                    <option value="video">{t("🎥 व्हिडिओ", "🎥 Video")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("शीर्षक (मराठी) *", "Title (Marathi) *")}</label>
                  <input required className={inputCls} value={form.titleMr} onChange={(e) => setForm((f) => ({ ...f, titleMr: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">{t("शीर्षक (इंग्रजी)", "Title (English)")}</label>
                  <input className={inputCls} value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">{t("तारीख", "Date")}</label>
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
              </div>

              {form.type === "photo" && (
                <div>
                  <label className="text-sm font-medium block mb-1">{t("फोटो *", "Photo *")}</label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                      <ImageIcon className="h-4 w-4 mr-1" />{t("फोटो निवडा", "Choose Photo")}
                    </Button>
                    {form.imageBase64 && <img src={form.imageBase64} className="h-12 w-20 object-cover rounded border" />}
                    {form.imageBase64 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, imageBase64: "" }))}>✕</Button>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
              )}

              {form.type === "video" && (
                <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                  <p className="text-sm font-medium text-primary">{t("🎥 व्हिडिओ माहिती", "🎥 Video Details")}</p>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t("YouTube / व्हिडिओ URL *", "YouTube / Video URL *")}</label>
                    <input className={inputCls} placeholder="https://www.youtube.com/watch?v=..." value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
                    <p className="text-xs text-muted-foreground mt-1">{t("YouTube, Vimeo किंवा कोणताही व्हिडिओ लिंक", "YouTube, Vimeo or any video link")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">{t("थंबनेल (ऐच्छिक)", "Thumbnail (optional)")}</label>
                    <div className="flex items-center gap-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                        <ImageIcon className="h-4 w-4 mr-1" />{t("थंबनेल निवडा", "Choose Thumbnail")}
                      </Button>
                      {form.imageBase64 && <img src={form.imageBase64} className="h-12 w-20 object-cover rounded border" />}
                      {form.imageBase64 && <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, imageBase64: "" }))}>✕</Button>}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                  </div>
                </div>
              )}

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

      {/* Photos */}
      <div>
        <h2 className="font-semibold mb-3">{t("फोटो", "Photos")} ({photos.length})</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${editingId === item.id ? "border-primary ring-1 ring-primary" : ""}`}>
              <div className="aspect-video relative">
                {item.imageBase64
                  ? <img src={item.imageBase64} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-muted flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
                }
                <div className="absolute top-1 right-1 flex gap-1">
                  <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={() => startEdit(item)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" className="h-6 w-6 p-0" disabled={deleting === item.id} onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{item.titleMr}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 className="font-semibold mb-3">{t("व्हिडिओ", "Videos")} ({videos.length})</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {videos.map((item) => (
            <Card key={item.id} className={`overflow-hidden ${editingId === item.id ? "border-primary ring-1 ring-primary" : ""}`}>
              <div className="aspect-video relative bg-muted flex items-center justify-center">
                {item.imageBase64
                  ? <img src={item.imageBase64} className="w-full h-full object-cover" />
                  : <div className="w-14 h-14 rounded-full bg-primary/80 flex items-center justify-center"><Play className="w-6 h-6 text-primary-foreground ml-1" /></div>
                }
                <div className="absolute top-1 right-1 flex gap-1">
                  <Button size="sm" variant="secondary" className="h-6 w-6 p-0" onClick={() => startEdit(item)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="destructive" className="h-6 w-6 p-0" disabled={deleting === item.id} onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{item.titleMr}</p>
                <p className="text-xs text-muted-foreground truncate">{item.videoUrl}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
