import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle, Clock, AlertTriangle, Eye, LoaderCircle,
  Download, FileText, Image as ImageIcon, Paperclip, Search, X, Trash2, RefreshCw, ExternalLink, ZoomIn, FileCheck2, Building2
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
  isCivicComplaintRecord,
  isServiceApplicationRecord,
  type ComplaintRecord,
  type ComplaintStatus,
  type ComplaintAttachment,
} from "@/lib/complaints";
import { fetchAdminComplaints, uploadMedia } from "@/lib/api";

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
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [selected, setSelected] = useState<ComplaintRecord | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [targetResolveComplaint, setTargetResolveComplaint] = useState<ComplaintRecord | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofNotes, setProofNotes] = useState<string>("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [wardFilter, setWardFilter] = useState<string>("all");
  const [tabFilter, setTabFilter] = useState<"all" | "pending" | "in-progress" | "resolved">("all");
  const [previewAttachment, setPreviewAttachment] = useState<{
    url: string;
    name: string;
    isImage: boolean;
    isPdf: boolean;
  } | null>(null);

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
            type: item.type || "general",
            department: item.department || "सामान्य प्रशासन",
            description: item.description || "",
            attachments: Array.isArray(item.attachments) ? item.attachments.map(normalizeAttachment) : [],
            status: (item.status as ComplaintStatus) || "pending",
            createdAt: new Date(item.createdAt).getTime(),
            updatedAt: new Date(item.updatedAt || item.createdAt).getTime(),
          }))
          .filter(isCivicComplaintRecord);
        setComplaints(mapped);
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
      const onlyCivic = data.filter(isCivicComplaintRecord);
      setComplaints(onlyCivic);
      setSelected((prev) => (prev ? onlyCivic.find((c) => c.id === prev.id) ?? null : null));
    });
    return () => unsubscribe();
  }, []);

  const statusLabel: Record<ComplaintStatus, string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण", "Resolved"),
  };

  const changeStatus = async (
    id: string,
    status: ComplaintStatus,
    resolutionProofUrl?: string,
    resolutionProofNotes?: string
  ) => {
    try {
      setUpdating(id);
      await updateComplaintStatus(id, status, resolutionProofUrl, resolutionProofNotes);
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status,
                updatedAt: Date.now(),
                resolutionProof: resolutionProofUrl
                  ? {
                      url: resolutionProofUrl,
                      notes: resolutionProofNotes,
                      resolvedAt: new Date().toISOString(),
                    }
                  : c.resolutionProof,
              }
            : c
        )
      );
      setSelected((prev) =>
        prev && prev.id === id
          ? {
              ...prev,
              status,
              updatedAt: Date.now(),
              resolutionProof: resolutionProofUrl
                ? {
                    url: resolutionProofUrl,
                    notes: resolutionProofNotes,
                    resolvedAt: new Date().toISOString(),
                  }
                : prev.resolutionProof,
            }
          : prev
      );
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

  const handleOpenResolveModal = (c: ComplaintRecord) => {
    setTargetResolveComplaint(c);
    setProofFile(null);
    setProofPreview(c.resolutionProof?.url || null);
    setProofNotes(c.resolutionProof?.notes || "");
    setResolveModalOpen(true);
  };

  const handleConfirmResolve = async () => {
    if (!targetResolveComplaint) return;
    try {
      setUploadingProof(true);
      let proofUrl = targetResolveComplaint.resolutionProof?.url;
      if (proofFile) {
        const uploadRes = await uploadMedia(proofFile, "grievances");
        proofUrl = uploadRes.url;
      }
      await changeStatus(targetResolveComplaint.id, "resolved", proofUrl, proofNotes);
      setResolveModalOpen(false);
      setProofFile(null);
      setProofPreview(null);
      setProofNotes("");
      setTargetResolveComplaint(null);
    } catch (err) {
      console.error("Resolution update error:", err);
      toast({
        title: t("त्रुटी", "Error"),
        description: t("फोटो अपलोड किंवा स्थिती बदलण्यात त्रुटी आली.", "Failed to upload proof or update status."),
        variant: "destructive",
      });
    } finally {
      setUploadingProof(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm(t("ही तक्रार हटवायची आहे का?", "Are you sure you want to delete this complaint?"))) return;
    try {
      setUpdating(id);
      await deleteComplaint(id);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      setSelected((prev) => (prev?.id === id ? null : prev));
      toast({
        title: t("हटवले", "Deleted"),
        description: t("तक्रार यशस्वीरित्या हटवली.", "Complaint deleted successfully."),
      });
    } catch {
      toast({
        title: t("त्रुटी", "Error"),
        description: t("तक्रार हटवता आली नाही.", "Failed to delete complaint."),
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const shortId = (id: string) => `TK-${id.slice(-6).toUpperCase()}`;

  const isServiceApplication = (c: ComplaintRecord) => {
    const text = `${c.type} ${c.department} ${c.description}`.toLowerCase();
    return (
      text.includes("दाखला") ||
      text.includes("certificate") ||
      text.includes("परवानगी") ||
      text.includes("permit") ||
      text.includes("कर भरणा") ||
      text.includes("नळ जोडणी") ||
      text.includes("लोकसेवा") ||
      c.department === "लोकसेवा हक्क व दाखले"
    );
  };

  const handleDownloadFile = async (e: React.MouseEvent, attachment: ComplaintAttachment) => {
    e.preventDefault();
    e.stopPropagation();
    const rawUrl = getAttachmentUrl(attachment);
    if (!rawUrl) return;

    const filename = attachment.name || "attachment";

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

  const filtered = complaints.filter((c) => {
    if (tabFilter !== "all" && c.status !== tabFilter) return false;
    if (wardFilter !== "all" && c.ward !== wardFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const tId = (c.trackingId || "").toLowerCase();
    return (
      tId.includes(q) ||
      shortId(c.id).toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.type.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      (c.ward && `ward ${c.ward}`.includes(q)) ||
      c.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 font-devanagari">
      
      {/* Hero Banner Header */}
      <div className="gov-gradient rounded-3xl p-5 sm:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/30">
                <Clock className="w-3.5 h-3.5" />
                {t("नागरी निवारण कक्ष", "Civic Grievance Redressal")}
              </span>
              {user?.role === "DEPT_OFFICER" && user.department && (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black shadow-md border border-amber-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t(`आपला विभाग: ${user.department}`, `Department: ${user.department}`)}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-white text-xs font-bold border border-emerald-400/40 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                {t("थेट अपडेट सक्रिय (Live)", "Live Sync Active")}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{t("नागरी तक्रार व्यवस्थापन कक्ष", "Civic Grievance Management Desk")}</h1>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1">
              {t("पाणी, रस्ते, स्वच्छता, पथदिवे, सांडपाणी इत्यादी नागरी तक्रारींचे थेट प्रभागवार निवारण.", "Real-time tracking, assignment & resolution of citizen civic complaints.")}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="bg-white/20 hover:bg-white/30 text-white border-white/40 font-bold rounded-2xl gap-2 shadow-lg backdrop-blur-md"
            >
              <Link to="/applications">
                <FileCheck2 className="w-4 h-4" />
                <span>{t("दाखले व सेवा अर्ज पहा →", "View Applications →")}</span>
              </Link>
            </Button>
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
          </div>
        </div>
      </div>

      {/* Category Tabs: Status Filters for Civic Complaints */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setTabFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            tabFilter === "all" ? "gov-gradient text-white shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("सर्व नागरी तक्रारी", "All Complaints")} ({complaints.length})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter("pending")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            tabFilter === "pending" ? "gov-gradient text-white shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("प्रलंबित तक्रारी", "Pending")} ({complaints.filter((c) => c.status === "pending").length})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter("in-progress")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            tabFilter === "in-progress" ? "gov-gradient text-white shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("कार्यवाही सुरू", "In Progress")} ({complaints.filter((c) => c.status === "in-progress").length})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter("resolved")}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            tabFilter === "resolved" ? "gov-gradient text-white shadow-md" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("निवारण झालेल्या", "Resolved")} ({complaints.filter((c) => c.status === "resolved").length})
        </button>
      </div>

      

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

      {complaints.length === 0 && (
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                      {c.trackingId || shortId(c.id)}
                    </span>
                    {c.type && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                        {c.type}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${statusColors[c.status]}`}
                    >
                      {statusLabel[c.status]}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                      title={t("तक्रार हटवा", "Delete Complaint")}
                      disabled={updating === c.id}
                      onClick={(e) => handleDelete(e, c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
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
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <span>{t("तक्रार / अर्ज तपशील", "Application / Grievance Details")} — {selected.trackingId || shortId(selected.id)}</span>
              </CardTitle>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-lg"
                onClick={() => setSelected(null)}
              >
                <X className="h-4 w-4" />
              </Button>
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
              <div className="space-y-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  {t("तक्रारीचा सविस्तर तपशील", "Complaint Specifications")}
                </span>
                <FormattedDescription description={selected.description} />
              </div>
              {selected.attachments.length > 0 && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                      <Paperclip className="h-4 w-4 text-primary" />
                      {t("संलग्न कागदपत्रे व छायाचित्रे", "Attached Documents & Photos")} ({selected.attachments.length})
                    </span>
                  </div>

                  {/* Image Gallery Cards */}
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

                  {/* Complete List of all attached files with View & Download */}
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
              {/* Resolution Proof Photo Display (If marked Resolved) */}
              {selected.status === "resolved" && (
                <div className="space-y-2 pt-2 border-t">
                  {selected.resolutionProof?.url ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs md:text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          {t("काम पूर्ण झाल्याचा पुरावा / निराकरण छायाचित्र", "Resolution Proof Photo")}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-bold border-emerald-500 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                          onClick={() => handleOpenResolveModal(selected)}
                        >
                          <ImageIcon className="w-3.5 h-3.5 mr-1" />
                          {t("फोटो बदला", "Change Photo")}
                        </Button>
                      </div>
                      <div className="bg-card/70 rounded-xl p-2 border border-emerald-500/20 max-w-sm mx-auto text-center">
                        <a href={selected.resolutionProof.url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg">
                          <img src={selected.resolutionProof.url} alt="Proof" className="max-h-56 w-full object-contain mx-auto group-hover:scale-105 transition-transform" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{t("पूर्ण आकारात पहा", "View Full")}</span>
                          </div>
                        </a>
                      </div>
                      {selected.resolutionProof.notes && (
                        <p className="text-xs text-foreground bg-card/60 p-2 rounded-lg italic border border-emerald-500/20">
                          📝 {selected.resolutionProof.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                      <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                        {t("निराकरण पुरावा फोटो जोडलेला नाही.", "No resolution proof photo attached.")}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-bold border-amber-500 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-950/50"
                        onClick={() => handleOpenResolveModal(selected)}
                      >
                        <ImageIcon className="w-3.5 h-3.5 mr-1" />
                        {t("फोटो जोडा (पर्यायी)", "Add Photo (Optional)")}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 flex-wrap items-center pt-2 border-t">
                <Button
                  size="sm"
                  variant={selected.status === "pending" ? "default" : "outline"}
                  className={selected.status === "pending" ? "bg-yellow-500 hover:bg-yellow-600 text-white font-bold" : "border-yellow-400 text-yellow-700 hover:bg-yellow-50"}
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
                  variant={selected.status === "in-progress" ? "default" : "outline"}
                  className={selected.status === "in-progress" ? "bg-blue-600 hover:bg-blue-700 text-white font-bold" : "border-blue-400 text-blue-700 hover:bg-blue-50"}
                  disabled={updating === selected.id}
                  onClick={() => changeStatus(selected.id, "in-progress")}
                >
                  {t("कार्यवाही सुरू", "In Progress")}
                </Button>
                <Button
                  size="sm"
                  variant={selected.status === "resolved" ? "default" : "outline"}
                  className={selected.status === "resolved" ? "bg-green-600 hover:bg-green-700 text-white font-bold" : "border-green-500 text-green-700 hover:bg-green-50"}
                  disabled={updating === selected.id}
                  onClick={() => handleOpenResolveModal(selected)}
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  {t("निराकरण", "Resolved")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-auto"
                  disabled={updating === selected.id}
                  onClick={(e) => handleDelete(e, selected.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {t("तक्रार हटवा", "Delete Complaint")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Full-Screen Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-3xl max-w-4xl w-full border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
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

            {/* Modal Content */}
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

      {/* Complaint Resolution Proof Upload Modal */}
      {resolveModalOpen && targetResolveComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-3xl max-w-lg w-full border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="gov-gradient p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
                <h3 className="font-extrabold text-base md:text-lg">
                  {t("तक्रार निराकरण पुष्टी व पुरावा", "Complaint Resolution & Proof")}
                </h3>
              </div>
              <button
                onClick={() => setResolveModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-2xl bg-muted/60 border border-border text-xs space-y-1">
                <p>
                  <span className="font-bold text-muted-foreground">{t("तक्रार क्र.: ", "Tracking ID: ")}</span>
                  <span className="font-mono font-bold text-primary">{targetResolveComplaint.trackingId || targetResolveComplaint.id}</span>
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">{t("विभाग: ", "Department: ")}</span>
                  <span className="font-semibold">{targetResolveComplaint.department}</span>
                </p>
                <p className="line-clamp-2 text-muted-foreground mt-0.5">{targetResolveComplaint.description}</p>
              </div>

              <p className="text-xs text-foreground font-medium">
                {t(
                  "तुम्ही ही तक्रार 'निराकरण झाले' (Resolved) म्हणून चिन्हांकित करत आहात. काम पूर्ण झाल्याचा पुरावा / फोटो अपलोड करायचा आहे का? (पर्यायी)",
                  "You are marking this complaint as Resolved. You may attach a photo/proof of completed work (Optional)."
                )}
              </p>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <span>{t("कामाचा पुरावा / फोटो (पर्यायी)", "Proof Photo of Completed Work (Optional)")}</span>
                </label>

                {proofPreview ? (
                  <div className="relative rounded-2xl border-2 border-emerald-500/40 bg-muted/30 p-2 text-center">
                    <img
                      src={proofPreview}
                      alt="Proof Preview"
                      className="max-h-52 w-full object-contain rounded-xl mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setProofFile(null);
                        setProofPreview(null);
                      }}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors"
                      title={t("फोटो काढा", "Remove Photo")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {proofFile && (
                      <p className="text-[11px] text-muted-foreground mt-1 truncate px-2">
                        {proofFile.name} ({(proofFile.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5 cursor-pointer transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setProofFile(file);
                          const reader = new FileReader();
                          reader.onload = () => setProofPreview(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      {t("कामाचा फोटो निवडण्यासाठी येथे क्लिक करा", "Click here to choose or capture photo")}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {t("कॅमेरा किंवा गॅलरी (JPG, PNG - कमाल १० MB)", "Camera or Gallery (JPG, PNG - max 10 MB)")}
                    </p>
                  </label>
                )}
              </div>

              {/* Optional Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  {t("कामाचा थोडक्यात शेरा / तपशील (पर्यायी)", "Resolution Notes / Remarks (Optional)")}
                </label>
                <Input
                  value={proofNotes}
                  onChange={(e) => setProofNotes(e.target.value)}
                  placeholder={t("उदा. खड्डे बुजवले, कचरा साफ केला, पाणीपुरवठा सुरळीत केला", "e.g. Pothole filled, drain cleared, water line repaired")}
                  className="text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs font-bold"
                  onClick={() => setResolveModalOpen(false)}
                  disabled={uploadingProof}
                >
                  {t("रद्द करा", "Cancel")}
                </Button>

                <Button
                  type="button"
                  className="flex-1 text-xs font-bold bg-green-600 hover:bg-green-700 text-white gap-1.5"
                  onClick={handleConfirmResolve}
                  disabled={uploadingProof}
                >
                  {uploadingProof ? (
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>
                    {uploadingProof
                      ? t("अपलोड करत आहे...", "Uploading...")
                      : proofFile
                      ? t("फोटोसह निराकरण करा", "Resolve With Proof Photo")
                      : t("निराकरण पूर्ण करा", "Confirm Resolution")}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
