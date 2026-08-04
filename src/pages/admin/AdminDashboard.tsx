import { useEffect, useState } from "react";
import {
  MessageSquare,
  FileText,
  FolderOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToAllComplaints,
  formatComplaintDate,
  type ComplaintRecord,
} from "@/lib/complaints";
import { subscribeToActiveNotices, type NoticeRecord } from "@/lib/notices";
import { subscribeToActiveProjects, type ProjectRecord } from "@/lib/projects";
import { Link } from "react-router-dom";

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

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    const unsubComplaints = subscribeToAllComplaints(setComplaints);
    const unsubNotices = subscribeToActiveNotices(setNotices);
    const unsubProjects = subscribeToActiveProjects(setProjects);
    return () => {
      unsubComplaints();
      unsubNotices();
      unsubProjects();
    };
  }, [user]);

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === "pending").length;
  const inProgress = complaints.filter((c) => c.status === "in-progress").length;
  const resolved = complaints.filter((c) => c.status === "resolved").length;

  const stats = [
    { label: t("एकूण तक्रारी", "Total Complaints"), value: total, icon: MessageSquare, bg: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { label: t("प्रलंबित", "Pending"), value: pending, icon: Clock, bg: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { label: t("कार्यवाही सुरू", "In Progress"), value: inProgress, icon: AlertCircle, bg: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { label: t("निराकरण झालेल्या", "Resolved"), value: resolved, icon: CheckCircle2, bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { label: t("सक्रिय सूचना", "Active Notices"), value: notices.length, icon: FileText, bg: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { label: t("चालू प्रकल्प", "Ongoing Projects"), value: projects.length, icon: FolderOpen, bg: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
  ];

  const statusLabel: Record<"pending" | "in-progress" | "resolved", string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण", "Resolved"),
  };

  const recentComplaints = complaints.slice(0, 5);

  return (
    <div className="space-y-8 font-devanagari">
      
      {/* Header Banner */}
      <div className="gov-gradient rounded-3xl p-8 text-primary-foreground shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3 backdrop-blur-sm border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              {t("प्रशासकीय विहंगावलोकन", "Administrative Overview")}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white">{t("प्रशासकीय डॅशबोर्ड", "Admin Control Dashboard")}</h1>
            <p className="text-primary-foreground/90 text-sm font-medium mt-1">
              {t("वाई नगर परिषद — तक्रारी, सूचना व विकास प्रकल्प थेट व्यवस्थापन.", "Real-time control desk for complaints, notices, council schemes & city projects.")}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20">
            <ShieldCheck className="w-8 h-8 text-white flex-shrink-0" />
            <div>
              <p className="text-xs font-extrabold text-white">{user?.email || "Admin"}</p>
              <span className="text-[10px] text-white/80 font-bold uppercase">{t("मुख्य प्रशासक", "System Administrator")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card rounded-3xl p-5 border border-border shadow-md hover:shadow-xl transition-all duration-300 space-y-2 group">
            <div className={`w-10 h-10 rounded-2xl ${s.bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-foreground font-mono">{s.value}</p>
            <p className="text-xs text-muted-foreground font-bold">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Split Section: Complaints & Quick Launchpad */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        
        {/* Recent Complaints */}
        <div className="bg-card rounded-3xl border border-border shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>{t("अलीकडील तक्रारी", "Recent Complaints")}</span>
            </h2>
            <Link to="/admin/complaints" className="text-xs font-bold text-primary hover:underline">
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
                <div key={c.id} className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3 hover:bg-muted/70 transition-colors">
                  <div className="space-y-1 min-w-0">
                    <p className="font-extrabold text-xs text-foreground truncate">{c.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                      <span>TK-{c.id.slice(-6).toUpperCase()}</span>
                      <span>•</span>
                      <span>{formatComplaintDate(c.createdAt, lang)}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${statusColors[c.status]} flex-shrink-0`}>
                    {statusLabel[c.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launchpad */}
        <div className="bg-card rounded-3xl border border-border shadow-xl p-6 space-y-4">
          <div className="border-b border-border pb-3">
            <h2 className="text-lg font-black text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>{t("त्वरित प्रशासकीय कार्ये (Quick Launchpad)", "Administrative Launchpad")}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: t("सूचना व्यवस्थापन", "Notices"), icon: FileText, href: "/admin/notices", color: "text-purple-500" },
              { label: t("तक्रारी निवारण", "Complaints"), icon: MessageSquare, href: "/admin/complaints", color: "text-amber-500" },
              { label: t("विकास प्रकल्प", "Projects"), icon: FolderOpen, href: "/admin/projects", color: "text-teal-500" },
              { label: t("बातम्या प्रकाशित करा", "News Feed"), icon: FileText, href: "/admin/news", color: "text-blue-500" },
              { label: t("लाईव्ह सभा", "Live Sabha"), icon: Clock, href: "/admin/sabha", color: "text-red-500" },
              { label: t("दिनक्रम अपडेट", "Routine"), icon: AlertCircle, href: "/admin/routine", color: "text-emerald-500" },
            ].map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className="p-4 rounded-2xl bg-muted/40 hover:bg-primary/10 border border-border hover:border-primary/30 transition-all duration-200 flex flex-col items-center justify-center text-center space-y-2 group"
              >
                <action.icon className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
