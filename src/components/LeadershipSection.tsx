import { useLanguage } from "@/contexts/LanguageContext";

// Update names/photos here directly — fully static, no Firebase needed
const LEADERS = [
  {
    nameMr: "श्री. अनिल सावंत",
    nameEn: "Shri. Anil Sawant",
    roleMr: "नगराध्यक्ष",
    roleEn: "Mayor (Nagaradhyaksha)",
    subMr: "प्रशासकीय प्रमुख (निवडून आलेले)",
    subEn: "Elected President",
    accent: "#b8860b",
    photo: "/nagaradhyaksh.jpeg",
  },
  {
    nameMr: "मुख्याधिकारी नाव",
    nameEn: "Chief Officer Name",
    roleMr: "मुख्याधिकारी",
    roleEn: "Chief Officer",
    subMr: "कार्यकारी अधिकारी (शासकीय)",
    subEn: "Executive Officer",
    accent: "#1a6b3c",
    photo: "",
  },
  {
    nameMr: "उपनगराध्यक्ष नाव",
    nameEn: "Deputy President Name",
    roleMr: "उपनगराध्यक्ष",
    roleEn: "Deputy President",
    subMr: "उपप्रशासकीय प्रमुख",
    subEn: "Deputy Administrative Head",
    accent: "#c0392b",
    photo: "",
  },
  {
    nameMr: "नगरसचिव नाव",
    nameEn: "Municipal Secretary Name",
    roleMr: "नगरसचिव",
    roleEn: "Municipal Secretary",
    subMr: "प्रशासकीय सचिव",
    subEn: "Administrative Secretary",
    accent: "#2471a3",
    photo: "",
  },
];

const LeadershipSection = () => {
  const { lang } = useLanguage();

  return (
    <section className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-1">
          {lang === "mr" ? "नेतृत्व" : "Leadership"}
        </h2>
        <p className="text-center text-muted-foreground text-sm mb-10">
          {lang === "mr" ? "वाई नगर परिषदेचे प्रमुख पदाधिकारी" : "Key officials of Wai Municipal Council"}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {LEADERS.map((leader, i) => {
            const name = lang === "mr" ? leader.nameMr : leader.nameEn;
            const role = lang === "mr" ? leader.roleMr : leader.roleEn;
            const sub = lang === "mr" ? leader.subMr : leader.subEn;

            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="rounded-full p-[3px] shadow-lg mb-3"
                  style={{ background: `linear-gradient(135deg, ${leader.accent}, #ccc)` }}
                >
                  {leader.photo ? (
                    <img
                      src={leader.photo}
                      alt={name}
                      className="w-28 h-28 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-white border-4 border-white flex items-center justify-center text-5xl">
                      👤
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-bold leading-tight">{name}</h3>
                <span
                  className="mt-2 text-[11px] font-semibold px-3 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: leader.accent }}
                >
                  {role}
                </span>
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
