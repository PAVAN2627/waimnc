import { useEffect, useState } from "react";
import {
  MessageSquare,
  FileText,
  FolderOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
  Users,
  ImageIcon,
  BookOpen,
  Settings,
  Video,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToAllComplaints,
  formatComplaintDate,
  type ComplaintRecord,
} from "@/lib/complaints";
import { subscribeToActiveNotices, type NoticeRecord } from "@/lib/notices";
import { subscribeToActiveProjects, type ProjectRecord } from "@/lib/projects";
import { Link } from "react-router-dom";

import { fetchDashboardStats } from "@/lib/api";
import { type DashboardStats, isFakeMobile } from "@wmc/types";

const statusColors: Record<"pending" | "in-progress" | "resolved", string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "in-progress": "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [pgStats, setPgStats] = useState<DashboardStats | null>(null);

  // 1. Fetch live metrics from PostgreSQL NestJS API with 10s auto-refresh
  useEffect(() => {
    let isMounted = true;
    const loadPgStats = async () => {
      const stats = await fetchDashboardStats();
      if (stats && isMounted) {
        setPgStats(stats);
      }
    };

    loadPgStats();
    const interval = setInterval(loadPgStats, 10000); // 10-second polling for live updates
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 2. Realtime listener fallback
  useEffect(() => {
    if (!user) return;
    const unsubComplaints = subscribeToAllComplaints(setComplaints);
    const unsubNotices = subscribeToActiveNotices(setNotices);
    const unsubProjects = subscribeToActiveProjects(setProjects);
    return () => {
      unsubComplaints();
      unsubNotices();
      unsubProjects();
    };
  }, [user]);

  // Use PostgreSQL metrics if connected, otherwise fallback (or department-specific if DEPT_OFFICER)
  const isDeptOfficer = user?.role === "DEPT_OFFICER";
  const deptComplaints = complaints.filter((c) => !isFakeMobile(c.mobile));

  const total = isDeptOfficer ? deptComplaints.length : (pgStats ? pgStats.totalComplaints : complaints.length);
  const pending = isDeptOfficer
    ? deptComplaints.filter((c) => c.status === "pending").length
    : (pgStats ? pgStats.pendingComplaints : complaints.filter((c) => c.status === "pending").length);
  const inProgress = isDeptOfficer
    ? deptComplaints.filter((c) => c.status === "in-progress").length
    : (pgStats ? pgStats.inProgressComplaints : complaints.filter((c) => c.status === "in-progress").length);
  const resolved = isDeptOfficer
    ? deptComplaints.filter((c) => c.status === "resolved").length
    : (pgStats ? pgStats.resolvedComplaints : complaints.filter((c) => c.status === "resolved").length);
  const activeNoticesCount = pgStats ? pgStats.activeNotices : notices.length;
  const ongoingProjectsCount = pgStats ? pgStats.ongoingProjects : projects.length;

  const stats = isDeptOfficer
    ? [
        { label: t(`${user?.department || "विभाग"} एकूण तक्रारी`, "Department Complaints"), value: total, icon: MessageSquare, bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
        { label: t("प्रलंबित", "Pending"), value: pending, icon: Clock, bg: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
        { label: t("कार्यवाही सुरू", "In Progress"), value: inProgress, icon: AlertCircle, bg: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        { label: t("निराकरण झालेल्या", "Resolved"), value: resolved, icon: CheckCircle2, bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
      ]
    : [
        { label: t("एकूण तक्रारी", "Total Complaints"), value: total, icon: MessageSquare, bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
        { label: t("प्रलंबित", "Pending"), value: pending, icon: Clock, bg: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
        { label: t("कार्यवाही सुरू", "In Progress"), value: inProgress, icon: AlertCircle, bg: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        { label: t("निराकरण झालेल्या", "Resolved"), value: resolved, icon: CheckCircle2, bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
        { label: t("सक्रिय सूचना", "Active Notices"), value: activeNoticesCount, icon: FileText, bg: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
        { label: t("चालू प्रकल्प", "Ongoing Projects"), value: ongoingProjectsCount, icon: FolderOpen, bg: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
      ];

  const statusLabel: Record<"pending" | "in-progress" | "resolved", string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण", "Resolved"),
  };

  const recentComplaints = isDeptOfficer
    ? deptComplaints.slice(0, 5)
    : pgStats?.recentComplaints && pgStats.recentComplaints.length > 0
    ? pgStats.recentComplaints.map((c: any) => ({
        id: c.id,
        trackingId: c.trackingId,
        name: c.name,
        mobile: c.mobile,
        ward: c.ward,
        type: c.type || "general",
        department: c.department,
        description: c.description,
        attachments: c.attachments || [],
        status: (c.status || "pending") as "pending" | "in-progress" | "resolved",
        createdAt: new Date(c.createdAt).getTime(),
        updatedAt: new Date(c.updatedAt).getTime(),
      }))
    : complaints.filter((c) => !isFakeMobile(c.mobile)).slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8 font-devanagari max-w-7xl mx-auto w-full">
      
      {/* Header Banner */}
      <div className="gov-gradient rounded-3xl p-5 sm:p-8 text-primary-foreground shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 backdrop-blur-sm border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t("प्रशासकीय विहंगावलोकन", "Administrative Overview")}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">{t("प्रशासकीय डॅशबोर्ड", "Admin Control Dashboard")}</h1>
            <p className="text-primary-foreground/90 text-xs sm:text-sm font-medium mt-1">
              {t("वाई नगरपरिषद — तक्रारी, सूचना, निविदा व विकास प्रकल्प थेट व्यवस्थापन.", "Real-time control desk for complaints, notices, tenders & city projects.")}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/25 w-full sm:w-auto">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">{user?.name || user?.email || "Admin"}</p>
              <span className="text-[10px] text-white/90 font-bold uppercase block">
                {isDeptOfficer
                  ? t(`विभागीय अधिकारी (${user?.department || "विभाग"})`, `Dept Officer (${user?.department})`)
                  : t("मुख्य प्रशासक", "System Administrator")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 space-y-1.5 sm:space-y-2 group">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${s.bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-foreground font-mono">{s.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-bold leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Split Section: Complaints & Quick Launchpad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recent Complaints (5 columns on desktop) */}
        <div className="lg:col-span-5 bg-card rounded-3xl border border-border shadow-md p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>{t("अलीकडील तक्रारी", "Recent Complaints")}</span>
            </h2>
            <Link to="/complaints" className="text-xs font-bold text-primary hover:underline">
              {t("सर्व पहा ↗", "View All ↗")}
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-semibold">{t("सध्या कोणत्याही तक्रारी नोंदवलेल्या नाहीत.", "No complaints recorded yet.")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3 hover:bg-muted/70 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <p className="font-extrabold text-xs text-foreground truncate">{c.description}</p>
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground font-mono">
                      <span>TK-{c.id.slice(-6).toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatComplaintDate(c.createdAt, lang)}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors[c.status]} flex-shrink-0`}>
                    {statusLabel[c.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launchpad - All 11 Modules (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-card rounded-3xl border border-border shadow-md p-5 sm:p-6 space-y-4">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>{t("सर्व प्रशासकीय कार्ये (Quick Launchpad)", "Administrative Launchpad")}</span>
            </h2>
            <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
              {t("१२ मॉड्यूल्स सक्रिय", "12 Modules Active")}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { label: t("सूचना व्यवस्थापन", "Notices"), icon: FileText, href: "/notices", color: "text-purple-500", bg: "hover:bg-purple-500/10 hover:border-purple-500/30" },
              { label: t("ई-निविदा दालन", "Tenders"), icon: FileSpreadsheet, href: "/tenders", color: "text-amber-500", bg: "hover:bg-amber-500/10 hover:border-amber-500/30" },
              { label: t("नागरी तक्रारी", "Complaints"), icon: MessageSquare, href: "/complaints", color: "text-orange-500", bg: "hover:bg-orange-500/10 hover:border-orange-500/30" },
              { label: t("दाखले व सेवा अर्ज", "Service Applications"), icon: FileCheck2, href: "/applications", color: "text-emerald-500", bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30" },
              { label: t("विकास प्रकल्प", "Projects"), icon: FolderOpen, href: "/projects", color: "text-teal-500", bg: "hover:bg-teal-500/10 hover:border-teal-500/30" },
              { label: t("बातम्या प्रकाशित", "News Feed"), icon: FileText, href: "/news", color: "text-blue-500", bg: "hover:bg-blue-500/10 hover:border-blue-500/30" },
              { label: t("लाईव्ह सभा", "Live Sabha"), icon: Video, href: "/sabha", color: "text-red-500", bg: "hover:bg-red-500/10 hover:border-red-500/30" },
              { label: t("दैनंदिन दिनक्रम", "Routine"), icon: Calendar, href: "/routine", color: "text-emerald-500", bg: "hover:bg-emerald-500/10 hover:border-emerald-500/30" },
              { label: t("पदाधिकारी", "Officials"), icon: Users, href: "/officials", color: "text-indigo-500", bg: "hover:bg-indigo-500/10 hover:border-indigo-500/30" },
              { label: t("गॅलरी व्यवस्थापन", "Gallery"), icon: ImageIcon, href: "/gallery", color: "text-pink-500", bg: "hover:bg-pink-500/10 hover:border-pink-500/30" },
              { label: t("शासकीय योजना", "Schemes"), icon: BookOpen, href: "/schemes", color: "text-cyan-500", bg: "hover:bg-cyan-500/10 hover:border-cyan-500/30" },
              { label: t("सुरक्षा व सेटिंग्ज", "Settings"), icon: Settings, href: "/settings", color: "text-slate-500", bg: "hover:bg-slate-500/10 hover:border-slate-500/30" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`p-3.5 sm:p-4 rounded-2xl bg-muted/40 border border-border ${action.bg} transition-all duration-200 flex flex-col items-center justify-center text-center space-y-1.5 group`}
              >
                <action.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[11px] sm:text-xs font-extrabold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
