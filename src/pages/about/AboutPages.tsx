import PageLayout from "@/components/PageLayout";
import { Building2, Users, MapPin, Phone, Award, Landmark, BookOpen, Crown, Shield, UserCheck, Calendar, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import React from "react";
import { COUNCILLORS_LIST } from "@/data/councillorsData";

export const Introduction = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="relative overflow-hidden py-12">
        <div className="container mx-auto px-4 relative">
          {/* Header Banner */}
          <div className="max-w-4xl mx-auto text-center mb-12 bg-card rounded-3xl p-8 border border-border shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-bl-full pointer-events-none" />
            <div className="w-20 h-20 rounded-2xl gov-gradient mx-auto mb-5 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
              <Landmark className="w-3.5 h-3.5" />
              {t("नगरपालिका परिचय", "Municipal Introduction")}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-2">{t("वाई नगरपरिषद", "Wai Municipal Council")}</h1>
            <p className="text-sm md:text-base text-muted-foreground font-medium">{t("जिल्हा सातारा, महाराष्ट्र | स्थापना: इ.स. १८५२ (१८५२ सालापासून कार्यरत)", "District Satara, Maharashtra | Est: 1852 AD")}</p>
          </div>

          {/* Stats Bar Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {[
              { icon: Landmark, value: "170+", label: t("वर्षे परंपरा व सेवा", "Years of Heritage"), color: "text-amber-500 bg-amber-500/10 border-amber-500/30" },
              { icon: Users, value: "40,000+", label: t("नागरिक लोकसंख्या", "Citizen Population"), color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30" },
              { icon: MapPin, value: "17", label: t("प्रकीय प्रभाग / वार्ड", "Municipal Wards"), color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-card rounded-2xl p-6 border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
                  <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center border ${s.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <p className="text-3xl font-black text-foreground font-mono">{s.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Intro Card */}
          <div className="bg-card rounded-3xl p-6 md:p-10 border border-border shadow-xl max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2 border-b border-border pb-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <span>{t("नगरपालिकेचा सविस्तर परिचय", "Overview of the Municipality")}</span>
            </h2>
            
            <p className="text-muted-foreground leading-relaxed text-base">
              {t(
                'वाई नगरपरिषद ही महाराष्ट्र राज्यातील सातारा जिल्ह्यातील एक प्रमुख व ऐतिहासिक नगरपालिका आहे. कृष्णा नदीच्या तीरावर वसलेले हे शहर आपल्या विपुल मंदिरांमुळे व संस्कृतीमुळे "दक्षिण काशी" म्हणून ओळखले जाते.',
                'Wai Municipal Council is a historic municipality in Satara district of Maharashtra. Situated on the banks of the Krishna River, the city is widely celebrated as "Dakshin Kashi" (Southern Kashi).'
              )}
            </p>
            
            <p className="text-muted-foreground leading-relaxed text-base">
              {t(
                "नगरपालिकेची स्थापना इ.स. १८५२ मध्ये झाली असून ती महाराष्ट्रातील सर्वात जुन्या कार्यक्षम नगरपालिकांपैकी एक आहे. सुरक्षित पाणीपुरवठा, स्वच्छता, रस्ते व पूल बांधकाम, आधुनिक दिवाबत्ती, आरोग्य सेवा आणि शहर नियोजन ही नगरपालिकेची प्राथमिक कर्तव्ये आहेत.",
                "Established in 1852 AD, it is one of the oldest operating municipalities in Maharashtra, responsible for water supply, sanitation, roads, lighting, health services, and town planning."
              )}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-4">
              {[
                { icon: Phone, label: t("कार्यालय / हेल्पलाईन", "Office / Helpline"), value: "०२१६७-२२००२२ / १८००२३३२२१" },
                { icon: MapPin, label: t("मुख्य कार्यालय पत्ता", "Main Office Address"), value: t("४४३, मधली आळी, गणपती आळी, वाई, जिल्हा सातारा - ४१२८०३", "443, Madhli Aali, Ganpati Aali, Wai, Dist. Satara, 412803") },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={i} className="flex items-center gap-3 bg-muted/60 rounded-2xl p-4 border border-border">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{c.label}</p>
                      <p className="font-bold text-sm text-foreground">{c.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export const History = () => {
  const { t } = useLanguage();

  const sections = [
    {
      era: t("प्राचीन व पौराणिक काळ", "Ancient & Mythological Era"),
      year: t("पौराणिक", "Ancient"),
      emoji: "🏛️",
      points: [
        t("पांडव अज्ञातवासात असताना वाईजवळील पांडवगड परिसरात राहिले अशी मान्यता आहे. भीमकुंड व कृष्णा नदीचा परिसर या पौराणिक कथांशी जोडलेला आहे.",
          "The Pandavas lived near Pandavgad fort during their exile. Bhimkund & Krishna banks are tied to these legends."),
        t("वाई परिसरातील पर्वतरांगांमध्ये प्राचीन लेणी असून बुद्ध कालखंडातील स्थापत्याचा अमूल्य वारसा येथे जतन केलेला आहे.",
          "Ancient caves in Wai hills reflect rich Buddhist heritage from early eras."),
      ],
    },
    {
      era: t("मध्ययुगीन व आदिलशाही काळ", "Medieval & Sultanate Era"),
      year: t("१०वे - १५वे शतक", "10th–15th Century"),
      emoji: "⚔️",
      points: [
        t("कोल्हापूरच्या शिलाहार राजांनी १०व्या ते १३व्या शतकात पांडवगड व वैराटगड किल्ल्यांचे बांधकाम केले.",
          "Shilahara kings constructed Pandavgad and Vairatgad forts from 10th to 13th centuries."),
        t("१५व्या शतकापासून वाई आदिलशाहीच्या नियंत्रणाखाली आले. अफझल खान वाईचा सुभेदार म्हणून कार्यरत होता.",
          "Wai came under Adilshahi rule; Afzal Khan served as the Subedar of Wai."),
      ],
    },
    {
      era: t("मराठा साम्राज्य व पेशवे काळ (सुवर्णकाळ)", "Maratha Empire & Peshwa Era"),
      year: t("१७वे - १८वे शतक", "17th–18th Century"),
      emoji: "👑",
      points: [
        t("पेशवे काळात पुणे शहराखालोखाल वाईला अनन्यसाधारण महत्त्व प्राप्त झाले. रास्ते घराण्याने भव्य वाडे, रस्ते व कृष्णा घाटांची निर्मिती केली.",
          "Wai became a crucial center next to Pune under the Peshwas. Raste family constructed grand wadas and ghats."),
        t("संस्कृत वेद, शास्त्र व पुराणांच्या अध्ययनामुळे शहराला 'दक्षिण काशी' म्हणून मान्यता मिळाली. 'प्राज्ञ पाठशाळा' आजही प्रसिद्ध आहे.",
          "Prominence of Vedic learning earned Wai the title 'Dakshin Kashi'. 'Pradnya Pathshala' continues this tradition."),
      ],
    },
    {
      era: t("नाना फडणवीस व मेणवली वाडा", "Nana Fadnavis & Menawali"),
      year: t("१८वे शतक", "18th Century"),
      emoji: "🏯",
      points: [
        t("पेशव्यांचे मुत्सद्दी मंत्री नाना फडणवीस यांनी वाईजवळ ऐतिहासिक मेणवली वाडा व कृष्णा नदीकाठी विष्णू-शिव मंदिरे उभारली.",
          "Peshwa minister Nana Fadnavis built Menawali Wada and temples on the Krishna riverbanks."),
        t("चिमाजी अप्पांनी वसईच्या लढाईत जिंकलेली भव्य पोर्तुगीज घंटा येथील घाटावर स्थापित करण्यात आली आहे.",
          "The historic Portuguese bell won by Chimaji Appa at Vasai battle is preserved here."),
      ],
    },
    {
      era: t("नगरपालिका स्थापना", "Municipal Establishment"),
      year: "1852 AD",
      emoji: "🏛️",
      points: [
        t("इ.स. १८५२ मध्ये ब्रिटिश राजवटीत वाई नगरपालिकेची स्थापना करण्यात आली — महाराष्ट्रातील सर्वात जुन्या नगरपालिकांपैकी एक.",
          "Wai Municipality established in 1852 AD, making it one of Maharashtra's oldest civic bodies."),
      ],
    },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Banner */}
        <div className="gov-gradient rounded-3xl p-8 text-primary-foreground text-center mb-12 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-black mb-2">{t("वाई शहराचा ऐतिहासिक वारसा", "History of Wai City")}</h1>
          <p className="text-primary-foreground/90 text-sm md:text-base max-w-2xl mx-auto">
            {t(
              "कृष्णाकाठावरील 'दक्षिण काशी' — शतकानुशतकांचा समृद्ध धार्मिक, राजकीय व सांस्कृतिक इतिहास",
              "Exploring centuries of rich religious, political, and cultural heritage on Krishna banks"
            )}
          </p>
        </div>

        {/* Timeline List Cards */}
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-card rounded-2xl p-6 border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl p-2 rounded-xl bg-primary/10 border border-primary/20">{section.emoji}</span>
                <div>
                  <span className="text-xs font-extrabold font-mono px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {section.year}
                  </span>
                  <h3 className="text-lg font-extrabold text-foreground mt-0.5">{section.era}</h3>
                </div>
              </div>

              <ul className="space-y-2 pt-2 border-t border-border/60">
                {section.points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export const Structure = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5" />
            {t("प्रशासकीय आराखडा", "Administrative Hierarchy")}
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">{t("प्रशासकीय रचना", "Administrative Structure")}</h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-1">{t("वाई नगरपरिषदेचे प्रशासकीय कामकाज लोकशाही व पारदर्शक तत्त्वांवर चालते.", "Democratic & transparent administrative structure of Wai Council")}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Mayor Node */}
          <div className="flex justify-center">
            <div className="bg-card border-2 border-amber-500/40 rounded-3xl p-6 text-center shadow-xl w-72 group hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto mb-3 flex items-center justify-center border border-amber-500/30">
                <Crown className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-foreground">{t("मा. लोकनियुक्त नगराध्यक्ष", "Hon. Directly Elected Mayor")}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("लोकनियुक्त नगराध्यक्ष, वाई नगरपरिषद", "Directly Elected Mayor, Wai Municipal Council")}</p>
            </div>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-border" /></div>

          {/* Level 2 Grid */}
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              { icon: Users, title: t("सर्वसाधारण सभा", "General Body"), desc: t("सर्व निर्वाचित नगरसेवक — सर्वोच्च धोरणात्मक संस्था", "Elected representatives - Main decision body") },
              { icon: Shield, title: t("मुख्याधिकारी", "Chief Officer"), desc: t("श्रीमती संजीवनी दळवी — मुख्य कार्यकारी अधिकारी", "Smt. Sanjivani Dalvi — Chief Executive Officer") },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-card rounded-2xl p-5 border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-3 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-border" /></div>

          {/* Level 3 Committees */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: t("स्थायी समिती", "Standing Committee"), desc: t("आर्थिक नियोजन", "Finance & Policy") },
              { title: t("बांधकाम समिती", "Works Committee"), desc: t("शहर पायाभूत विकास", "Civil Works") },
              { title: t("आरोग्य समिती", "Health Committee"), desc: t("स्वच्छता व आरोग्य", "Health & Sanitation") },
              { title: t("शिक्षण समिती", "Education Committee"), desc: t("शालेय उपक्रम", "Education & Culture") },
            ].map((item, idx) => (
              <div key={idx} className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center">
                <h3 className="font-bold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export const Mayor = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
            {/* Header Banner */}
            <div className="gov-gradient p-8 text-primary-foreground text-center relative">
              <div className="w-36 h-36 rounded-2xl mx-auto mb-4 border-4 border-white/30 overflow-hidden shadow-2xl">
                <img src="/nagaradhyaksh.jpeg" alt="लोकनियुक्त नगराध्यक्ष" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-black">{t("श्री. अनिल सावंत", "Shri. Anil Sawant")}</h1>
              <p className="text-primary-foreground/90 font-medium text-base mt-1">{t("मा. लोकनियुक्त नगराध्यक्ष, वाई नगरपरिषद", "Hon. Directly Elected Mayor, Wai Municipal Council")}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t("पदभार", "Designation"), value: t("मा. लोकनियुक्त नगराध्यक्ष", "Hon. Directly Elected Mayor") },
                  { label: t("कार्यालय", "Office"), value: t("मुख्य प्रशासकीय इमारत", "Main Admin Building") },
                  { label: t("ऑफिस फोन / हेल्पलाईन", "Office / Helpline"), value: "०२१६७-२२००२२ / १८००२३३२२१" },
                ].map((i, idx) => (
                  <div key={idx} className="bg-muted/60 rounded-2xl p-4 text-center border border-border">
                    <p className="text-xs font-semibold text-muted-foreground">{i.label}</p>
                    <p className="font-bold text-xs sm:text-sm text-foreground mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>{t("लोकनियुक्त नगराध्यक्षांचा संदेश", "Mayor's Message")}</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-4 text-sm md:text-base">
                  {t(
                    '"वाई शहराचा सर्वांगीण विकास हे माझे प्रथम ध्येय आहे. स्वच्छ, सुंदर आणि समर्थ वाई शहर बनवण्यासाठी आम्ही कटिबद्ध आहोत. सर्व नागरिकांच्या सहकार्याने डिजिटल सेतूद्वारे प्रशासन थेट लोकांपर्यंत पोहोचवले जात आहे."',
                    '"The holistic development of Wai city is my top priority. We are committed to making Wai a clean, beautiful, and smart city."'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export const ChiefOfficer = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
            <div className="gov-gradient p-8 text-primary-foreground text-center">
              <div className="w-36 h-36 rounded-2xl mx-auto mb-4 border-4 border-white/30 overflow-hidden shadow-2xl">
                <img src="/sanjivani_dalvi.png" alt="श्रीमती संजीवनी दळवी" className="w-full h-full object-cover object-top" />
              </div>
              <h1 className="text-3xl font-black">{t("श्रीमती संजीवनी दळवी", "Smt. Sanjivani Dalvi")}</h1>
              <p className="text-primary-foreground/90 font-medium text-base mt-1">{t("मुख्याधिकारी, वाई नगरपरिषद", "Chief Officer, Wai Municipal Council")}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t("पद", "Position"), value: t("मुख्याधिकारी", "Chief Officer") },
                  { label: t("कार्यालय", "Office Desk"), value: t("मुख्याधिकारी कक्ष", "CO Office Desk") },
                  { label: t("ऑफिस फोन / हेल्पलाईन", "Office / Helpline"), value: "०२१६७-२२००२२ / १८००२३३२२१" },
                ].map((i, idx) => (
                  <div key={idx} className="bg-muted/60 rounded-2xl p-4 text-center border border-border">
                    <p className="text-xs font-semibold text-muted-foreground">{i.label}</p>
                    <p className="font-bold text-xs sm:text-sm text-foreground mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-3">{t("प्रशासकीय जबाबदाऱ्या", "Administrative Responsibilities")}</h2>
                <ul className="space-y-2.5">
                  {[
                    t("नगरपालिकेचे संपूर्ण प्रशासकीय व वित्तीय व्यवस्थापन", "Complete administrative & financial oversight of the council"),
                    t("नागरी विकास प्रकल्पांची वेगाने अंमलबजावणी", "Fast-track execution of urban infrastructure projects"),
                    t("ऑनलाइन नागरी सेवा व डिजिटल तक्रार निवारण", "Digital citizen services & transparent complaint redressal"),
                    t("स्वच्छ भारत अभियान व पर्यावरण उपक्रम", "Swachh Bharat initiative & green Wai campaigns"),
                  ].map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export const Corporators = () => {
  const { lang, t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<"all" | "president" | "councillor" | "nominated">("all");

  const allMembers = COUNCILLORS_LIST;

  const filteredMembers = React.useMemo(() => {
    return allMembers.filter((c) => {
      const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const nameMr = c.nameMr?.toLowerCase() || "";
      const nameEn = c.nameEn?.toLowerCase() || "";
      const ward = c.ward?.toLowerCase() || "";
      const wardMr = c.wardMr?.toLowerCase() || "";
      const wardEn = c.wardEn?.toLowerCase() || "";
      const addressMr = c.addressMr?.toLowerCase() || "";
      const addressEn = c.addressEn?.toLowerCase() || "";
      const party = c.party?.toLowerCase() || "";
      const partyMr = c.partyMr?.toLowerCase() || "";
      const partyEn = c.partyEn?.toLowerCase() || "";
      const phone = c.phone?.toLowerCase() || "";

      return (
        nameMr.includes(q) ||
        nameEn.includes(q) ||
        ward.includes(q) ||
        wardMr.includes(q) ||
        wardEn.includes(q) ||
        addressMr.includes(q) ||
        addressEn.includes(q) ||
        party.includes(q) ||
        partyMr.includes(q) ||
        partyEn.includes(q) ||
        phone.includes(q)
      );
    });
  }, [allMembers, selectedCategory, searchTerm]);

  const presidents = filteredMembers.filter((c) => c.category === "president");
  const councillors = filteredMembers.filter((c) => c.category === "councillor");
  const nominated = filteredMembers.filter((c) => c.category === "nominated");

  const renderMemberCard = (c: (typeof COUNCILLORS_LIST)[0]) => {
    const isBjp = c.partyCode === "BJP" || (c.party && (c.party.includes("भाजप") || c.party.includes("BJP")));
    const isNcp = c.partyCode === "NCP" || (c.party && (c.party.includes("राष्ट्रवादी") || c.party.includes("NCP") || c.party.includes("नॅशनलिस्ट")));

    const partyBadgeStyle = isBjp
      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40"
      : isNcp
      ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/40"
      : "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40";

    const designationDisplay = lang === "mr" ? (c.designationMr || c.wardMr || c.ward) : (c.designationEn || c.wardEn || c.ward);
    const wardDisplay = lang === "mr" ? (c.wardMr || c.ward) : (c.wardEn || c.ward);
    const addressDisplay = lang === "mr" ? (c.addressMr || c.addressEn) : (c.addressEn || c.addressMr);
    const partyDisplay = lang === "mr" ? (c.partyMr || c.party) : (c.partyEn || c.party);

    return (
      <div
        key={c.id || c.order}
        className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="space-y-3">
          {/* Header Strip with Order & Party */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono text-xs font-black flex items-center justify-center">
                #{c.order}
              </span>
              <span className="text-xs font-bold text-foreground/80 bg-muted px-2.5 py-0.5 rounded-full border border-border">
                {wardDisplay || designationDisplay}
              </span>
            </div>

            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${partyBadgeStyle}`}>
              {partyDisplay}
            </span>
          </div>

          {/* Member Names */}
          <div>
            <h3 className="font-extrabold text-base md:text-lg text-foreground tracking-tight">
              {lang === "mr" ? c.nameMr : (c.nameEn || c.nameMr)}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {lang === "mr" ? c.nameEn : c.nameMr}
            </p>
          </div>

          {/* Address */}
          {addressDisplay && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="text-foreground/80">{t("पत्ता", "Address")}:</strong> {addressDisplay}
              </span>
            </div>
          )}
        </div>

        {/* Contact Strip */}
        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] font-semibold text-muted-foreground">
            {t("मोबाइल", "Mobile")}
          </span>
          {c.phone ? (
            <a
              href={`tel:${c.phone}`}
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>{c.phone}</span>
            </a>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">
              {t("मूळ यादीत उपलब्ध नाही", "Not listed")}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 md:py-14">
        {/* Main Title Banner */}
        <div className="max-w-4xl mx-auto text-center mb-8 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-3.5 h-3.5" />
            {t("लोकप्रतिनिधी मंडळ २०२५–२६", "Elected Representatives 2025–26")}
          </span>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground mb-3 tracking-tight">
            {t("वाई नगरपरिषद – अध्यक्ष व नगरसेवकांची यादी २०२५–२६", "Wai Municipal Council – President and Councillors List 2025–26")}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t(
              "वाई शहराच्या सर्वांगीण विकासासाठी व नागरी समस्या निवारणासाठी कटिबद्ध असलेले लोकप्रतिनिधी.",
              "Elected and nominated municipal leaders dedicated to the development and public service of Wai city."
            )}
          </p>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="max-w-5xl mx-auto mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/40 p-3 rounded-2xl border border-border">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
              {[
                { id: "all" as const, label: t("सर्व सदस्य (२६)", "All Members (26)") },
                { id: "president" as const, label: t("१. अध्यक्ष व उपाध्यक्ष (२)", "1. President & VP (2)") },
                { id: "councillor" as const, label: t("२. नगरसेवक यादी (२२)", "2. Councillors List (22)") },
                { id: "nominated" as const, label: t("३. नामनिर्देशित सदस्य (२)", "3. Nominated (2)") },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCategory === tab.id
                      ? "gov-gradient text-white shadow-md"
                      : "bg-card text-muted-foreground hover:text-foreground border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder={t("नाव, प्रभाग किंवा पक्षाने शोधा...", "Search by name, ward, party...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3.5 py-1.5 text-xs rounded-xl bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-5xl mx-auto space-y-10">
          {/* If viewing All category, show clean grouped sections */}
          {selectedCategory === "all" ? (
            <>
              {/* Section 1: President & Deputy President */}
              {presidents.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg md:text-xl font-black text-foreground">
                      {t("१. अध्यक्ष व उपाध्यक्ष", "1. President and Deputy President")}
                    </h2>
                    <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full ml-auto">
                      {presidents.length} {t("सदस्य", "Members")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {presidents.map(renderMemberCard)}
                  </div>
                </div>
              )}

              {/* Section 2: Councillors List */}
              {councillors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-lg md:text-xl font-black text-foreground">
                      {t("२. नगरसेवक यादी", "2. Councillors List")}
                    </h2>
                    <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-auto">
                      {councillors.length} {t("नगरसेवक", "Councillors")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {councillors.map(renderMemberCard)}
                  </div>
                </div>
              )}

              {/* Section 3: Nominated Members */}
              {nominated.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-2">
                    <Shield className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg md:text-xl font-black text-foreground">
                      {t("३. नामनिर्देशित सदस्य", "3. Nominated Members")}
                    </h2>
                    <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded-full ml-auto">
                      {nominated.length} {t("सदस्य", "Members")}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nominated.map(renderMemberCard)}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Specific Category View */
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg md:text-xl font-black text-foreground">
                  {selectedCategory === "president"
                    ? t("अध्यक्ष व उपाध्यक्ष", "President and Deputy President")
                    : selectedCategory === "councillor"
                    ? t("नगरसेवक यादी", "Councillors List")
                    : t("नामनिर्देशित सदस्य", "Nominated Members")}
                </h2>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full ml-auto">
                  {filteredMembers.length} {t("सदस्य", "Members")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map(renderMemberCard)}
              </div>
            </div>
          )}

          {filteredMembers.length === 0 && (
            <div className="p-12 text-center bg-card rounded-2xl border border-border">
              <p className="text-muted-foreground text-sm">
                {t("कोणतेही सदस्य सापडले नाहीत.", "No members found matching your search.")}
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
