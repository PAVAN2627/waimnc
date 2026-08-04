import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, UserCheck, Shield, Crown } from "lucide-react";

const LEADERS = [
  {
    nameMr: "श्री. अनिल सावंत",
    nameEn: "Shri. Anil Sawant",
    roleMr: "मा. नगराध्यक्ष",
    roleEn: "Hon. Mayor (Nagaradhyaksha)",
    subMr: "प्रशासकीय प्रमुख, वाई नगरपरिषद",
    subEn: "Elected Head, Wai Municipal Council",
    accent: "from-amber-500 to-orange-600",
    badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    photo: "/nagaradhyaksh.jpeg",
    icon: Crown,
  },
  {
    nameMr: "मुख्याधिकारी",
    nameEn: "Chief Officer",
    roleMr: "मा. मुख्याधिकारी",
    roleEn: "Hon. Chief Officer",
    subMr: "कार्यकारी प्रशासकीय अधिकारी (शासकीय)",
    subEn: "Executive Administrative Officer",
    accent: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    photo: "",
    icon: Shield,
  },
  {
    nameMr: "श्री. घनश्याम चक्के",
    nameEn: "Shri. Ghanshyam Chakke",
    roleMr: "मा. उपनगराध्यक्ष",
    roleEn: "Hon. Deputy President",
    subMr: "उपप्रशासकीय प्रमुख, वाई नगरपरिषद",
    subEn: "Deputy Head, Wai Municipal Council",
    accent: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    photo: "/upnagaradhyaksh.jpeg",
    icon: UserCheck,
  },
  {
    nameMr: "नगरसचिव",
    nameEn: "Municipal Secretary",
    roleMr: "मा. नगरसचिव",
    roleEn: "Hon. Municipal Secretary",
    subMr: "प्रशासकीय सचिवालयाचे प्रमुख",
    subEn: "Administrative Secretariat Head",
    accent: "from-purple-500 to-pink-600",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    photo: "",
    icon: Shield,
  },
];

const LeadershipSection = () => {
  const { lang, t } = useLanguage();

  return (
    <section className="py-14 bg-gradient-to-b from-background via-muted/40 to-background border-b relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("नगरपरिषद नेतृत्व", "Municipal Leadership")}</span>
          </div>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {t("वाई नगरपरिषदेचे प्रमुख नेतृत्व", "Key Leadership of Wai Council")}
          </h2>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">
            {t("पारदर्शक, सक्षम व गतिमान नागरी विकासासाठी तत्पर पदाधिकारी", "Dedicated leadership serving the people of Wai")}
          </p>
        </div>

        {/* Featured Nagaradhyaksha Card (Mayor) */}
        <div className="max-w-2xl mx-auto mb-10">
          {(() => {
            const leader = LEADERS[0];
            const name = lang === "mr" ? leader.nameMr : leader.nameEn;
            const role = lang === "mr" ? leader.roleMr : leader.roleEn;
            const sub = lang === "mr" ? leader.subMr : leader.subEn;
            return (
              <div className="relative bg-card rounded-3xl p-6 md:p-8 border-2 border-amber-500/30 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none" />

                {/* Photo with Gradient Ring */}
                <div className="relative flex-shrink-0">
                  <div className={`w-36 h-36 md:w-44 md:h-44 rounded-2xl bg-gradient-to-tr ${leader.accent} p-1 shadow-xl group-hover:scale-105 transition-transform duration-300`}>
                    {leader.photo ? (
                      <img src={leader.photo} alt={name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-card flex items-center justify-center text-5xl">👤</div>
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="text-center md:text-left space-y-2 flex-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${leader.badgeBg}`}>
                    <Crown className="w-3.5 h-3.5" />
                    {role}
                  </span>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">{name}</h3>
                  <p className="text-sm font-medium text-muted-foreground">{sub}</p>
                  <p className="text-xs text-muted-foreground/80 italic pt-2 border-t border-border">
                    {t('"वाई शहराचा शाश्वत विकास व स्वच्छतेला सर्वोच्च प्राधान्य."', '"Prioritizing sustainable development & cleanliness in Wai city."')}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Grid for Remaining Officers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {LEADERS.slice(1).map((leader, i) => {
            const name = lang === "mr" ? leader.nameMr : leader.nameEn;
            const role = lang === "mr" ? leader.roleMr : leader.roleEn;
            const sub = lang === "mr" ? leader.subMr : leader.subEn;
            const Icon = leader.icon;
            return (
              <div
                key={i}
                className="bg-card rounded-2xl p-5 border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden"
              >
                {/* Image */}
                <div className={`w-28 h-28 rounded-2xl bg-gradient-to-tr ${leader.accent} p-1 shadow-md mb-4 group-hover:scale-105 transition-transform`}>
                  {leader.photo ? (
                    <img src={leader.photo} alt={name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center text-4xl">👤</div>
                  )}
                </div>

                <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold border mb-2 ${leader.badgeBg}`}>
                  <Icon className="w-3 h-3" />
                  {role}
                </span>
                <h3 className="text-base font-bold text-foreground">{name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
