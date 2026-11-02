import { useEffect, useState } from "react";
import {
  ShieldCheck,
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Calendar,
  Eye,
  X,
  FileSpreadsheet,
  Globe,
  Clock,
  ArrowUpDown,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  fetchAuditLogs,
  fetchAuditStats,
  type AuditLog,
  type AuditStats,
} from "@/lib/api";

export default function AdminLogs() {
  const { t, lang } = useLanguage();
  const { toast } = useToast();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const loadLogs = async (currentPage = page) => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        fetchAuditLogs({
          search,
          action: actionFilter,
          resource: resourceFilter,
          page: currentPage,
          limit: 20,
        }),
        fetchAuditStats().catch(() => null),
      ]);

      setLogs(logsRes.data || []);
      setTotalPages(logsRes.totalPages || 1);
      setTotalLogs(logsRes.total || 0);
      setPage(logsRes.page || 1);

      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err: any) {
      console.warn("Error loading audit logs:", err);
      toast({
        title: t("त्रुटी", "Error"),
        description: err.message || t("ऑडिट लॉग्स लोड करता आले नाहीत.", "Failed to load audit logs."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [actionFilter, resourceFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(1);
  };

  // Export to CSV
  const handleExportCsv = () => {
    if (logs.length === 0) {
      toast({
        title: t("डाउनलोड करण्यासाठी नोंदी उपलब्ध नाहीत.", "No logs available to export."),
        variant: "destructive",
      });
      return;
    }

    const headers = ["ID", "Timestamp", "Officer Name", "Officer Email", "Action", "Resource", "Resource ID", "IP Address", "Details"];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toISOString(),
      `"${(l.adminName || "").replace(/"/g, '""')}"`,
      l.adminEmail || "",
      l.action,
      l.resource,
      l.resourceId || "",
      l.ipAddress || "",
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `wmc_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: t("CSV फाईल डाउनलोड झाली ✓", "CSV Export Downloaded ✓"),
      description: t("ऑडिट ट्रेल डेटा यशस्वीरित्या सेव्ह झाला.", "Audit trail exported successfully."),
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "LOGIN":
        return {
          label: t("लॉगिन (Login)", "Login"),
          color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
          icon: Lock,
        };
      case "FAILED_LOGIN":
        return {
          label: t("अयशस्वी लॉगिन (Failed)", "Failed Login"),
          color: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertTriangle,
        };
      case "BLOCKED_LOGIN":
        return {
          label: t("ब्लॉक केलेले लॉगिन", "Blocked"),
          color: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
          icon: Lock,
        };
      case "UPDATE_STATUS":
        return {
          label: t("स्थिती अद्ययावत (Status Change)", "Status Change"),
          color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
          icon: CheckCircle2,
        };
      case "CREATE_STAFF":
        return {
          label: t("नवीन कर्मचारी खाते", "Staff Created"),
          color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
          icon: UserCheck,
        };
      case "UPDATE_STAFF":
        return {
          label: t("कर्मचारी माहिती बदल", "Staff Updated"),
          color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
          icon: UserCheck,
        };
      case "DELETE_STAFF":
      case "DELETE":
        return {
          label: t("हटवले (Deleted)", "Deleted"),
          color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20",
          icon: AlertTriangle,
        };
      default:
        return {
          label: action,
          color: "bg-muted text-foreground border-border",
          icon: History,
        };
    }
  };

  const getResourceBadge = (resource: string) => {
    switch (resource) {
      case "COMPLAINTS":
        return t("नागरी तक्रारी", "Complaints");
      case "APPLICATIONS":
        return t("दाखले व सेवा अर्ज", "Applications");
      case "STAFF":
        return t("अधिकारी व कर्मचारी", "Staff");
      case "AUTH":
        return t("प्रशासन लॉगिन", "Auth");
      case "SABHA":
        return t("सभा व ठराव", "Sabha");
      case "NOTICES":
        return t("सूचना", "Notices");
      default:
        return resource;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="gov-gradient text-white p-6 md:p-8 rounded-3xl shadow-xl border border-white/20 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <History className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{t("सुरक्षा व पारदर्शकता ऑडिट ट्रेल", "Security & Audit Trail")}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              {t("प्रशासकीय लॉग व ऑडिट ट्रेल", "Admin Activity Logs & Audit Trail")}
            </h1>
            <p className="text-white/80 text-xs md:text-sm mt-1 max-w-2xl font-medium">
              {t(
                "कोणत्या अधिकाऱ्याने कधी लॉगिन केले, कोणत्या तक्रारीची किंवा अर्जाची स्थिती बदलली, नवीन कर्मचारी खाती जोडली अथवा बदलली याची संपूर्ण अचूक नोंद.",
                "Track every administrative action: logins, grievance status changes, certificate approvals, staff provisioning, and deletions with timestamps and IP addresses."
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold rounded-xl"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {t("CSV डाउनलोड", "Export CSV")}
            </Button>

            <Button
              variant="outline"
              onClick={() => loadLogs(page)}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 font-bold rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              {t("रिफ्रेश", "Refresh")}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("एकूण ऑडिट नोंदी", "Total Logged Actions")}
              </p>
              <p className="text-2xl font-black text-foreground mt-1">{stats?.totalLogs ?? totalLogs}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("आजच्या एकूण कृती", "Actions Today")}
              </p>
              <p className="text-2xl font-black text-foreground mt-1">{stats?.todayLogs ?? 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("आजचे यशस्वी लॉगिन", "Logins Today")}
              </p>
              <p className="text-2xl font-black text-foreground mt-1">{stats?.loginCountToday ?? 0}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("सक्रिय प्रशासन ट्रॅकिंग", "Security Status")}
              </p>
              <p className="text-sm font-black text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {t("२४/७ ऑडिट सक्रिय", "24/7 Monitored")}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar Card */}
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-4 md:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("अधिकारी नाव, ईमेल, ॲक्शन, आयपी ॲड्रेसने शोधा...", "Search by officer name, email, action, IP...")}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            {/* Action Filter */}
            <div className="w-full lg:w-48">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full text-xs md:text-sm border rounded-xl px-3 py-2 bg-background focus:ring-2 focus:ring-primary focus:outline-none font-bold"
              >
                <option value="all">{t("सर्व ॲक्शन (All Actions)", "All Actions")}</option>
                <option value="LOGIN">{t("लॉगिन (Login)", "Login")}</option>
                <option value="FAILED_LOGIN">{t("अयशस्वी लॉगिन (Failed)", "Failed Login")}</option>
                <option value="UPDATE_STATUS">{t("स्थिती बदल (Status Change)", "Status Change")}</option>
                <option value="CREATE_STAFF">{t("नवीन कर्मचारी (Staff Created)", "Staff Created")}</option>
                <option value="UPDATE_STAFF">{t("कर्मचारी बदल (Staff Updated)", "Staff Updated")}</option>
                <option value="DELETE_STAFF">{t("कर्मचारी हटवले (Staff Deleted)", "Staff Deleted")}</option>
                <option value="DELETE">{t("तक्रार/अर्ज हटवले (Deleted)", "Deleted")}</option>
              </select>
            </div>

            {/* Resource Filter */}
            <div className="w-full lg:w-48">
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="w-full text-xs md:text-sm border rounded-xl px-3 py-2 bg-background focus:ring-2 focus:ring-primary focus:outline-none font-bold"
              >
                <option value="all">{t("सर्व विभाग / साधन (All Resources)", "All Resources")}</option>
                <option value="COMPLAINTS">{t("नागरी तक्रारी (Complaints)", "Complaints")}</option>
                <option value="APPLICATIONS">{t("दाखले व अर्ज (Applications)", "Applications")}</option>
                <option value="STAFF">{t("कर्मचारी व्यवस्थापन (Staff)", "Staff")}</option>
                <option value="AUTH">{t("प्रशासन ऑथ (Auth)", "Auth")}</option>
              </select>
            </div>

            {/* Search Button */}
            <Button type="submit" className="w-full lg:w-auto gov-gradient text-white font-bold rounded-xl px-5 text-xs">
              <Search className="w-3.5 h-3.5 mr-1.5" />
              {t("शोधा", "Search")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Audit Logs Table Card */}
      <Card className="rounded-3xl shadow-sm border overflow-hidden">
        <CardHeader className="py-4 px-6 border-b bg-card flex flex-row items-center justify-between">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <span>{t("तपशीलवार ऑडिट नोंदी", "Detailed Audit Trail")} ({totalLogs})</span>
          </CardTitle>
          <span className="text-xs font-bold text-muted-foreground">
            {t(`पान क्र. ${page} / ${totalPages}`, `Page ${page} of ${totalPages}`)}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center text-muted-foreground">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm font-bold">{t("ऑडिट ट्रेल लोड करत आहे...", "Loading audit trail...")}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold">{t("कोणत्याही ऑडिट नोंदी सापडल्या नाहीत.", "No audit logs found.")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-black uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">{t("दिनांक व वेळ", "Date & Time")}</th>
                    <th className="py-3 px-4">{t("अधिकारी / युझर", "Officer / User")}</th>
                    <th className="py-3 px-4">{t("कृती (Action)", "Action")}</th>
                    <th className="py-3 px-4">{t("घटक (Resource)", "Resource")}</th>
                    <th className="py-3 px-4">{t("आयपी ॲड्रेस", "IP Address")}</th>
                    <th className="py-3 px-4 text-right">{t("तपशील", "Details")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => {
                    const badge = getActionBadge(log.action);
                    const BadgeIcon = badge.icon;
                    const dateObj = new Date(log.createdAt);

                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-foreground">
                            {dateObj.toLocaleDateString(lang === "mr" ? "mr-IN" : "en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dateObj.toLocaleTimeString(lang === "mr" ? "mr-IN" : "en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </div>
                        </td>

                        {/* Officer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-foreground truncate max-w-[200px]">
                            {log.adminName || (log.details?.createdStaffName) || t("प्रशासकीय युझर", "System Admin")}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {log.adminEmail || "—"}
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badge.color}`}
                          >
                            <BadgeIcon className="w-3 h-3 flex-shrink-0" />
                            <span>{badge.label}</span>
                          </span>
                        </td>

                        {/* Resource */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-bold text-foreground">
                            {getResourceBadge(log.resource)}
                          </span>
                          {log.resourceId && (
                            <span className="block text-[10px] text-muted-foreground truncate max-w-[140px]">
                              ID: {log.resourceId}
                            </span>
                          )}
                        </td>

                        {/* IP Address */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                            <Globe className="w-3 h-3" />
                            {log.ipAddress || "127.0.0.1"}
                          </span>
                        </td>

                        {/* Details View Button */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="rounded-xl text-xs font-bold text-primary hover:bg-primary/10 h-7 px-2.5"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {t("पहा", "View")}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => loadLogs(page - 1)}
                className="rounded-xl text-xs font-bold"
              >
                {t("मागील पान (Previous)", "Previous")}
              </Button>

              <span className="text-xs font-bold text-muted-foreground">
                {t(`पान ${page} / एकूण ${totalPages}`, `Page ${page} of ${totalPages}`)}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => loadLogs(page + 1)}
                className="rounded-xl text-xs font-bold"
              >
                {t("पुढील पान (Next)", "Next")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150 bg-card">
            <CardHeader className="bg-muted/40 border-b flex flex-row items-center justify-between py-4 px-6">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <span>{t("ऑडिट तपशील (Audit Details)", "Audit Details")}</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLog(null)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block font-bold">{t("तारीख व वेळ:", "Timestamp:")}</span>
                  <span className="font-semibold text-foreground">
                    {new Date(selectedLog.createdAt).toLocaleString(lang === "mr" ? "mr-IN" : "en-IN")}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block font-bold">{t("आयपी ॲड्रेस:", "IP Address:")}</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedLog.ipAddress || "127.0.0.1"}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block font-bold">{t("अधिकारी:", "Officer:")}</span>
                  <span className="font-semibold text-foreground">
                    {selectedLog.adminName || "—"} ({selectedLog.adminEmail || "—"})
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground block font-bold">{t("कृती व साधन:", "Action & Resource:")}</span>
                  <span className="font-semibold text-foreground">
                    {selectedLog.action} / {selectedLog.resource}
                  </span>
                </div>
              </div>

              {selectedLog.resourceId && (
                <div className="text-xs">
                  <span className="text-muted-foreground block font-bold">{t("संबंधित साधन आयडी (Resource ID):", "Resource ID:")}</span>
                  <span className="font-mono bg-muted p-1.5 rounded-lg block mt-0.5 text-foreground truncate">
                    {selectedLog.resourceId}
                  </span>
                </div>
              )}

              {/* JSON / Object Details View */}
              <div className="text-xs">
                <span className="text-muted-foreground block font-bold mb-1">
                  {t("तपशीलवार नोंद माहिती (Payload / Changes):", "Detailed Payload / Changes:")}
                </span>
                <pre className="bg-muted/70 p-3 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-56 border border-border">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setSelectedLog(null)} className="gov-gradient text-white rounded-xl text-xs font-bold px-5">
                  {t("बंद करा", "Close")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

