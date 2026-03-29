import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Users, ClipboardList, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Building2, HeartPulse, Droplets, Map, Receipt, Zap, Monitor, Flame, FileCheck, Baby, Accessibility, Wallet, Archive, HardHat, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DeptData {
  icon: LucideIcon;
  title: string; titleEn: string;
  head: string; headEn: string;
  phone: string; email?: string;
  desc: string; descEn: string;
  services: string[]; servicesEn: string[];
  hours: string; hoursEn: string;
}

const DeptPage = ({ data }: { data: DeptData }) => {
  const { t } = useLanguage();
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="gov-gradient rounded-2xl p-8 text-primary-foreground">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <data.icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t(data.title, data.titleEn)}</h1>
                <p className="text-primary-foreground/80">{t("वाई नगर परिषद, जि. सातारा", "Wai Municipal Council, Dist. Satara")}</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 leading-relaxed">{t(data.desc, data.descEn)}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Users className="w-5 h-5" /> {t("विभाग प्रमुख", "Department Head")}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl">👤</div>
                  <div>
                    <p className="font-bold">{t(data.head, data.headEn)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {data.phone}</p>
                    {data.email && <a href={`mailto:${data.email}`} className="text-xs text-primary hover:underline">{data.email}</a>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
                  <Clock className="w-4 h-4" />
                  <span>{t("कार्यालयीन वेळ", "Office Hours")}: {t(data.hours, data.hoursEn)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-3">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" /> {t("कामे व सेवा", "Duties & Services")}
                </h2>
                {data.services.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 bg-primary/5 rounded-lg p-3 hover:bg-primary/10 transition-colors">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-sm">{t(s, data.servicesEn[i])}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

const depts: Record<string, DeptData> = {
  "general-admin": {
    icon: Building2, title: "सामान्य प्रशासन विभाग", titleEn: "General Administration Department",
    head: "श्री. हर्षवर्धन मोहिते", headEn: "Shri. Harshvardhan Mohite", phone: "8149225859", email: "harshamohite1234@gmail.com",
    desc: "नगरपरिषदेचा प्रशासकीय व कार्यात्मक कारभार महाराष्ट्र नगरपरिषदा अधिनियम १९६५ नुसार चालविणे. नगरपरिषदेच्या सर्व ठरावांची अमलबजावणी, लेखे व अभिलेखे ठेवणे, अंदाजपत्रक तयार करणे व सर्व कर्मचाऱ्यांवर नियंत्रण ठेवणे.",
    descEn: "Administration of the municipality under Maharashtra Municipal Councils Act 1965. Implementation of all resolutions, maintaining accounts and records, preparing budgets and controlling all staff.",
    services: ["नगरपरिषद ठरावांची अमलबजावणी", "लेखे व अभिलेखे व्यवस्थापन", "वार्षिक अंदाजपत्रक तयार करणे", "कर्मचारी नियंत्रण व व्यवस्थापन", "माहिती अधिकार (RTI) अर्ज", "सभा आयोजन व इतिवृत्त", "ना-हरकत दाखले"],
    servicesEn: ["Implementation of council resolutions", "Accounts & records management", "Annual budget preparation", "Staff control & management", "Right to Information (RTI)", "Meeting organization & minutes", "No-objection certificates"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  health: {
    icon: HeartPulse, title: "आरोग्य व स्वच्छता विभाग", titleEn: "Health and Sanitation Department",
    head: "श्री. विजय मारुडा", headEn: "Mr. Vijay Maruda", phone: "9823447878", email: "waimunicipalcouncil@gmail.com",
    desc: "गावातील रस्ते, बाजार, गटारी यांची साफसफाई सकाळी ६ ते ११ व दुपारी ३ ते ४ दरम्यान केली जाते. कचरा ट्रॅक्टर व ऑटोरिक्षाद्वारे कचरा डेपोत नेला जातो. सण/उत्सव/यात्रा प्रसंगी विशेष साफसफाई व जंतूनाशक फवारणी केली जाते.",
    descEn: "Cleaning of roads, markets and drains from 6-11 AM and 3-4 PM. Waste transported to depot via tractor and auto-rickshaw. Special cleaning and disinfection during festivals and fairs.",
    services: ["रस्ते व बाजार साफसफाई", "कचरा संकलन व विल्हेवाट", "गटारी सफाई", "मुताऱ्या व संडास सफाई", "जंतूनाशक फवारणी", "अन्न परवाना", "रोग प्रतिबंधक उपाययोजना"],
    servicesEn: ["Road & market cleaning", "Waste collection & disposal", "Drain cleaning", "Toilet & urinal cleaning", "Disinfectant spraying", "Food license", "Disease prevention measures"],
    hours: "सकाळी 6:00 - दुपारी 4:00", hoursEn: "6:00 AM - 4:00 PM",
  },
  water: {
    icon: Droplets, title: "पाणी पुरवठा विभाग", titleEn: "Water Supply Department",
    head: "श्रीमती. शीतल जाधव", headEn: "Mrs. Shital Jadhav", phone: "8668994187", email: "waimunicipalcouncil@gmail.com",
    desc: "शहराला सुरळीत पाणी पुरवठा होण्यासाठी लागणारी यंत्रणा राबविणे. जलशुद्धीकरण केंद्रावरील इलेक्ट्रॉनिक पंपाची निगा राखणे. नळ जोडणी धारकांचे पाणीपट्टी रजिस्टर ठेवणे व वसुली करणे.",
    descEn: "Operating the water supply system for the city. Maintaining electronic pumps at the water purification center. Maintaining water connection registers and collecting water charges.",
    services: ["नवीन नळ जोडणी", "पाणी बिल भरणा व वसुली", "जलशुद्धीकरण केंद्र देखभाल", "पंप देखभाल व दुरुस्ती", "पाणी गुणवत्ता तपासणी", "टँकर फी भरणा", "जलवाहिनी दुरुस्ती"],
    servicesEn: ["New water connection", "Water bill payment & collection", "Water purification center maintenance", "Pump maintenance & repair", "Water quality testing", "Tanker fee payment", "Pipeline repair"],
    hours: "24/7 आणीबाणी सेवा", hoursEn: "24/7 Emergency Service",
  },
  civil: {
    icon: HardHat, title: "बांधकाम (सिव्हिल) विभाग", titleEn: "Civil Department",
    head: "श्रीमती. कोमल सबाळे", headEn: "Mrs. Komal Sabale", phone: "8796469477", email: "komalsabale5@gmail.com",
    desc: "रस्ते, गटार, पूल, इमारती, दुकान केंद्रे यांचे बांधकाम व दुरुस्तीसाठी आराखडे व अंदाजपत्रक तयार करणे. निविदा मागवणे, कार्यादेश देणे, बांधकामावर नियंत्रण ठेवणे व मोजमाप घेणे.",
    descEn: "Preparing plans and estimates for construction and repair of roads, drains, bridges, buildings and shops. Inviting tenders, issuing work orders, supervising construction and taking measurements.",
    services: ["रस्ते बांधकाम व दुरुस्ती", "गटार व पूल बांधकाम", "बांधकाम परवाना", "इमारत नकाशा मंजुरी", "निविदा प्रक्रिया", "रस्ता खोदाई परवानगी", "शासन योजना प्रस्ताव"],
    servicesEn: ["Road construction & repair", "Drain & bridge construction", "Construction permit", "Building plan approval", "Tender process", "Road excavation permission", "Government scheme proposals"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  planning: {
    icon: Map, title: "नगररचना विभाग", titleEn: "Town Planning Department",
    head: "श्री. सर्वेश खाडे", headEn: "Mr. Sarvesh Khade", phone: "7057431200", email: "sskhade2141@gmail.com",
    desc: "नगरपरिषद अंतर्गत सर्व विकास कामांच्या परवानग्या, विकास योजना प्रस्ताव छाननी, विकास आराखडा विषयक बाबी, आरक्षण जागा संपादन/हस्तांतरण, अनधिकृत बांधकामावर कार्यवाही व मालमत्ता मूल्यनिर्धारण.",
    descEn: "Permissions for all development works, scrutiny of development scheme proposals, development plan matters, reservation land acquisition/transfer, action on unauthorized constructions and property valuation.",
    services: ["विकास परवानगी", "विकास आराखडा माहिती", "आरक्षण जागा संपादन", "अनधिकृत बांधकाम कारवाई", "मालमत्ता मूल्यनिर्धारण", "ना-हरकत प्रमाणपत्र", "भूखंड वापर बदल"],
    servicesEn: ["Development permission", "Development plan information", "Reservation land acquisition", "Action on unauthorized construction", "Property valuation", "No objection certificate", "Land use change"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  tax: {
    icon: Receipt, title: "कर व मूल्यांकन विभाग", titleEn: "Tax and Assessment Department",
    head: "श्री. बाळासाहेब कांबळे", headEn: "Mr. Balasaheb Kambale", phone: "9623417205", email: "bgkamble11@gmail.com",
    desc: "महाराष्ट्र नगरपरिषदा अधिनियम १९६५ कलम १०५ ते १२७ व १४९ ते १७२ नुसार इमारतींवर कर आकारणी, आकारणी रजिस्टर, मालमत्ता कर वसुली, बिल वितरण, मागणी नोटीसा व जप्ती कारवाई.",
    descEn: "Property tax assessment under Maharashtra Municipal Councils Act 1965 sections 105-127 and 149-172. Maintaining assessment registers, collecting property tax, issuing bills, demand notices and seizure action.",
    services: ["मालमत्ता कर आकारणी", "मालमत्ता कर भरणा", "कर दाखला", "नवीन मालमत्ता नोंदणी", "थकबाकी वसुली", "दर चतुर्थ वार्षिक फेर आकारणी", "कर माफी अर्ज"],
    servicesEn: ["Property tax assessment", "Property tax payment", "Tax certificate", "New property registration", "Arrears collection", "Quadrennial reassessment", "Tax exemption application"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  electrical: {
    icon: Zap, title: "विद्युत विभाग", titleEn: "Electrical Department",
    head: "श्री. महेश सावळकर", headEn: "Mr. Mahesh Sawalkar", phone: "9922097539", email: "maheshsawalkar700@gmail.com",
    desc: "शहरातील पथदिव्यांची देखभाल व दुरुस्ती करणे. नगरपरिषद मालकीच्या सर्व आस्थापना व पाणीपुरवठा यंत्रणेची विद्युत देखभाल व दुरुस्ती करणे.",
    descEn: "Maintenance and repair of street lights in the city. Electrical maintenance and repair of all municipal establishments and water supply systems.",
    services: ["पथदिवे देखभाल व दुरुस्ती", "नवीन दिवे बसवणे", "LED रूपांतरण", "नगरपरिषद आस्थापना विद्युत देखभाल", "पाणीपुरवठा विद्युत देखभाल", "विद्युत तक्रार निवारण"],
    servicesEn: ["Street light maintenance & repair", "New light installation", "LED conversion", "Municipal establishment electrical maintenance", "Water supply electrical maintenance", "Electrical complaint resolution"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  computer: {
    icon: Monitor, title: "संगणक विभाग", titleEn: "Computer Department",
    head: "श्री. नीलेश काळे", headEn: "Mr. Nilesh Kale", phone: "8329764633", email: "kalenilesh02@gmail.com",
    desc: "नगरपरिषदेकडील संगणक प्रणाली, वेब पोर्टल तसेच संबंधित हार्डवेअर व्यवस्थापन व देखभाल करणे. e-Governance, GIS व इतर ऑनलाइन सेवांचे कामकाज पाहणे.",
    descEn: "Management and maintenance of the municipality's computer systems, web portal and related hardware. Handling e-Governance, GIS and other online services.",
    services: ["संगणक प्रणाली देखभाल", "वेब पोर्टल व्यवस्थापन", "e-Governance सेवा", "GIS व्यवस्थापन", "ऑनलाइन सेवा", "डिजिटल अभिलेख", "हार्डवेअर देखभाल"],
    servicesEn: ["Computer system maintenance", "Web portal management", "e-Governance services", "GIS management", "Online services", "Digital records", "Hardware maintenance"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  fire: {
    icon: Flame, title: "अग्निशमन विभाग", titleEn: "Fire Department",
    head: "श्री. सुमित वाघ", headEn: "Mr. Sumit Wagh", phone: "9595139494", email: "waimunicipalcouncil@gmail.com",
    desc: "नगरपरिषद परिसरात अचानक लागलेल्या सार्वजनिक व खाजगी मालमत्तेची आग विझविणे. अग्निशमन अधिकारी यांच्या नियंत्रणाखाली 24/7 सेवा उपलब्ध.",
    descEn: "Extinguishing fires in public and private properties within the municipal area. 24/7 service under the control of the Fire Officer.",
    services: ["अग्निशमन सेवा (24/7)", "अग्निसुरक्षा प्रमाणपत्र", "इमारत अग्निसुरक्षा तपासणी", "आपत्ती व्यवस्थापन", "जनजागृती कार्यक्रम"],
    servicesEn: ["Fire fighting service (24/7)", "Fire safety certificate", "Building fire safety inspection", "Disaster management", "Awareness programs"],
    hours: "24/7 आणीबाणी सेवा", hoursEn: "24/7 Emergency Service",
  },
  "birth-death": {
    icon: FileCheck, title: "जन्म-मृत्यू नोंदणी विभाग", titleEn: "Birth-Death Registration Department",
    head: "नोंदणी अधिकारी", headEn: "Registration Officer", phone: "02167-220019",
    desc: "जन्म-मृत्यू अधिनियमानुसार नगरपरिषदेमध्ये घडणाऱ्या जन्म व मृत्यूची नोंद विहित अभिलेखात घेणे. मासिक अहवाल मुख्य निबंधक, आरोग्य विभाग पुणे यांना पाठवणे व नागरिकांना प्रमाणपत्र देणे.",
    descEn: "Recording births and deaths in prescribed records under the Birth-Death Act. Sending monthly reports to the Chief Registrar, Health Dept. Pune and issuing certificates to citizens.",
    services: ["जन्म नोंदणी", "मृत्यू नोंदणी", "जन्म दाखला", "मृत्यू दाखला", "उपजत मृत्यू नोंद", "दाखला दुरुस्ती", "मासिक अहवाल"],
    servicesEn: ["Birth registration", "Death registration", "Birth certificate", "Death certificate", "Still birth record", "Certificate correction", "Monthly reports"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  accounts: {
    icon: Wallet, title: "लेखा विभाग", titleEn: "Accounts Department",
    head: "लेखाधिकारी", headEn: "Accounts Officer", phone: "02167-220020",
    desc: "महाराष्ट्र लेखासंहिता नियम १९७१ नुसार नगरपरिषदेचे वित्तीय अभिलेख ठेवणे. मालमत्ता कर, पाणीपट्टी, बांधकाम परवानगी शुल्क, बाजार फी इत्यादी उत्पन्न स्वीकारणे व बँकेत जमा करणे.",
    descEn: "Maintaining financial records under Maharashtra Accounts Code Rules 1971. Accepting income from property tax, water charges, construction fees, market fees etc. and depositing in bank.",
    services: ["मालमत्ता कर भरणा स्वीकारणे", "पाणीपट्टी भरणा", "बांधकाम परवानगी शुल्क", "बाजार फी वसुली", "कर्मचारी वेतन बिल", "भविष्य निर्वाह निधी", "वार्षिक अंदाजपत्रक", "लेखापरिक्षण पूर्तता"],
    servicesEn: ["Property tax collection", "Water charge payment", "Construction permission fee", "Market fee collection", "Staff salary bills", "Provident fund", "Annual budget", "Audit compliance"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  records: {
    icon: Archive, title: "अभिलेख कक्ष विभाग", titleEn: "Records Department",
    head: "अभिलेख लिपिक", headEn: "Records Clerk", phone: "02167-220021",
    desc: "कार्यालयीन दफ्तर, नस्ती, दस्तऐवज, नोंदणी दस्त, नमुन्यांच्या नोंदवह्या सुरक्षित ठेवणे व देखभाल करणे. अ.ब.क.ड. वर्गीकरण करणे व सुरक्षित ठेवणे.",
    descEn: "Safe keeping and maintenance of office files, documents, registration deeds and record books. Classification into A, B, C, D categories and safe storage.",
    services: ["दफ्तर व नस्ती व्यवस्थापन", "दस्तऐवज सुरक्षित ठेवणे", "अ.ब.क.ड. वर्गीकरण", "नोंदणी दस्त देखभाल", "जुने अभिलेख उपलब्ध करणे"],
    servicesEn: ["File & document management", "Safe document storage", "A,B,C,D classification", "Registration deed maintenance", "Providing old records"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  disabled: {
    icon: Accessibility, title: "दिव्यांग विभाग", titleEn: "Disabled Persons Department",
    head: "समाज कल्याण अधिकारी", headEn: "Social Welfare Officer", phone: "02167-220022",
    desc: "नगरपरिषद हद्दीतील दिव्यांग नागरिकांना ५% मदत देण्याची कार्यवाही करणे तसेच इतर शासकीय लाभ मिळवून देण्यास मदत करणे.",
    descEn: "Processing 5% assistance for disabled citizens within the municipal limits and helping them avail other government benefits.",
    services: ["दिव्यांग ५% मदत अर्ज", "शासकीय योजना लाभ", "दिव्यांग प्रमाणपत्र सहाय्य", "पुनर्वसन मदत"],
    servicesEn: ["Disabled 5% assistance application", "Government scheme benefits", "Disability certificate assistance", "Rehabilitation assistance"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
  women: {
    icon: Baby, title: "महिला व बाल कल्याण विभाग", titleEn: "Women & Child Welfare Department",
    head: "महिला कल्याण अधिकारी", headEn: "Women Welfare Officer", phone: "02167-220023",
    desc: "नगरपरिषद परिसरात महिला व बाल कल्याण विषयक योजना राबविणे. महिलांच्या विकासाच्या अनुषंगाने कामे करणे.",
    descEn: "Implementing women and child welfare schemes in the municipal area. Working towards women's development.",
    services: ["महिला कल्याण योजना", "बाल कल्याण योजना", "महिला सक्षमीकरण कार्यक्रम", "शासकीय योजना लाभ", "जनजागृती कार्यक्रम"],
    servicesEn: ["Women welfare schemes", "Child welfare schemes", "Women empowerment programs", "Government scheme benefits", "Awareness programs"],
    hours: "सकाळी 10:00 - संध्याकाळी 5:45", hoursEn: "9:45 AM - 6:15 PM",
  },
};

export const GeneralAdmin = () => <DeptPage data={depts["general-admin"]} />;
export const Health = () => <DeptPage data={depts.health} />;
export const Water = () => <DeptPage data={depts.water} />;
export const Civil = () => <DeptPage data={depts.civil} />;
export const Planning = () => <DeptPage data={depts.planning} />;
export const Tax = () => <DeptPage data={depts.tax} />;
export const Electrical = () => <DeptPage data={depts.electrical} />;
export const Computer = () => <DeptPage data={depts.computer} />;
export const Fire = () => <DeptPage data={depts.fire} />;
export const BirthDeath = () => <DeptPage data={depts["birth-death"]} />;
export const Accounts = () => <DeptPage data={depts.accounts} />;
export const Records = () => <DeptPage data={depts.records} />;
export const Disabled = () => <DeptPage data={depts.disabled} />;
export const WomenChild = () => <DeptPage data={depts.women} />;
