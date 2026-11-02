import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle, Clock, AlertTriangle, Eye, LoaderCircle,
  Download, FileText, Image as ImageIcon, Paperclip, Search, X, Trash2, RefreshCw,
  ExternalLink, FileCheck2, User, Phone, MapPin, Calendar, Building2, ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import FormattedDescription from "@/components/FormattedDescription";

import {
  subscribeToAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  formatComplaintDate,
  normalizeAttachment,
  getAttachmentUrl,
  isImageAttachment,
  isPdfAttachment,
  matchesEmployeeDepartment,
  type ComplaintRecord,
  type ComplaintStatus,
  type ComplaintAttachment,
} from "@/lib/complaints";
import { fetchAdminComplaints } from "@/lib/api";

const statusColors: Record<ComplaintStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusIcons: Record<ComplaintStatus, typeof Clock> = {
  pending: Clock,
  "in-progress": AlertTriangle,
  resolved: CheckCircle,
};

export default function AdminApplications() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState<ComplaintRecord[]>([]);
  const [selected, setSelected] = useState<ComplaintRecord | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    name: string;
    isImage: boolean;
    isPdf: boolean;
  } | null>(null);

  const isServiceRecord = (c: ComplaintRecord) => {
    const text = `${c.type} ${c.department} ${c.description}`.toLowerCase();
    return (
      text.includes("दाखला") ||
      text.includes("certificate") ||
      text.includes("परवानगी") ||
      text.includes("permit") ||
      text.includes("कर भरणा") ||
      text.includes("नळ जोडणी") ||
      text.includes("लोकसेवा") ||
      text.includes("योजना") ||
      text.includes("scheme") ||
      c.department === "लोकसेवा हक्क व दाखले कक्ष" ||
      c.department === "शासकीय योजना व उपक्रम"
    );
  };

  const reloadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const items = await fetchAdminComplaints();
      if (Array.isArray(items)) {
        const mapped = items
          .map((item: any) => ({
            id: item.id,
            trackingId: item.trackingId || `WMC-${item.id.slice(0, 6).toUpperCase()}`,
            name: item.name || "नागरिक",
            mobile: item.mobile || "",
            ward: item.ward || "1",
            type: item.type || "दाखला अर्ज",
            department: item.department || "लोकसेवा हक्क व दाखले कक्ष",
            description: item.description || "",
            attachments: Array.isArray(item.attachments) ? item.attachments.map(normalizeAttachment) : [],
            status: (item.status as ComplaintStatus) || "pending",
            createdAt: new Date(item.createdAt).getTime(),
            updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
          }))
          .filter(isServiceRecord);

        setApplications(mapped);
        setSelected((prev) => (prev ? mapped.find((c) => c.id === prev.id) ?? null : null));
      }
    } catch (err) {
      console.warn("Manual reload error:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToAllComplaints((data) => {
      const filtered = data.filter(isServiceRecord);
      setApplications(filtered);
      setSelected((prev) => (prev ? filtered.find((c) => c.id === prev.id) ?? null : null));
    });
    return () => unsubscribe();
  }, []);

  const statusLabel: Record<ComplaintStatus, string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("पडताळणी / कार्यवाही सुरू", "Under Verification"),
    resolved: t("मंजूर / पूर्ण झाले", "Approved / Completed"),
  };

  const changeStatus = async (id: string, status: ComplaintStatus) => {
    try {
      setUpdating(id);
      await updateComplaintStatus(id, status);
      setApplications((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status, updatedAt: Date.now() } : c))
      );
      setSelected((prev) =>
        prev && prev.id === id ? { ...prev, status, updatedAt: Date.now() } : prev
      );
      toast({
        title: t("यशस्वी", "Success"),
        description: t("अर्जाची स्थिती अद्यतनित केली.", "Application status updated."),
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

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t("हा सेवा अर्ज हटवायचा आहे का?", "Are you sure you want to delete this application?"))) return;
    try {
      setUpdating(id);
      await deleteComplaint(id);
      setApplications((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
      toast({
        title: t("हटवले", "Deleted"),
        description: t("अर्ज यशस्वीरित्या हटवला.", "Application deleted successfully."),
      });
    } catch {
      toast({
        title: t("त्रुटी", "Error"),
        description: t("अर्ज हटवता आला नाही.", "Failed to delete application."),
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleDownloadFile = async (e: React.MouseEvent, attachment: ComplaintAttachment) => {
    e.preventDefault();
    e.stopPropagation();
    const rawUrl = getAttachmentUrl(attachment);
    if (!rawUrl) return;

    const filename = attachment.name || "application-document";

    if (rawUrl.startsWith("data:")) {
      const a = document.createElement("a");
      a.href = rawUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }

    try {
      const downloadParam = rawUrl.includes("?")
        ? `${rawUrl}&download=1&filename=${encodeURIComponent(filename)}`
        : `${rawUrl}?download=1&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(downloadParam);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      console.warn("Direct blob download fallback:", err);
      window.open(rawUrl, "_blank");
    }
  };

  const handleViewFile = (e: React.MouseEvent, attachment: ComplaintAttachment) => {
    e.preventDefault();
    e.stopPropagation();
    const rawUrl = getAttachmentUrl(attachment);
    if (!rawUrl) return;
    if (rawUrl.includes("drive.google.com") || rawUrl.includes("docs.google.com")) {
      window.open(rawUrl, "_blank");
      return;
    }
    setPreviewAttachment({
      url: rawUrl,
      name: attachment.name || "कागदपत्र / पुरावा",
      isImage: isImageAttachment(attachment),
      isPdf: isPdfAttachment(attachment),
    });
  };

  const shortId = (id: string) => `TK-${id.slice(-6).toUpperCase()}`;

  const SERVICE_CATEGORIES = [
    { key: "all", labelMr: "सर्व अर्ज", labelEn: "All Applications" },
    { key: "birth", labelMr: "जन्म दाखला", labelEn: "Birth Certificate", match: "जन्म" },
    { key: "death", labelMr: "मृत्यू दाखला", labelEn: "Death Certificate", match: "मृत्यू" },
    { key: "permit", labelMr: "बांधकाम परवानगी", labelEn: "Building Permit", match: "बांधकाम" },
    { key: "water", labelMr: "पाणी नळ जोडणी", labelEn: "Water Tap Connection", match: "पाणी" },
    { key: "tax", labelMr: "मालमत्ता कर नोंद", labelEn: "Property Tax", match: "मालमत्ता" },
    { key: "scheme", labelMr: "शासकीय योजना", labelEn: "Schemes", match: "योजना" },
  ];

  const userDepts =
    user?.departments && user.departments.length > 0
      ? user.departments
      : user?.department
      ? user.department.split(",").map((d: string) => d.trim()).filter(Boolean)
      : [];

  const filtered = applications.filter((c) => {
    if (userDepts.length > 0 && !matchesEmployeeDepartment(c, userDepts)) return false;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.trackingId?.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q);

    const matchesWard = wardFilter === "all" || c.ward === wardFilter;

    let matchesCategory = true;
    if (serviceTypeFilter !== "all") {
      const cat = SERVICE_CATEGORIES.find((s) => s.key === serviceTypeFilter);
      if (cat && cat.match) {
        matchesCategory =
          c.type.toLowerCase().includes(cat.match) ||
          c.description.toLowerCase().includes(cat.match);
      }
    }

    return matchesSearch && matchesWard && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="gov-gradient rounded-3xl p-6 md:p-8 text-primary-foreground shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider border border-white/30">
                <FileCheck2 className="w-3.5 h-3.5" />
                {t("लोकसेवा हक्क व दाखले कक्ष", "Citizen Service Applications")}
              </span>
              {userDepts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black shadow-md border border-amber-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t(`आपले विभाग: ${userDepts.join(", ")}`, `Departments: ${userDepts.join(", ")}`)}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-200 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                ● {t("थेट अपडेट सक्रिय (Live)", "Live Sync Active")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {t("दाखले व सेवा अर्ज व्यवस्थापन", "Certificate & Service Applications Management")}
            </h1>
            <p className="text-primary-foreground/90 text-xs sm:text-sm mt-1 max-w-2xl">
              {t(
                "नागरिकांनी ऑनलाइन सादर केलेले जन्म/मृत्यू दाखले, बांधकाम परवानगी, नळ जोडणी, मालमत्ता कर व योजना अर्ज.",
                "Review and process citizen applications for birth/death certificates, permits, tap connections, and schemes."
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={reloadData}
              disabled={refreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/40 font-bold rounded-2xl gap-2 shadow-lg backdrop-blur-md"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span>{t("ताजे करा", "Refresh")}</span>
            </Button>
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl shadow-xl flex-shrink-0">
              📋
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <Card className="rounded-2xl border-border shadow-sm">
          <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <FileCheck2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black font-mono">{applications.length}</p>
              <p className="text-[11px] sm:text-xs font-bold text-muted-foreground truncate">{t("एकूण प्राप्त अर्ज", "Total Applications")}</p>
            </div>
          </CardContent>
        </Card>

        {(["pending", "in-progress", "resolved"] as const).map((status) => {
          const count = applications.filter((c) => c.status === status).length;
          const Icon = statusIcons[status];
          return (
            <Card key={status} className="rounded-2xl border-border shadow-sm">
              <CardContent className="p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
                <div
                  className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${
                    status === "pending"
                      ? "bg-yellow-500/10 text-yellow-600"
                      : status === "in-progress"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-black font-mono">{count}</p>
                  <p className="text-[11px] sm:text-xs font-bold text-muted-foreground truncate">{statusLabel[status]}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SERVICE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setServiceTypeFilter(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-sm ${
              serviceTypeFilter === cat.key
                ? "gov-gradient text-white shadow-md scale-105"
                : "bg-card text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            {t(cat.labelMr, cat.labelEn)}
          </button>
        ))}
      </div>

      {/* Search + Ward Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-9 rounded-xl"
            placeholder={t("ट्रॅकिंग ID, अर्जदार नाव, मोबाइल शोधा...", "Search by Tracking ID, applicant name, mobile...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="border rounded-xl px-3 py-2 text-xs font-bold bg-background focus:ring-2 focus:ring-ring focus:outline-none"
        >
          <option value="all">{t("सर्व प्रभाग / वार्ड", "All Wards")}</option>
          {Array.from({ length: 17 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={String(w)}>
              {t(`प्रभाग क्र. ${w}`, `Ward ${w}`)}
            </option>
          ))}
        </select>
        {(search || wardFilter !== "all" || serviceTypeFilter !== "all") && (
          <span className="text-xs font-bold text-muted-foreground">
            {filtered.length} {t("अर्ज सापडले", "applications found")}
          </span>
        )}
      </div>

      {/* Main Split Layout: List & Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground rounded-2xl">
              <FileCheck2 className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-bold text-sm">{t("कोणतेही अर्ज सापडले नाहीत.", "No applications found.")}</p>
            </Card>
          ) : (
            filtered.map((c) => (
              <Card
                key={c.id}
                className={`cursor-pointer transition-all rounded-2xl border ${
                  selected?.id === c.id ? "ring-2 ring-primary border-primary shadow-lg bg-primary/5" : "hover:shadow-md"
                }`}
                onClick={() => setSelected(c)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                        {c.trackingId || shortId(c.id)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {c.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${statusColors[c.status]}`}>
                        {statusLabel[c.status]}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive rounded-lg"
                        title={t("अर्ज हटवा", "Delete")}
                        disabled={updating === c.id}
                        onClick={(e) => handleDelete(e, c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap font-medium">
                    <span className="font-bold text-foreground">{c.name}</span>
                    <span>·</span>
                    <span>{c.mobile}</span>
                    <span>·</span>
                    <span>{c.ward ? t(`वार्ड ${c.ward}`, `Ward ${c.ward}`) : "—"}</span>
                    <span>·</span>
                    <span>{formatComplaintDate(c.createdAt, lang)}</span>
                  </p>

                  {c.attachments.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                      <Paperclip className="h-3.5 w-3.5" />
                      <span>{c.attachments.length} {t("कागदपत्रे जोडली आहेत", "documents attached")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Details Panel */}
        {selected && (
          <Card className="sticky top-4 rounded-3xl border border-border shadow-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/40 border-b border-border">
              <CardTitle className="text-base font-black flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" />
                <span>{selected.trackingId || shortId(selected.id)} — {selected.type}</span>
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full"
                onClick={() => setSelected(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* Applicant Header Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-2xl border border-border">
                <div>
                  <span className="text-muted-foreground font-semibold">{t("अर्जदार नाव", "Applicant Name")}:</span>
                  <p className="font-extrabold text-foreground text-sm mt-0.5">{selected.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">{t("मोबाइल नंबर", "Mobile")}:</span>
                  <p className="font-mono font-bold text-foreground text-sm mt-0.5">{selected.mobile}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">{t("प्रभाग / वार्ड", "Ward No.")}:</span>
                  <p className="font-bold text-foreground mt-0.5">{selected.ward ? t(`प्रभाग क्र. ${selected.ward}`, `Ward ${selected.ward}`) : "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground font-semibold">{t("सादर दिनांक", "Submission Date")}:</span>
                  <p className="font-bold text-foreground mt-0.5">{formatComplaintDate(selected.createdAt, lang)}</p>
                </div>
              </div>

              {/* FORMATTED DESCRIPTION: EVERY FIELD ON ITS OWN LINE WITH CLEAN CARDS */}
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {t("अर्जाचा सविस्तर तपशील (Application Specifications)", "Detailed Specifications")}
                </span>
                <FormattedDescription description={selected.description} />
              </div>

              {/* ATTACHED DOCUMENTS & PHOTOS */}
              {selected.attachments.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Paperclip className="h-4 w-4 text-primary" />
                      {t("जोडलेली कागदपत्रे व छायाचित्रे", "Attached Verification Documents")} ({selected.attachments.length})
                    </span>
                  </div>

                  {/* Thumbnail Cards for Images */}
                  {selected.attachments.some(isImageAttachment) && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {selected.attachments.filter(isImageAttachment).map((att, idx) => {
                        const fileUrl = getAttachmentUrl(att);
                        return (
                          <div
                            key={idx}
                            className="group relative rounded-xl overflow-hidden border border-border bg-muted/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="w-full h-28 relative overflow-hidden bg-black/5 flex items-center justify-center">
                              <img
                                src={fileUrl}
                                alt={att.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 px-2 text-xs font-bold gap-1 rounded-lg"
                                  onClick={(e) => handleViewFile(e, att)}
                                  title={t("मोठे करून पहा", "Preview")}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{t("पहा", "View")}</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-7 px-2 text-xs font-bold gap-1 rounded-lg"
                                  onClick={(e) => handleDownloadFile(e, att)}
                                  title={t("डाउनलोड", "Download")}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-1.5 px-2 bg-card/90 backdrop-blur-sm border-t border-border/50 text-[11px] truncate font-medium text-foreground">
                              {att.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Complete List of all files with View & Download */}
                  <div className="space-y-2">
                    {selected.attachments.map((att, idx) => {
                      const isImg = isImageAttachment(att);
                      const isPdf = isPdfAttachment(att);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            {isImg ? (
                              <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                            ) : isPdf ? (
                              <FileText className="h-4 w-4 text-destructive flex-shrink-0" />
                            ) : (
                              <Paperclip className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-foreground truncate">{att.name}</p>
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {isImg ? t("छायाचित्र (Image)", "Image") : isPdf ? "PDF दस्तऐवज" : t("कागदपत्र", "Document")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs font-bold gap-1 rounded-lg hover:bg-primary hover:text-white"
                              onClick={(e) => handleViewFile(e, att)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{t("पहा", "View")}</span>
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs font-bold gap-1 rounded-lg hover:bg-primary hover:text-white"
                              onClick={(e) => handleDownloadFile(e, att)}
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{t("डाउनलोड", "Download")}</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="flex gap-2 flex-wrap items-center pt-3 border-t border-border">
                <Button
                  size="sm"
                  variant={selected.status === "pending" ? "default" : "outline"}
                  className={selected.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl" : "border-yellow-400 text-yellow-700 hover:bg-yellow-50 rounded-xl"}
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "pending")}
                >
                  {updating === selected.id && <LoaderCircle className="h-3 w-3 animate-spin mr-1" />}
                  {t("प्रलंबित", "Pending")}
                </Button>
                <Button
                  size="sm"
                  variant={selected.status === "in-progress" ? "default" : "outline"}
                  className={selected.status === "in-progress" ? "bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl" : "border-blue-400 text-blue-700 hover:bg-blue-50 rounded-xl"}
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "in-progress")}
                >
                  {t("पडताळणी सुरू", "In Progress")}
                </Button>
                <Button
                  size="sm"
                  variant={selected.status === "resolved" ? "default" : "outline"}
                  className={selected.status === "resolved" ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl" : "border-emerald-500 text-emerald-700 hover:bg-emerald-50 rounded-xl"}
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "resolved")}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  {t("मंजूर / पूर्ण", "Approve / Resolve")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-auto rounded-xl"
                  disabled={updating === selected.id}
                  onClick={(e) => handleDelete(e, selected.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {t("हटवा", "Delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-3xl max-w-4xl w-full border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-muted/40 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Eye className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="font-extrabold text-sm text-foreground truncate">{previewAttachment.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold gap-1"
                  asChild
                >
                  <a href={previewAttachment.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t("नवीन टॅबमध्ये उघडा", "Open in New Tab")}</span>
                  </a>
                </Button>
                <Button
                  size="sm"
                  className="gov-gradient text-white rounded-xl text-xs font-bold gap-1"
                  onClick={(e) => handleDownloadFile(e, { name: previewAttachment.name, url: previewAttachment.url } as any)}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t("डाउनलोड", "Download")}</span>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full h-8 w-8 hover:bg-muted"
                  onClick={() => setPreviewAttachment(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/10 dark:bg-black/40">
              {previewAttachment.isImage ? (
                <img
                  src={previewAttachment.url}
                  alt={previewAttachment.name}
                  className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-border/40"
                />
              ) : previewAttachment.isPdf ? (
                <iframe
                  src={previewAttachment.url}
                  title={previewAttachment.name}
                  className="w-full h-[75vh] rounded-xl border border-border"
                />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <FileText className="w-16 h-16 text-primary mx-auto" />
                  <p className="text-sm font-bold">{previewAttachment.name}</p>
                  <Button asChild className="gov-gradient text-white rounded-xl font-bold">
                    <a href={previewAttachment.url} target="_blank" rel="noopener noreferrer">
                      {t("फाइल उघडा / डाउनलोड करा", "Open / Download File")}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

