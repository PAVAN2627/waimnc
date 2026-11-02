import { useEffect, useState } from "react";
import {
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  FileCheck2,
  Settings,
  Video,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  subscribeToAllComplaints,
  formatComplaintDate,
  matchesEmployeeDepartment,
  type ComplaintRecord,
} from "@/lib/complaints";
import { Link } from "react-router-dom";
import { isFakeMobile } from "@wmc/types";

const statusColors: Record<"pending" | "in-progress" | "resolved", string> = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "in-progress": "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const [allComplaints, setAllComplaints] = useState<ComplaintRecord[]>([]);

  // 1. Subscribe to realtime complaints updates
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToAllComplaints(setAllComplaints);
    return () => unsub();
  }, [user]);

  // Extract assigned departments for this staff member
  const userDepts =
    user?.departments && user.departments.length > 0
      ? user.departments
      : user?.department
      ? user.department.split(",").map((d: string) => d.trim()).filter(Boolean)
      : [];

  // Filter complaints belonging to employee's assigned departments
  const rawList = allComplaints.filter((c) => !isFakeMobile(c.mobile));
  const deptComplaints =
    userDepts.length > 0
      ? rawList.filter((c) => matchesEmployeeDepartment(c, userDepts))
      : rawList;

  // Separate civic grievances vs service applications
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
      c.department === "लोकसेवा हक्क व दाखले कक्ष" ||
      c.department === "शासकीय योजना व उपक्रम"
    );
  };

  const grievances = deptComplaints.filter((c) => !isServiceRecord(c));
  const applications = deptComplaints.filter(isServiceRecord);

  const totalGrievances = grievances.length;
  const pendingGrievances = grievances.filter((c) => c.status === "pending").length;
  const inProgressGrievances = grievances.filter((c) => c.status === "in-progress").length;
  const resolvedGrievances = grievances.filter((c) => c.status === "resolved").length;

  const totalApps = applications.length;
  const pendingApps = applications.filter((c) => c.status === "pending").length;

  const stats = [
    {
      label: t("एकूण नागरी तक्रारी", "Total Grievances"),
      value: totalGrievances,
      icon: MessageSquare,
      bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    {
      label: t("प्रलंबित तक्रारी", "Pending Grievances"),
      value: pendingGrievances,
      icon: Clock,
      bg: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    {
      label: t("कार्यवाही सुरू", "In Progress"),
      value: inProgressGrievances,
      icon: AlertCircle,
      bg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      label: t("निराकरण झालेल्या", "Resolved"),
      value: resolvedGrievances,
      icon: CheckCircle2,
      bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    {
      label: t("दाखले व सेवा अर्ज", "Service Applications"),
      value: totalApps,
      icon: FileCheck2,
      bg: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
    {
      label: t("प्रलंबित अर्ज", "Pending Applications"),
      value: pendingApps,
      icon: Clock,
      bg: "bg-teal-500/10 text-teal-500 border-teal-500/20",
    },
  ];

  const statusLabel: Record<"pending" | "in-progress" | "resolved", string> = {
    pending: t("प्रलंबित", "Pending"),
    "in-progress": t("कार्यवाही सुरू", "In Progress"),
    resolved: t("निराकरण", "Resolved"),
  };

  const recentComplaints = deptComplaints.slice(0, 6);

  return (
    <div className="space-y-6 sm:space-y-8 font-devanagari max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 sm:w-48 h-36 sm:h-48 bg-white/10 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3 backdrop-blur-sm border border-white/30">
              <Building2 className="w-3.5 h-3.5" />
              {t("विभागीय कर्मचारी कार्यकक्ष", "Department Staff Workdesk")}
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              {t("विभागीय डॅशबोर्ड", "Employee Workdesk")}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium mt-1">
              {t(
                "वाई नगरपरिषद — आपल्या नेमून दिलेल्या विभागातील नागरी तक्रारी व सेवा अर्ज निवारण.",
                "Grievance redressal & certificate processing for assigned departments."
              )}
            </p>

            {/* Assigned Departments Badges */}
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              <span className="text-[11px] font-bold text-white/70">
                {t("नेमून दिलेले विभाग:", "Assigned Departments:")}
              </span>
              {userDepts.length > 0 ? (
                userDepts.map((d: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black border border-white/30 text-white"
                  >
                    <Building2 className="w-2.5 h-2.5" />
                    {d}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-medium border border-white/30 text-white">
                  {t("सर्व विभाग (All Departments)", "All Departments")}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/25 w-full sm:w-auto">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-white flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">
                {user?.name || user?.email || "Employee"}
              </p>
              <span className="text-[10px] text-white/90 font-bold uppercase block">
                {user?.role === "DEPT_OFFICER"
                  ? t("विभागीय अधिकारी / कर्मचारी", "Department Officer / Employee")
                  : t("प्रशासकीय कर्मचारी", "Municipal Staff")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 space-y-1.5 sm:space-y-2 group"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${s.bg} border flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-foreground font-mono">{s.value}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-bold leading-tight">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Split Section: Complaints & Employee Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Department Complaints (7 columns on desktop) */}
        <div className="lg:col-span-7 bg-card rounded-3xl border border-border shadow-md p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>{t("विभागातील अलीकडील तक्रारी", "Recent Department Grievances")}</span>
            </h2>
            <Link to="/complaints" className="text-xs font-bold text-primary hover:underline">
              {t("सर्व पहा ↗", "View All ↗")}
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto opacity-40" />
              <p className="text-xs font-semibold">
                {t(
                  "आपल्या विभागामध्ये सध्या कोणत्याही तक्रारी प्रलंबित नाहीत.",
                  "No complaints currently recorded for your department."
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3 hover:bg-muted/70 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <p className="font-extrabold text-xs text-foreground truncate">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground font-mono flex-wrap">
                      <span className="font-bold text-primary">{c.trackingId || `TK-${c.id.slice(-6).toUpperCase()}`}</span>
                      <span>•</span>
                      <span>{c.department || t("सामान्य", "General")}</span>
                      <span>•</span>
                      <span>{formatComplaintDate(c.createdAt, lang)}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors[c.status]} flex-shrink-0`}
                  >
                    {statusLabel[c.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Launchpad for Employee Duties (5 columns on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card rounded-3xl border border-border shadow-md p-5 sm:p-6 space-y-4">
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <span>{t("कर्मचारी कार्यक्षेत्र (Quick Actions)", "Employee Quick Actions")}</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  label: t("नागरी तक्रारी निवारण", "Civic Complaints"),
                  desc: t("आपल्या विभागातील तक्रारींची स्थिती बदला व निराकरण नोंदवा", "Review and resolve complaints"),
                  icon: MessageSquare,
                  href: "/complaints",
                  color: "text-amber-500",
                  bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40",
                },
                {
                  label: t("दाखले व सेवा अर्ज", "Service Applications"),
                  desc: t("जन्म-मृत्यू, नळ जोडणी, बांधकाम परवानगी अर्ज तपासा", "Verify & approve service certificates"),
                  icon: FileCheck2,
                  href: "/applications",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40",
                },
                {
                  label: t("सभा व ठराव दालन", "Sabha & Tharav"),
                  desc: t("नगरपरिषदेच्या सर्वसाधारण, विशेष व स्थायी समिती सभा आणि ठराव पहा", "Browse council resolutions & meetings"),
                  icon: Video,
                  href: "/sabha",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
                },
                {
                  label: t("माझे प्रोफाइल व पासवर्ड", "My Profile & Password"),
                  desc: t("आपली माहिती पहा व पासवर्ड सुरक्षितपणे बदला", "Update your account security & password"),
                  icon: Settings,
                  href: "/settings",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`p-3.5 rounded-2xl border ${item.bg} transition-all duration-200 flex items-center gap-3.5 group`}
                >
                  <div className={`p-2.5 rounded-xl bg-background shadow-xs flex-shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {item.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Department Guidelines Note */}
          <div className="bg-blue-500/5 rounded-3xl border border-blue-500/20 p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>{t("विभागीय कर्मचारी सूचना", "Department Staff Notice")}</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {t(
                "आपल्याला केवळ आपल्या विभागाशी संबंधित नागरी तक्रारी व दाखले हाताळण्याची परवानगी आहे. तक्रार निकाली काढल्यानंतर स्थिती 'निराकरण' (Resolved) करा.",
                "You are assigned to specific municipal departments. Please verify citizen documents and update status promptly upon resolution."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
