import { useEffect, useState } from "react";
import {
  Building2,
  Droplets,
  FolderOpen,
  Hammer,
  Leaf,
  Lightbulb,
  Zap,
  CheckCircle2,
  TrendingUp,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { subscribeToActiveProjects, type ProjectRecord } from "@/lib/projects";

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Droplets,
  Leaf,
  Lightbulb,
  Hammer,
  Zap,
  FolderOpen,
};

export const Projects = () => {
  const { t, lang } = useLanguage();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
        const unsubscribe = subscribeToActiveProjects(setProjects);
    return () => unsubscribe();
  }, []);

  return (
    <section className="py-14 bg-background border-b relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>{t("नागरी विकास उपक्रम", "Civic Development Initiatives")}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t("नगरपालिका विकास प्रकल्प", "Ongoing Municipal Projects")}
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            {t("वाई शहराच्या कायाकपासाठी प्रगतीपथावर असलेले प्रमुख प्रकल्प", "Key infrastructure & development projects in Wai")}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border max-w-md mx-auto text-sm text-muted-foreground">
            {t("सध्या कोणतेही प्रकल्प उपलब्ध नाहीत.", "No projects available right now.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {projects.map((p) => {
              const Icon = iconMap[p.iconName] ?? Building2;
              return (
                <div
                  key={p.id}
                  className="group bg-card rounded-2xl p-6 border border-border/80 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Icon & Progress Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      {p.progress >= 100 ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          {t("पूर्ण (१००%)", "Completed (100%)")}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {p.progress}%
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-foreground mb-1.5 group-hover:text-primary transition-colors leading-snug">
                      {lang === "mr" ? p.titleMr : p.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                      {lang === "mr" ? p.descMr : p.descEn}
                    </p>

                    {/* Project DPR / Report Document if available */}
                    {p.documentUrl && (
                      <div className="mb-4">
                        <a
                          href={p.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg px-2.5 py-1.5 w-full transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                          <span className="truncate">{p.documentName || t("प्रकल्प अहवाल (DPR / अहवाल)", "Project Report (DPR / Document)")}</span>
                          <ExternalLink className="w-3 h-3 ml-auto opacity-70 flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar Container */}
                  <div className="space-y-1.5 pt-3 border-t border-border/60">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={p.progress >= 100 ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
                        {p.progress >= 100 ? t("स्थिती: पूर्ण", "Status: Completed") : t("प्रगती", "Progress")}
                      </span>
                      <span className="text-primary font-mono">{p.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden p-0.5 border border-border">
                      <div
                        className={`h-full rounded-full transition-all duration-500 shadow-sm ${p.progress >= 100 ? "bg-emerald-500" : "gov-gradient"}`}
                        style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
