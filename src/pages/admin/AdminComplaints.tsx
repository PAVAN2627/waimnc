import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle, Clock, AlertTriangle, Eye, LoaderCircle,
  Download, FileText, Image as ImageIcon, Paperclip, Search, X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  subscribeToAllComplaints,
  updateComplaintStatus,
  formatComplaintDate,
  type ComplaintRecord,
  type ComplaintStatus,
} from "@/lib/complaints";

const statusColors: Record<ComplaintStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  "in-progress": "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

const statusIcons: Record<ComplaintStatus, typeof Clock> = {
  pending: Clock,
  "in-progress": AlertTriangle,
  resolved: CheckCircle,
};

const AdminComplaints = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [selected, setSelected] = useState<ComplaintRecord | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState<string>("all");

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = subscribeToAllComplaints((data) => {
      setComplaints(data);
      setSelected((prev) => (prev ? data.find((c) => c.id === prev.id) ?? null : null));
    });
    return () => unsubscribe();
  }, []);

  const statusLabel: Record<ComplaintStatus, string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण", "Resolved"),
  };

  const changeStatus = async (id: string, status: ComplaintStatus) => {
    try {
      setUpdating(id);
      await updateComplaintStatus(id, status);
      toast({
        title: t("यशस्वी", "Success"),
        description: t("स्थिती अद्यतनित केली.", "Status updated."),
      });
    } catch {
      toast({
        title: t("त्रुटी", "Error"),
        description: t("स्थिती बदलता आली नाही.", "Failed to update status."),
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const shortId = (id: string) => `TK-${id.slice(-6).toUpperCase()}`;

  const filtered = complaints.filter((c) => {
    if (wardFilter !== "all" && c.ward !== wardFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      shortId(c.id).toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.ward && `ward ${c.ward}`.includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-devanagari">
      
      {/* Hero Banner Header */}
      <div className="gov-gradient rounded-3xl p-8 text-primary-foreground shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
              <Clock className="w-3.5 h-3.5" />
              {t("नागरी निवारण कक्ष", "Civic Grievance Redressal")}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white">{t("तक्रार व्यवस्थापन", "Complaint Management")}</h1>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1">
              {t("नागरिकांच्या तक्रारींचे प्रभागवार निवारण, थेट स्थिती अद्यतन व पाठपुरावा.", "Track, assign, and resolve citizen grievances in real-time.")}
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-xl flex-shrink-0">
            📝
          </div>
        </div>
      </div>

      {!isFirebaseConfigured && (
        <p className="text-sm text-muted-foreground">
          {t(
            "तक्रारी दाखवण्यासाठी Firebase configure करा.",
            "Configure Firebase to load complaints."
          )}
        </p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {(["pending", "in-progress", "resolved"] as const).map((status) => {
          const count = complaints.filter((c) => c.status === status).length;
          const Icon = statusIcons[status];
          return (
            <Card key={status}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon
                  className={`h-8 w-8 ${
                    status === "pending"
                      ? "text-yellow-600"
                      : status === "in-progress"
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                />
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{statusLabel[status]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {complaints.length === 0 && isFirebaseConfigured && (
        <p className="text-sm text-muted-foreground">
          {t("सध्या कोणत्याही तक्रारी नाहीत.", "No complaints available yet.")}
        </p>
      )}

      {/* Search + Ward Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder={t("ट्रॅकिंग ID, नाव, मोबाइल शोधा...", "Search by Tracking ID, name, mobile...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setSearch("")}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="all">{t("सर्व वार्ड", "All Wards")}</option>
          {Array.from({ length: 17 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={String(w)}>
              {t(`वार्ड ${w}`, `Ward ${w}`)}
            </option>
          ))}
        </select>
      </div>
      {(search || wardFilter !== "all") && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} {t("तक्रारी सापडल्या", "complaints found")}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className={`cursor-pointer transition-all ${
                selected?.id === c.id ? "ring-2 ring-primary" : "hover:shadow-md"
              }`}
              onClick={() => setSelected(c)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {shortId(c.id)}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status]}`}
                  >
                    {statusLabel[c.status]}
                  </span>
                </div>
                <p className="font-medium text-sm line-clamp-2">{c.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {c.name} · {c.ward ? t(`वार्ड ${c.ward}`, `Ward ${c.ward}`) + " · " : ""}{formatComplaintDate(c.createdAt, lang)}
                </p>
                {c.attachments.length > 0 && (
                  <p className="text-xs text-primary mt-1 inline-flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {c.attachments.length} {t("संलग्नक", "attachments")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {selected && (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                {t("तक्रार तपशील", "Complaint Details")} — {shortId(selected.id)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("नाव", "Name")}:</span>
                  <br />
                  {selected.name}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("मोबाइल", "Mobile")}:</span>
                  <br />
                  {selected.mobile}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("वार्ड क्र.", "Ward No.")}:</span>
                  <br />
                  {selected.ward ? t(`वार्ड ${selected.ward}`, `Ward ${selected.ward}`) : "—"}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("प्रकार", "Type")}:</span>
                  <br />
                  {selected.type}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("विभाग", "Department")}:</span>
                  <br />
                  {selected.department}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("तारीख", "Date")}:</span>
                  <br />
                  {formatComplaintDate(selected.createdAt, lang)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">{t("वर्णन", "Description")}:</span>
                <p className="mt-1">{selected.description}</p>
              </div>
              {selected.attachments.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">{t("संलग्नक", "Attachments")}</p>

                  {selected.attachments.some((attachment) => attachment.type === "image") && (
                    <div className="grid grid-cols-2 gap-2">
                      {selected.attachments
                        .filter((attachment) => attachment.type === "image")
                        .map((attachment) => (
                          <a
                            key={attachment.name}
                            href={attachment.base64}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border rounded-lg overflow-hidden block"
                          >
                            <img
                              src={attachment.base64}
                              alt={attachment.name}
                              className="w-full h-24 object-cover"
                              loading="lazy"
                            />
                          </a>
                        ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    {selected.attachments.map((attachment) => (
                      <a
                        key={attachment.name}
                        href={attachment.base64}
                        className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm hover:bg-muted/40"
                        download={attachment.name}
                      >
                        <span className="inline-flex items-center gap-2 truncate">
                          {attachment.type === "image" ? (
                            <ImageIcon className="h-4 w-4 flex-shrink-0 text-primary" />
                          ) : attachment.type === "pdf" ? (
                            <FileText className="h-4 w-4 flex-shrink-0 text-destructive" />
                          ) : (
                            <Paperclip className="h-4 w-4 flex-shrink-0 text-primary" />
                          )}
                          <span className="truncate">{attachment.name}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Download className="h-4 w-4" />
                          {t("डाउनलोड", "Download")}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700"
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "pending")}
                >
                  {updating === selected.id && (
                    <LoaderCircle className="h-3 w-3 animate-spin mr-1" />
                  )}
                  {t("प्रलंबित", "Pending")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-300 text-blue-700"
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "in-progress")}
                >
                  {t("कार्यवाही सुरू", "In Progress")}
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 text-primary-foreground hover:bg-green-700"
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "resolved")}
                >
                  {t("निराकरण", "Resolved")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
