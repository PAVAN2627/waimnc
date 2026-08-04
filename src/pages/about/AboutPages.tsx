import PageLayout from "@/components/PageLayout";
import { Building2, Users, MapPin, Phone, Award, Landmark, BookOpen, Crown, Shield, UserCheck, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import React from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveOfficials, type OfficialRecord } from "@/lib/officials";

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
              <Sparkles className="w-3.5 h-3.5" />
              {t("नगरपालिका परिचय", "Municipal Introduction")}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-2">{t("वाई नगर परिषद", "Wai Municipal Council")}</h1>
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
                'वाई नगर परिषद ही महाराष्ट्र राज्यातील सातारा जिल्ह्यातील एक प्रमुख व ऐतिहासिक नगरपालिका आहे. कृष्णा नदीच्या तीरावर वसलेले हे शहर आपल्या विपुल मंदिरांमुळे व संस्कृतीमुळे "दक्षिण काशी" म्हणून ओळखले जाते.',
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
                { icon: Phone, label: t("२४x७ मदत कक्ष", "24x7 Helpline"), value: "02167-220000" },
                { icon: MapPin, label: t("मुख्य कार्यालय पत्ता", "Main Office Address"), value: t("५८७b, मोतीबाग रोड, दाणेबाजार, वाई ४१२८०३", "587b, Motibag Rd, Danebazar, Wai 412803") },
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
          <p className="text-muted-foreground text-xs md:text-sm mt-1">{t("वाई नगर परिषदेचे प्रशासकीय कामकाज लोकशाही व पारदर्शक तत्त्वांवर चालते.", "Democratic & transparent administrative structure of Wai Council")}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Mayor Node */}
          <div className="flex justify-center">
            <div className="bg-card border-2 border-amber-500/40 rounded-3xl p-6 text-center shadow-xl w-72 group hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto mb-3 flex items-center justify-center border border-amber-500/30">
                <Crown className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-lg text-foreground">{t("मा. नगराध्यक्ष", "Mayor")}</h3>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("लोकप्रतिनिधी प्रमुख", "Elected President")}</p>
            </div>
          </div>

          <div className="flex justify-center"><div className="w-0.5 h-8 bg-border" /></div>

          {/* Level 2 Grid */}
          <div className="grid md:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              { icon: Users, title: t("सर्वसाधारण सभा", "General Body"), desc: t("सर्व निर्वाचित नगरसेवक — सर्वोच्च धोरणात्मक संस्था", "Elected representatives - Main decision body") },
              { icon: Shield, title: t("मुख्याधिकारी", "Chief Officer"), desc: t("प्रशासकीय प्रमुख — कार्यकारी प्रशासकीय अधिकारी", "Chief Executive Administrative Officer") },
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
                <img src="/nagaradhyaksh.jpeg" alt="नगराध्यक्ष" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-black">{t("श्री. अनिल सावंत", "Shri. Anil Sawant")}</h1>
              <p className="text-primary-foreground/90 font-medium text-base mt-1">{t("मा. नगराध्यक्ष, वाई नगर परिषद", "Hon. Mayor, Wai Municipal Council")}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t("पदभार", "Designation"), value: t("मा. नगराध्यक्ष", "Hon. Mayor") },
                  { label: t("कार्यालय", "Office"), value: t("मुख्य प्रशासकीय इमारत", "Main Admin Building") },
                  { label: t("संपर्क", "Helpline"), value: "02167-220000" },
                ].map((i, idx) => (
                  <div key={idx} className="bg-muted/60 rounded-2xl p-4 text-center border border-border">
                    <p className="text-xs font-semibold text-muted-foreground">{i.label}</p>
                    <p className="font-bold text-sm text-foreground mt-0.5">{i.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <span>{t("नगराध्यक्षांचा संदेश", "Mayor's Message")}</span>
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
              <div className="w-32 h-32 rounded-2xl bg-white/20 mx-auto mb-4 flex items-center justify-center border-4 border-white/30 text-5xl">
                👤
              </div>
              <h1 className="text-3xl font-black">{t("मुख्याधिकारी", "Chief Officer")}</h1>
              <p className="text-primary-foreground/90 font-medium text-base mt-1">{t("मुख्य कार्यकारी अधिकारी, वाई नगर परिषद", "Chief Executive Officer, Wai Municipal Council")}</p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t("पद", "Position"), value: t("प्रशासकीय प्रमुख", "Executive Officer") },
                  { label: t("कार्यालय", "Office Desk"), value: t("मुख्याधिकारी कक्ष", "CO Office Desk") },
                  { label: t("संपर्क", "Helpline"), value: "02167-220000" },
                ].map((i, idx) => (
                  <div key={idx} className="bg-muted/60 rounded-2xl p-4 text-center border border-border">
                    <p className="text-xs font-semibold text-muted-foreground">{i.label}</p>
                    <p className="font-bold text-sm text-foreground mt-0.5">{i.value}</p>
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
  const [corporators, setCorporators] = React.useState<OfficialRecord[]>([]);

  React.useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToActiveOfficials(setCorporators);
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2">{t("नगरसेवक", "Corporators")}</h1>
          <p className="text-muted-foreground text-xs md:text-sm">{t("वाई नगर परिषदेचे निर्वाचित नगरसेवक", "Elected Corporators of Wai Municipal Council")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {corporators.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-4 text-center p-8 bg-card rounded-2xl border border-border">
              {t("माहिती उपलब्ध नाही.", "No corporator details available.")}
            </p>
          )}
          {corporators.map((c) => (
            <div key={c.id} className="bg-card rounded-2xl p-6 border border-border shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group">
              {c.photoBase64 ? (
                <img src={c.photoBase64} alt={c.nameMr} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border-2 border-primary shadow-md group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center text-4xl border border-primary/20 group-hover:bg-primary/20 transition-colors">👤</div>
              )}
              <h3 className="font-bold text-base text-foreground">{lang === "mr" ? c.nameMr : (c.nameEn || c.nameMr)}</h3>
              {c.ward && <p className="text-primary text-xs font-bold mt-1">{t(`वार्ड क्रमांक ${c.ward}`, `Ward ${c.ward}`)}</p>}
              {c.party && <span className="inline-block bg-primary/10 text-primary border border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-2">{c.party}</span>}
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};
