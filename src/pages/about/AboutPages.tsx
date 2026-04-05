import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, MapPin, Phone, Award, Landmark, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import React from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToActiveOfficials, type OfficialRecord } from "@/lib/officials";

export const Introduction = () => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gov-gradient opacity-10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="w-20 h-20 rounded-full gov-gradient mx-auto mb-6 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-4">{t("वाई नगर परिषद", "Wai Municipal Council")}</h1>
            <p className="text-lg text-muted-foreground">{t("जिल्हा सातारा, महाराष्ट्र | स्थापना: इ.स. 1852", "District Satara, Maharashtra | Established: 1852 AD")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Landmark, value: "170+", label: t("वर्षे सेवा", "Years of Service") },
              { icon: Users, value: "40,000+", label: t("लोकसंख्या", "Population") },
              { icon: MapPin, value: "17", label: t("वार्ड", "Wards") },
            ].map((s) => (
              <Card key={s.label} className="text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-8">
                  <s.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold text-primary">{s.value}</p>
                  <p className="text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 space-y-4">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <BookOpen className="w-6 h-6" /> {t("नगरपालिकेचा परिचय", "Introduction to the Municipality")}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {t(
                  'वाई नगर परिषद ही महाराष्ट्र राज्यातील सातारा जिल्ह्यातील एक प्रमुख नगरपालिका आहे. वाई हे कृष्णा नदीच्या तीरावर वसलेले एक ऐतिहासिक शहर आहे. या शहराला "दक्षिण काशी" म्हणूनही ओळखले जाते.',
                  'Wai Municipal Council is a major municipality in Satara district of Maharashtra state. Wai is a historic city situated on the banks of the Krishna River. The city is also known as "Dakshin Kashi" (Southern Varanasi).'
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t(
                  "नगरपालिकेची स्थापना इ.स. 1852 मध्ये झाली असून ती महाराष्ट्रातील सर्वात जुन्या नगरपालिकांपैकी एक आहे. पाणीपुरवठा, स्वच्छता, रस्ते बांधकाम, दिवाबत्ती, आरोग्य सेवा आणि शहर नियोजन ही नगरपालिकेची प्रमुख कार्ये आहेत.",
                  "The municipality was established in 1852 AD and is one of the oldest municipalities in Maharashtra. Water supply, sanitation, road construction, street lighting, health services, and urban planning are the primary functions of the municipality."
                )}
              </p>
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: Phone, label: t("संपर्क", "Contact"), value: "02167-220000" },
                  { icon: MapPin, label: t("पत्ता", "Address"), value: t("587b, मोतीबाग रोड, दाणेबाजार, गणपती आळी, वाई 412803", "587b, Motibag Rd, Danebazar, Ganpati Ali, Wai 412803") },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3 bg-muted rounded-lg p-4">
                    <c.icon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">{c.label}</p>
                      <p className="font-medium text-sm">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
      year: t("इ.स.पू.", "Ancient"),
      emoji: "🏛️",
      points: [
        t("पांडव अज्ञातवासात विराट राजाच्या पदरी राहिले — वाईजवळचा पांडवगड त्याच काळातील मानला जातो. भीमकुंड व कृष्णा नदी परिसर या कथांशी जोडलेला आहे.",
          "The Pandavas lived incognito at King Virat's court — Pandavgad near Wai is believed to be from that era. The Bhimkund and Krishna river area are linked to these legends."),
        t("वाईच्या पश्चिमेला डोंगररांगांमध्ये प्राचीन लेणी आहेत — सातवाहन काळात किंवा त्याही आधी बौद्ध धर्माचा प्रभाव येथे होता.",
          "Ancient caves exist in the hills west of Wai — evidence of Buddhist influence during the Satavahana period or earlier."),
      ],
    },
    {
      era: t("मध्ययुगीन व सुलतानी राजवट", "Medieval & Sultanate Rule"),
      year: t("१०वे - १५वे शतक", "10th–15th Century"),
      emoji: "⚔️",
      points: [
        t("१०व्या ते १३व्या शतकात कोल्हापूरच्या शिलाहार राजांचे येथे शासन होते. त्यांनीच पांडवगड व वैराटगड यांसारख्या किल्ल्यांचे बांधकाम सुरू केले.",
          "The Shilahara kings of Kolhapur ruled here from the 10th to 13th century. They initiated construction of forts like Pandavgad and Vairatgad."),
        t("१५व्या शतकानंतर वाई आदिलशाहीच्या अधिपत्याखाली आले. अफझल खान वाईचा सुभेदार होता — त्याने शिवाजी महाराजांविरुद्ध मोहिमेत वाईचा मुख्य तळ म्हणून वापर केला. 'अफझल खानाची विहीर' आजही त्या काळाची साक्ष देते.",
          "After the 15th century, Wai came under the Adilshahi. Afzal Khan was the Subedar of Wai — he used the city as his main base against Shivaji Maharaj. 'Afzal Khan's Well' still stands as a witness to that era."),
      ],
    },
    {
      era: t("मराठा साम्राज्य व पेशवे काळ (सुवर्णकाळ)", "Maratha Empire & Peshwa Era (Golden Age)"),
      year: t("१७वे - १८वे शतक", "17th–18th Century"),
      emoji: "👑",
      points: [
        t("पुण्यानंतर वाई हे पेशव्यांचे सर्वात जवळचे व महत्त्वाचे शहर बनले. सरदार रास्ते घराण्याने येथे भव्य वाडे, रस्ते व मंदिरांची निर्मिती केली.",
          "After Pune, Wai became the most important city for the Peshwas. The Raste family built grand mansions, roads and temples here."),
        t("पेशवे काळात वाई हे कर्नाटकात जाणाऱ्या सैन्यासाठी महत्त्वाचे विश्रांती स्थान व रसद केंद्र होते.",
          "During the Peshwa era, Wai was an important rest stop and supply center for armies marching to Karnataka."),
        t("'दक्षिण काशी' म्हणण्याचे मुख्य कारण — येथील संस्कृत पाठशाळा. वेद, शास्त्र व पुराणांचे गाढे अभ्यासक येथे राहत. आजही 'प्राज्ञ पाठशाला' जगभरात प्रसिद्ध आहे.",
          "The main reason for calling it 'Dakshin Kashi' — its Sanskrit schools. Deep scholars of Vedas, Shastras and Puranas lived here. The 'Pradnya Pathshala' is still world-famous."),
      ],
    },
    {
      era: t("नाना फडणवीस आणि मेनवली", "Nana Fadnavis & Menawali"),
      year: t("१८वे शतक", "18th Century"),
      emoji: "🏯",
      points: [
        t("वाईपासून अवघ्या ५ किमी अंतरावर मेनवली गाव आहे. पेशव्यांचे मुत्सद्दी मंत्री नाना फडणवीस यांनी येथे भव्य वाडा बांधला.",
          "Menawali village is just 5 km from Wai. Peshwa statesman Nana Fadnavis built his grand mansion here."),
        t("कृष्णा नदीच्या काठी त्यांनी बांधलेला घाट व दोन मंदिरे (विष्णू व शिव) आजही पर्यटकांना आकर्षित करतात.",
          "The ghat and two temples (Vishnu and Shiva) he built on the Krishna riverbank still attract tourists."),
        t("या घाटावर एक भव्य 'घंटा' आहे — जी चिमाजी अप्पांनी पोर्तुगीजांकडून वसईच्या लढाईत जिंकून आणली होती.",
          "A grand 'bell' on this ghat was won by Chimaji Appa from the Portuguese in the Battle of Vasai."),
      ],
    },
    {
      era: t("कृष्णा नदीचे घाट", "Ghats of Krishna River"),
      year: t("ऐतिहासिक", "Historic"),
      emoji: "🌊",
      points: [
        t("वाईचे सर्वात मोठे वैशिष्ट्य म्हणजे येथील ७ मुख्य घाट — संरक्षणात्मक व सामाजिक दृष्टिकोनातून बांधलेले.",
          "Wai's greatest feature is its 7 main ghats — built from a defensive and social perspective."),
        t("गणपती घाट: प्रसिद्ध महागणपती मंदिर — मूर्ती १० फूट उंच व ८ फूट रुंद, एकाच काळ्या पाषाणातून (monolithic) घडवलेली.",
          "Ganpati Ghat: Famous Mahaganpati temple — idol 10 ft tall and 8 ft wide, carved from a single black stone (monolithic)."),
        t("गंगापुरी घाट: अत्यंत देखणी मंदिरे. ब्रह्मेश्वर घाट: सर्वात जुना व शांत घाट.",
          "Gangapuri Ghat: Beautiful temples. Brahmeshwar Ghat: Oldest and most peaceful ghat."),
      ],
    },
    {
      era: t("सामाजिक व शैक्षणिक वारसा", "Social & Educational Heritage"),
      year: t("आधुनिक काळ", "Modern Era"),
      emoji: "📚",
      points: [
        t("तर्कतीर्थ लक्ष्मणशास्त्री जोशी यांनी मराठी विश्वकोशाचे (Encyclopedia) काम वाईतूनच सुरू केले — वाईचे नाव जगभरात पोहचले.",
          "Tarkatirath Laxmanshastri Joshi started the Marathi Encyclopedia (Vishwakosh) from Wai — bringing the city global recognition."),
        t("भारतीय स्वातंत्र्यलढ्यातही वाईच्या तरुणांचे मोठे योगदान होते.",
          "Wai's youth also made significant contributions to India's freedom struggle."),
      ],
    },
    {
      era: t("नगरपालिका स्थापना", "Municipality Established"),
      year: "1852",
      emoji: "🏛️",
      points: [
        t("ब्रिटिश राजवटीत वाई नगरपालिकेची स्थापना — महाराष्ट्रातील सर्वात जुन्या नगरपालिकांपैकी एक.",
          "Wai Municipality established during British rule — one of the oldest municipalities in Maharashtra."),
      ],
    },
  ];

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="gov-gradient rounded-2xl p-8 text-primary-foreground text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">{t("वाई शहराचा इतिहास", "History of Wai City")}</h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto">
            {t(
              "कृष्णा नदीच्या काठावर वसलेले 'दक्षिण काशी' — एक ऐतिहासिक, धार्मिक व सांस्कृतिक वारसा असलेले शहर",
              "'Dakshin Kashi' on the banks of the Krishna River — a city with a rich historical, religious and cultural heritage"
            )}
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto space-y-0 relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20" />
          {sections.map((section, i) => (
            <div key={i} className="relative pl-16 pb-8 group">
              <div className="absolute left-2 top-2 w-8 h-8 rounded-full bg-primary border-4 border-background z-10 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                {section.emoji}
              </div>
              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <span className="inline-block bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full mb-2">{section.year}</span>
                  <h3 className="text-lg font-bold mb-3">{section.era}</h3>
                  <ul className="space-y-2">
                    {section.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
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
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">{t("प्रशासकीय रचना", "Administrative Structure")}</h1>
        <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">{t("वाई नगर परिषदेची प्रशासकीय रचना लोकशाही तत्त्वांवर आधारित आहे.", "The administrative structure of Wai Municipal Council is based on democratic principles.")}</p>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center">
            <Card className="bg-primary text-primary-foreground w-64 text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">👑</div>
                <h3 className="font-bold text-lg">{t("नगराध्यक्ष", "Mayor")}</h3>
                <p className="text-primary-foreground/80 text-sm">{t("निर्वाचित प्रमुख", "Elected Head")}</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-8 bg-primary/30" /></div>

          <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
            {[
              { emoji: "📋", title: t("सर्वसाधारण सभा", "General Assembly"), desc: t("सर्व नगरसेवक - मुख्य निर्णय संस्था", "All corporators - Main decision-making body") },
              { emoji: "⚙️", title: t("मुख्याधिकारी", "Chief Officer"), desc: t("प्रशासकीय प्रमुख - IAS अधिकारी", "Administrative Head - IAS Officer") },
            ].map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-5 text-center">
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center"><div className="w-0.5 h-8 bg-primary/30" /></div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "💰", title: t("स्थायी समिती", "Standing Committee"), desc: t("आर्थिक निर्णय", "Financial Decisions") },
              { emoji: "🏗️", title: t("बांधकाम समिती", "Construction Committee"), desc: t("विकास कामे", "Development Works") },
              { emoji: "🏥", title: t("आरोग्य समिती", "Health Committee"), desc: t("आरोग्य सेवा", "Health Services") },
              { emoji: "📚", title: t("शिक्षण समिती", "Education Committee"), desc: t("शैक्षणिक कार्य", "Educational Activities") },
            ].map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-all hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="text-xl mb-1">{item.emoji}</div>
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
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
          <Card className="overflow-hidden">
            <div className="gov-gradient p-8 text-primary-foreground text-center">
              <div className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary-foreground/30 overflow-hidden">
                <img src="/nagaradhyaksh.jpeg" alt="नगराध्यक्ष" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold">{t("श्री. अनिल सावंत", "Shri. Anil Sawant")}</h1>
              <p className="text-primary-foreground/90 text-lg mt-1">{t("नगराध्यक्ष (Mayor), वाई नगर परिषद", "Mayor (Nagaradhyaksha), Wai Municipal Council")}</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t("कार्यकाळ", "Tenure"), value: t("2024 - वर्तमान", "2024 - Present") },
                  { label: t("पक्ष", "Party"), value: "BJP" },
                  { label: t("संपर्क", "Contact"), value: "02167-220001" },
                ].map((i) => (
                  <div key={i.label} className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground">{i.label}</p>
                    <p className="font-bold text-sm">{i.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3 text-primary">{t("संदेश", "Message")}</h2>
                <p className="text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-4">
                  {t(
                    '"वाई शहराचा सर्वांगीण विकास हे माझे ध्येय आहे. स्वच्छ, सुंदर आणि स्मार्ट वाई शहर बनवण्यासाठी आम्ही कटिबद्ध आहोत. नागरिकांच्या सहकार्याने आम्ही हे शक्य करू."',
                    '"The holistic development of Wai city is my goal. We are committed to making Wai a clean, beautiful, and smart city. With the cooperation of citizens, we will make this possible."'
                  )}
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3 text-primary">{t("प्रमुख उपलब्धी", "Key Achievements")}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    t("स्वच्छ शहर अभियान यशस्वी", "Clean City Campaign Successful"),
                    t("LED पथदिवे प्रकल्प पूर्ण", "LED Street Light Project Completed"),
                    t("नवीन पाणीपुरवठा योजना सुरू", "New Water Supply Scheme Started"),
                    t("डिजिटल नागरिक सेवा", "Digital Citizen Services"),
                  ].map((a) => (
                    <div key={a} className="flex items-center gap-2 bg-primary/5 rounded-lg p-3">
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-8 text-primary-foreground text-center">
              <div className="w-32 h-32 rounded-full bg-primary-foreground/20 mx-auto mb-4 flex items-center justify-center text-6xl border-4 border-primary-foreground/30">
                👤
              </div>
              <h1 className="text-3xl font-bold">{t("श्री. सुनील देशमुख", "Shri. Sunil Deshmukh")}</h1>
              <p className="text-primary-foreground/90 text-lg mt-1">{t("मुख्याधिकारी, वाई नगर परिषद", "Chief Officer, Wai Municipal Council")}</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: t("पद", "Position"), value: t("IAS अधिकारी", "IAS Officer") },
                  { label: t("कार्यकाळ", "Tenure"), value: t("2025 - वर्तमान", "2025 - Present") },
                  { label: t("संपर्क", "Contact"), value: "02167-220002" },
                ].map((i) => (
                  <div key={i.label} className="bg-muted rounded-lg p-4 text-center">
                    <p className="text-xs text-muted-foreground">{i.label}</p>
                    <p className="font-bold text-sm">{i.value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3 text-primary">{t("जबाबदाऱ्या", "Responsibilities")}</h2>
                <ul className="space-y-2">
                  {[
                    t("नगरपालिकेचे संपूर्ण प्रशासकीय व्यवस्थापन", "Complete administrative management of the municipality"),
                    t("विकास प्रकल्पांचे नियोजन व अंमलबजावणी", "Planning and implementation of development projects"),
                    t("कर वसुली व आर्थिक व्यवस्थापन", "Tax collection and financial management"),
                    t("नागरिक सेवांची गुणवत्ता सुनिश्चित करणे", "Ensuring quality of citizen services"),
                    t("शासकीय योजनांची अंमलबजावणी", "Implementation of government schemes"),
                  ].map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
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
        <h1 className="text-4xl font-bold text-primary mb-4 text-center">{t("नगरसेवक", "Corporators")}</h1>
        <p className="text-center text-muted-foreground mb-10">{t("वाई नगर परिषदेचे निर्वाचित नगरसेवक", "Elected Corporators of Wai Municipal Council")}</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {corporators.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-4 text-center">{t("माहिती उपलब्ध नाही.", "No data available.")}</p>
          )}
          {corporators.map((c) => (
            <Card key={c.id} className="hover:shadow-lg transition-all hover:-translate-y-1 group">
              <CardContent className="p-6 text-center">
                {c.photoBase64
                  ? <img src={c.photoBase64} alt={c.nameMr} className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-primary" />
                  : <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center text-3xl group-hover:bg-primary/20 transition-colors">👤</div>
                }
                <h3 className="font-bold">{lang === "mr" ? c.nameMr : (c.nameEn || c.nameMr)}</h3>
                {c.ward && <p className="text-primary text-sm font-medium">{t(`वार्ड ${c.ward}`, `Ward ${c.ward}`)}</p>}
                {c.party && <span className="inline-block bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full mt-1">{c.party}</span>}
                {c.phone && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};
