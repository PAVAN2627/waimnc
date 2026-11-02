import React, { useEffect, useState } from "react";
import { CheckCircle2, FileText, Sun, Award, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchPublicStats } from "@/lib/api";

export const CivicStatsCounter: React.FC = () => {
  const { t } = useLanguage();
  const [resolutionRate, setResolutionRate] = useState(0);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [projectsCount, setProjectsCount] = useState(0);
  const [officialsCount, setOfficialsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchPublicStats()
      .then((data) => {
        if (!isMounted || !data) return;
        const targetRate = data.resolutionRate || 100;
        const targetComplaints = data.totalComplaints || 0;
        const targetProjects = data.activeProjects || 0;
        const targetOfficials = data.totalOfficials || 26;

        const duration = 1500;
        const steps = 30;
        const intervalTime = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          setResolutionRate(Math.min(targetRate, Number((progress * targetRate).toFixed(1))));
          setTotalComplaints(Math.min(targetComplaints, Math.floor(progress * targetComplaints)));
          setProjectsCount(Math.min(targetProjects, Math.floor(progress * targetProjects)));
          setOfficialsCount(Math.min(targetOfficials, Math.floor(progress * targetOfficials)));

          if (step >= steps) {
            clearInterval(timer);
          }
        }, intervalTime);
      })
      .catch((err) => {
        console.error("Failed to fetch live stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = [
    {
      icon: CheckCircle2,
      value: `${resolutionRate}%`,
      label: t("तक्रार निवारण दर", "Grievance Resolution Rate"),
      sub: t("पारदर्शक व गतिमान निपटारा", "Transparent & Fast Resolution"),
      gradient: "from-emerald-500/10 to-teal-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Users,
      value: `${officialsCount}`,
      label: t("लोकप्रतिनिधी व नगरसेवक", "Elected Council Officials"),
      sub: t("नागरी सेवेत सदैव तत्पर", "Dedicated Civic Leadership"),
      gradient: "from-amber-500/10 to-orange-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    },
    {
      icon: Sun,
      value: `${projectsCount}`,
      label: t("सक्रिय शहर विकास प्रकल्प", "Active Civic Projects"),
      sub: t("हरित व स्वच्छ वाई उपक्रम", "Green Wai Clean Initiative"),
      gradient: "from-blue-500/10 to-cyan-500/5 border-blue-500/30 text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    },
    {
      icon: Award,
      value: t("TOP 10", "TOP 10"),
      label: t("स्वच्छ महाराष्ट्र रँकिंग", "Clean Maharashtra Rank"),
      sub: t("स्वच्छ सर्वेक्षण गौरव", "Swachh Survekshan Award"),
      gradient: "from-purple-500/10 to-pink-500/5 border-purple-500/30 text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <section className="py-10 bg-muted/50 dark:bg-slate-950 text-foreground dark:text-white relative overflow-hidden transition-colors border-y border-border">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t("नागरी प्रगती व उपलब्धी", "Civic Progress & Milestones")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground dark:text-white">
              {t("पारदर्शक आणि गतिमान प्रशासन", "Transparent & Fast Governance")}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground dark:text-slate-400 max-w-md">
            {t("वायकरांच्या सेवेत नगरपालिकेची डिजिटल भरारी — रीयल-टाईम आकडेवारी व नागरिक समाधान", "Digital progress serving Wai citizens — real-time statistics and citizen satisfaction")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`relative rounded-2xl p-5 border bg-card dark:bg-slate-900/80 bg-gradient-to-b ${stat.gradient} backdrop-blur-md hover:scale-[1.03] transition-all duration-300 shadow-md group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.iconBg} group-hover:rotate-12 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    LIVE
                  </span>
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold text-foreground dark:text-white tracking-tight mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="font-bold text-sm text-foreground dark:text-slate-100 mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground dark:text-slate-400">{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CivicStatsCounter;
