import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface RouteMeta {
  titleMr: string;
  titleEn: string;
  descMr: string;
  descEn: string;
}

const BASE_URL = "https://www.waimunicipalcouncil.org";

const routeMetaMap: Record<string, RouteMeta> = {
  "/": {
    titleMr: "मुख्य पृष्ठ | वाई नगरपरिषद (Wai Municipal Council)",
    titleEn: "Home | Official Website of Wai Municipal Council",
    descMr: "वाई नगरपरिषद अधिकृत संकेतस्थळ - नागरिक सेवा, मालमत्ता कर, पाणी बिल, तक्रार नोंदणी, ट्रॅकिंग, निविदा व नागरी योजना.",
    descEn: "Official website of Wai Municipal Council (वाई नगरपरिषद). Access citizen services, property tax, water bills, grievances & tenders.",
  },
  "/services/property-tax": {
    titleMr: "मालमत्ता कर भरणा व मूल्यांकन | वाई नगरपरिषद",
    titleEn: "Property Tax Assessment & Online Payment | Wai Municipal Council",
    descMr: "वाई नगरपरिषद घरपट्टी/मालमत्ता कर ऑनलाइन भरा, पावती डाउनलोड करा व कर आकारणी तपशील पहा.",
    descEn: "Pay property tax online, view assessment details, and download payment receipts for Wai Municipal Council.",
  },
  "/services/water-bill": {
    titleMr: "पाणी पुरवठा बिल भरणा | वाई नगरपरिषद",
    titleEn: "Water Bill Payment & Connections | Wai Municipal Council",
    descMr: "वाई शहर पाणी बिल ऑनलाइन भरा व नवीन नळ जोडणीसाठी अर्ज करा.",
    descEn: "Pay Wai water bills online and submit applications for new water supply connections.",
  },
  "/services/complaint": {
    titleMr: "नागरी तक्रार नोंदणी निवारण | वाई नगरपरिषद",
    titleEn: "Grievance Redressal & Complaint Registration | Wai Municipal Council",
    descMr: "शहरातील स्वच्छता, कचरा, पाणीपुरवठा, पथदिवे, रस्ते संदर्भातील तक्रार ऑनलाइन नोंदवा.",
    descEn: "Register civic complaints regarding sanitation, garbage, roads, drainage, and streetlights in Wai.",
  },
  "/services/birth-certificate": {
    titleMr: "जन्म दाखला सेवा | वाई नगरपरिषद",
    titleEn: "Birth Certificate Services | Wai Municipal Council",
    descMr: "जन्म दाखल्यासाठी ऑनलाइन अर्ज, नोंदणी तपशील व आवश्यक कागदपत्रांची माहिती.",
    descEn: "Apply for birth certificate and check registration requirements in Wai Municipal Council.",
  },
  "/services/death-certificate": {
    titleMr: "मृत्यू दाखला सेवा | वाई नगरपरिषद",
    titleEn: "Death Certificate Services | Wai Municipal Council",
    descMr: "मृत्यू दाखल्यासाठी ऑनलाइन अर्ज, पडताळणी व अधिकृत प्रमाणपत्र मिळविण्याची प्रक्रिया.",
    descEn: "Apply for death certificate and verified municipal records in Wai Municipal Council.",
  },
  "/services/construction-permit": {
    titleMr: "बांधकाम परवानगी सेवा | वाई नगरपरिषद",
    titleEn: "Building & Construction Permit | Wai Municipal Council",
    descMr: "वाई नगरपरिषद हद्दीतील बांधकाम परवानगी, भोगवटा प्रमाणपत्र व नगररचना विभागाचे नियम.",
    descEn: "Apply for building construction permits, occupancy certificates, and town planning permissions in Wai.",
  },
  "/track": {
    titleMr: "अर्ज व तक्रार स्थिती ट्रॅकिंग | वाई नगरपरिषद",
    titleEn: "Track Grievance & Application Status | Wai Municipal Council",
    descMr: "तुमच्या अर्जाचा किंवा तक्रारीचा टोकन नंबर टाकून सद्यस्थिती त्वरित तपासा.",
    descEn: "Track your civic grievance or service application status using your token number.",
  },
  "/tenders": {
    titleMr: "ई-निविदा व खरेदी सूचना | वाई नगरपरिषद",
    titleEn: "Municipal Tenders & E-Procurement | Wai Municipal Council",
    descMr: "वाई नगरपरिषदेच्या चालू व आगामी सार्वजनिक विकास कामांच्या ई-निविदा (E-Tenders).",
    descEn: "View active municipal tenders, e-procurement contracts, and bidding documents of Wai Municipal Council.",
  },
  "/portals": {
    titleMr: "शासकीय वेब पोर्टल्स | वाई नगरपरिषद",
    titleEn: "Government Citizen Portals | Wai Municipal Council",
    descMr: "महाराष्ट्र शासन व भारत सरकारच्या १२ महत्त्वाच्या नागरी सेवा पोर्टल्सच्या थेट लिंक्स.",
    descEn: "Direct access to 12 official Maharashtra and Central Government citizen portals.",
  },
  "/vikas-yojna": {
    titleMr: "शहराचा विकास आराखडा व योजना | वाई नगरपरिषद",
    titleEn: "City Development Plan & Projects | Wai Municipal Council",
    descMr: "वाई शहराचा विकास आराखडा, अमृत योजना, रस्ते व पर्यटन विकास प्रकल्प माहिती.",
    descEn: "City development plan, AMRUT infrastructure schemes, and public works projects in Wai.",
  },
  "/acts": {
    titleMr: "कायदे, नियम व अधिनियम | वाई नगरपरिषद",
    titleEn: "Acts, Municipal Laws & Regulations | Wai Municipal Council",
    descMr: "महाराष्ट्र नगरपरिषदा अधिनियम, माहिती अधिकार व सेवा हमी कायदा अधिकृत नियमावली.",
    descEn: "Maharashtra Municipal Councils Act, Right to Information (RTI), and Right to Public Services Act guidelines.",
  },
  "/laws": {
    titleMr: "नागरी कायदे व उपविधी | वाई नगरपरिषद",
    titleEn: "Civic By-Laws & Legal Rules | Wai Municipal Council",
    descMr: "नागरिकांसाठी कायदे, उपविधी, अटी व शर्ती आणि प्रशासकीय आदेश.",
    descEn: "Municipal civic bylaws, administrative orders, and regulatory compliance documents.",
  },
  "/tourism": {
    titleMr: "वाई पर्यटन, मंदिरे व ऐतिहासिक वारसा | वाई नगरपरिषद",
    titleEn: "Wai Tourism, Temples & Heritage | Wai Municipal Council",
    descMr: "दक्षिण काशी वाई - महागणपती मंदिर, कृष्णा घाट, कमळगड, धोम धरण व ऐतिहासिक पर्यटन स्थळे.",
    descEn: "Explore Wai tourism - Mahaganapati Temple, Krishna Ghats, Kamalgad, Dhom Dam, and heritage sites.",
  },
  "/gallery": {
    titleMr: "फोटो व व्हिडिओ गॅलरी | वाई नगरपरिषद",
    titleEn: "Photo & Video Gallery | Wai Municipal Council",
    descMr: "वाई शहराचे उत्सव, विकासकामे, स्वच्छता मोहिमा व ऐतिहासिक वास्तूंची छायाचित्रे.",
    descEn: "Visual gallery of Wai festivals, municipal projects, cleanliness drives, and heritage.",
  },
  "/contact": {
    titleMr: "संपर्क, पत्ता व कार्यालयीन वेळ | वाई नगरपरिषद",
    titleEn: "Contact Us & Office Address | Wai Municipal Council",
    descMr: "वाई नगरपरिषद कार्यालय पत्ता, दूरध्वनी, टोल-फ्री क्रमांक व आपत्कालीन संपर्क क्रमांक.",
    descEn: "Contact Wai Municipal Council - Address, phone numbers, toll-free helpline, and emergency SOS contacts.",
  },
  "/live-sabha": {
    titleMr: "थेट सभा व आमसभा कामकाज | वाई नगरपरिषद",
    titleEn: "Live Council Sabha & Proceedings | Wai Municipal Council",
    descMr: "वाई नगरपरिषदेच्या सर्वसाधारण सभांचे थेट प्रक्षेपण व सभेचे इतिवृत्त.",
    descEn: "Watch live council general body meetings and view meeting minutes of Wai Municipal Council.",
  },
  "/sabha-tharav": {
    titleMr: "सभा ठराव व इतिवृत्त | वाई नगरपरिषद",
    titleEn: "Sabha Resolutions & Proceedings | Wai Municipal Council",
    descMr: "नगरपरिषदेच्या सर्वसाधारण सभांमध्ये मंजूर झालेले अधिकृत ठराव व इतिवृत्त.",
    descEn: "Official council resolutions, passed orders, and municipal council proceedings.",
  },
  "/sitemap": {
    titleMr: "साइटमॅप (Sitemap) | वाई नगरपरिषद",
    titleEn: "HTML Sitemap | Wai Municipal Council",
    descMr: "वाई नगरपरिषद पोर्टलवरील सर्व सेवा, विभाग, योजना आणि पेजेसची संपूर्ण अनुक्रमणिका.",
    descEn: "Complete sitemap index of all pages, citizen services, departments, and government schemes in Wai.",
  },

  // About Pages
  "/about/introduction": {
    titleMr: "नगरपरिषद परिचय व प्रशासन | वाई नगरपरिषद",
    titleEn: "About Wai Municipal Council & Administration",
    descMr: "वाई नगरपरिषदेची स्थापना, इतिहास, प्रशासकीय रचना व ध्येय-उद्दिष्टे.",
    descEn: "History, administrative setup, vision, and governance of Wai Municipal Council.",
  },
  "/about/history": {
    titleMr: "ऐतिहासिक वारसा व वाईची पार्श्वभूमी | वाई नगरपरिषद",
    titleEn: "History & Heritage of Wai | Wai Municipal Council",
    descMr: "दक्षिण काशी म्हणून प्रसिद्ध असलेल्या वाई शहराचा गौरवशाली इतिहास व सांस्कृतिक वारसा.",
    descEn: "Glorious historical and cultural background of Wai, famously known as Dakshin Kashi.",
  },
  "/about/structure": {
    titleMr: "प्रशासकीय रचना व अधिकारी वर्ग | वाई नगरपरिषद",
    titleEn: "Administrative Structure | Wai Municipal Council",
    descMr: "मुख्याधिकारी, विभागप्रमुख व प्रशासकीय अधिकाऱ्यांची संघटनात्मक रचना.",
    descEn: "Organizational hierarchy, Chief Officer, and department heads of Wai Municipal Council.",
  },
  "/about/mayor": {
    titleMr: "नगराध्यक्ष परिचय व संदेश | वाई नगरपरिषद",
    titleEn: "Mayor / Council President Desk | Wai Municipal Council",
    descMr: "वाई नगरपरिषदेचे नगराध्यक्ष, त्यांचे विचार व नागरिकांसाठी अधिकृत संदेश.",
    descEn: "Profile, visionary message, and civic initiatives of the Mayor / Council President of Wai.",
  },
  "/about/chief-officer": {
    titleMr: "मुख्याधिकारी संदेश व प्रशासन | वाई नगरपरिषद",
    titleEn: "Chief Officer Profile & Desk | Wai Municipal Council",
    descMr: "मुख्याधिकारी (Chief Officer) वाई नगरपरिषद - प्रशासकीय कार्यपद्धती व संपर्क.",
    descEn: "Message and administrative desk of the Chief Officer, Wai Municipal Council.",
  },
  "/about/corporators": {
    titleMr: "नगरसेवक व लोकप्रतिनिधी यादी | वाई नगरपरिषद",
    titleEn: "Elected Corporators & Councillors | Wai Municipal Council",
    descMr: "वाई नगरपरिषदेच्या विविध प्रभागांतील निवडून आलेले नगरसेवक व प्रतिनिधींची यादी.",
    descEn: "Ward-wise list of elected corporators and councillors of Wai Municipal Council.",
  },

  // Schemes Pages
  "/schemes/all": {
    titleMr: "सर्व शासकीय योजनांची यादी | वाई नगरपरिषद",
    titleEn: "All Government Welfare Schemes | Wai Municipal Council",
    descMr: "केंद्र, राज्य व स्थानिक पातळीवरील सर्व लोककल्याणकारी योजनांची संपूर्ण माहिती व अर्ज प्रक्रिया.",
    descEn: "Comprehensive list of central, state, and municipal citizen welfare schemes in Wai.",
  },
  "/schemes/central": {
    titleMr: "केंद्र शासन पुरस्कृत योजना | वाई नगरपरिषद",
    titleEn: "Central Government Schemes | Wai Municipal Council",
    descMr: "केंद्र शासनाच्या पंतप्रधान आवास योजना, स्वच्छ भारत अभियान व अमृत योजना.",
    descEn: "Central government flagship schemes implemented under Wai Municipal Council jurisdiction.",
  },
  "/schemes/state": {
    titleMr: "महाराष्ट्र शासन पुरस्कृत योजना | वाई नगरपरिषद",
    titleEn: "Maharashtra State Schemes | Wai Municipal Council",
    descMr: "महाराष्ट्र शासनाच्या विविध नागरी विकास व सामाजिक कल्याण योजनांची माहिती.",
    descEn: "Maharashtra state welfare programs and municipal development projects.",
  },
  "/schemes/local": {
    titleMr: "स्थानिक नगरपरिषद योजना | वाई नगरपरिषद",
    titleEn: "Local Municipal Welfare Schemes | Wai Municipal Council",
    descMr: "वाई नगरपरिषदेच्या स्वनिधीतून राबविण्यात येणाऱ्या स्थानिक नागरी योजना.",
    descEn: "Local welfare and community assistance schemes funded by Wai Municipal Council.",
  },
  "/schemes/pmay": {
    titleMr: "प्रधानमंत्री आवास योजना (PMAY) | वाई नगरपरिषद",
    titleEn: "Pradhan Mantri Awas Yojana (PMAY) | Wai Municipal Council",
    descMr: "सर्वांसाठी घरे - प्रधानमंत्री आवास योजना (शहरी) वाई नगरपरिषद अंतर्गत अर्ज व लाभार्थी यादी.",
    descEn: "Housing for All - PMAY Urban housing scheme details and beneficiary criteria in Wai.",
  },
  "/schemes/swachh-bharat": {
    titleMr: "स्वच्छ भारत अभियान (नागरी) | वाई नगरपरिषद",
    titleEn: "Swachh Bharat Mission (Urban) | Wai Municipal Council",
    descMr: "स्वच्छ सर्वेक्षण, घनकचरा व्यवस्थापन, सुका व ओला कचरा वर्गीकरण आणि स्वच्छता उपक्रम.",
    descEn: "Swachh Bharat Mission urban cleanliness, solid waste segregation, and sanitation drives in Wai.",
  },

  // Departments
  "/departments/establishment": {
    titleMr: "आस्थापना विभाग | वाई नगरपरिषद",
    titleEn: "Establishment Department | Wai Municipal Council",
    descMr: "वाई नगरपरिषद आस्थापना विभाग - कर्मचारी सेवा, प्रशासकीय कामकाज, सेवा ज्येष्ठता व पदभरती.",
    descEn: "Establishment Department of Wai Municipal Council - Personnel administration and staff governance.",
  },
  "/departments/election": {
    titleMr: "निवडणूक विभाग | वाई नगरपरिषद",
    titleEn: "Election Department | Wai Municipal Council",
    descMr: "वाई नगरपरिषद सार्वत्रिक निवडणूक, प्रभाग रचना, मतदार यादी व निवडणूक सूचना.",
    descEn: "Election department, ward delimitation, voter roll updates, and election circulars.",
  },
  "/departments/general-admin": {
    titleMr: "सामान्य प्रशासन विभाग | वाई नगरपरिषद",
    titleEn: "General Administration Department | Wai Municipal Council",
    descMr: "सार्वजनिक समन्वय, कार्यालयीन व्यवस्थापन व माहिती अधिकार कक्ष.",
    descEn: "General Administration Department overseeing civic coordination and public operations.",
  },
  "/departments/health": {
    titleMr: "आरोग्य व स्वच्छता विभाग | वाई नगरपरिषद",
    titleEn: "Public Health & Sanitation Department | Wai Municipal Council",
    descMr: "शहरातील स्वच्छता, कचरा संकलन, फवारणी व साथरोग नियंत्रण उपक्रम.",
    descEn: "Public health, sanitation, waste management, and disease vector control in Wai.",
  },
  "/departments/water": {
    titleMr: "पाणी पुरवठा विभाग | वाई नगरपरिषद",
    titleEn: "Water Supply Department | Wai Municipal Council",
    descMr: "पिण्याच्या पाण्याचे नियोजन, जलशुद्धीकरण केंद्र, पाईपलाईन दुरुस्ती व नळ जोडणी.",
    descEn: "Drinking water distribution, filtration plant management, and pipeline maintenance.",
  },
  "/departments/civil": {
    titleMr: "बांधकाम व सार्वजनिक कामे विभाग | वाई नगरपरिषद",
    titleEn: "Civil Engineering & Public Works Department | Wai Municipal Council",
    descMr: "शहरातील रस्ते, गटारे, पूल, सार्वजनिक इमारती व विकास कामांचे नियोजन.",
    descEn: "Civil engineering, road construction, stormwater drainage, and municipal infrastructure works.",
  },
  "/departments/planning": {
    titleMr: "नगररचना व नगर नियोजन विभाग | वाई नगरपरिषद",
    titleEn: "Town Planning & Urban Development | Wai Municipal Council",
    descMr: "शहर विकास योजना, झोनिंग, लेआउट मंजुरी व बांधकाम परवानगी नियमन.",
    descEn: "Town planning, zoning regulations, layout approvals, and urban planning compliance.",
  },
  "/departments/tax": {
    titleMr: "कर आकारणी व कर संकलन विभाग | वाई नगरपरिषद",
    titleEn: "Tax Assessment & Revenue Collection | Wai Municipal Council",
    descMr: "मालमत्ता कर, व्यवसाय कर, पाणीपट्टी व इतर स्थानिक महसूल संकलन.",
    descEn: "Property tax assessment, municipal taxes, and revenue collection department.",
  },
  "/departments/electrical": {
    titleMr: "विद्युत व पथदिवे विभाग | वाई नगरपरिषद",
    titleEn: "Electrical & Street Lighting Department | Wai Municipal Council",
    descMr: "शहरातील पथदिवे, एलईडी लाइट दुरुस्ती व विद्युत व्यवस्थापन.",
    descEn: "Public street lighting maintenance, energy efficiency, and electrical maintenance.",
  },
  "/departments/computer": {
    titleMr: "संगणक व आयटी विभाग | वाई नगरपरिषद",
    titleEn: "Computer & IT Department | Wai Municipal Council",
    descMr: "डिजिटल ई-प्रशासन, संगणकीकरण, ऑनलाइन नागरिक सेवा व डेटा सुरक्षितता.",
    descEn: "E-Governance initiatives, IT infrastructure, digital services, and portal security.",
  },
  "/departments/fire": {
    titleMr: "अग्निशामक व आपत्ती व्यवस्थापन विभाग | वाई नगरपरिषद",
    titleEn: "Fire Brigade & Disaster Management | Wai Municipal Council",
    descMr: "अग्निशामक सेवा, आपत्कालीन मदत, पूर नियंत्रण व २४x७ मदत कक्ष.",
    descEn: "Fire safety, disaster response, Krishna river flood monitoring, and 24x7 emergency helpline.",
  },
  "/departments/birth-death": {
    titleMr: "जन्म-मृत्यू नोंदणी विभाग | वाई नगरपरिषद",
    titleEn: "Birth & Death Registration Department | Wai Municipal Council",
    descMr: "जन्म व मृत्यू नोंदणी, सुधारणा, दाखला वितरण व अधिकृत सांख्यिकी.",
    descEn: "Vital statistics, birth and death registration, corrections, and certificate issuance.",
  },
  "/departments/accounts": {
    titleMr: "लेखा व वित्त विभाग | वाई नगरपरिषद",
    titleEn: "Accounts & Finance Department | Wai Municipal Council",
    descMr: "नगरपरिषदेचे वार्षिक अंदाजपत्रक (Budget), निधी नियोजन व आर्थिक ऑडिट.",
    descEn: "Municipal budgeting, financial accounting, funds management, and official audit.",
  },
  "/departments/records": {
    titleMr: "अभिलेख व दप्तर कक्ष | वाई नगरपरिषद",
    titleEn: "Records & Archives Department | Wai Municipal Council",
    descMr: "ऐतिहासिक कागदपत्रे, नकाशे व शासकीय दस्तऐवजांचे जतन व पडताळणी.",
    descEn: "Archival preservation, historical municipal records, land survey maps, and file retrieval.",
  },
  "/departments/disabled": {
    titleMr: "दिव्यांग कल्याण विभाग | वाई नगरपरिषद",
    titleEn: "Divyang Welfare Department | Wai Municipal Council",
    descMr: "दिव्यांगांसाठी ५% राखीव निधी योजना, मदत व सक्षमीकरण उपक्रम.",
    descEn: "5% reserved fund schemes, assistive devices, and welfare initiatives for differently-abled citizens.",
  },
  "/departments/women": {
    titleMr: "महिला व बालकल्याण विभाग | वाई नगरपरिषद",
    titleEn: "Women & Child Development Department | Wai Municipal Council",
    descMr: "महिला बचत गट, बालकल्याण उपक्रम, प्रशिक्षण व आर्थिक स्वावलंबन योजना.",
    descEn: "Self-help groups (SHG), women empowerment, child welfare, and skill training programs.",
  },
};

/**
 * Dynamic SEO Updater:
 * Ensures every single page has its own unique Title, Meta Description,
 * OpenGraph tags, and EXACT canonical URL so Google Search Console can index every page.
 */
export const SeoUpdater = () => {
  const location = useLocation();
  const { language } = useLanguage();

  useEffect(() => {
    const pathname = location.pathname;
    const meta = routeMetaMap[pathname] || {
      titleMr: "वाई नगरपरिषद | अधिकृत नागरिक सेवा पोर्टल",
      titleEn: "Wai Municipal Council | Official Citizen Portal",
      descMr: "वाई नगरपरिषद अधिकृत संकेतस्थळ - नागरिक सेवा, ऑनलाइन तक्रार, पाणी बिल व योजना.",
      descEn: "Official website of Wai Municipal Council. Access online civic services and administration.",
    };

    const title = language === "mr" ? meta.titleMr : meta.titleEn;
    const desc = language === "mr" ? meta.descMr : meta.descEn;
    const canonicalUrl = `${BASE_URL}${pathname === "/" ? "" : pathname}`;

    // 1. Update Title
    document.title = title;

    // 2. Update Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", desc);

    // 3. Update or create Canonical Tag for the current route
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // 4. Update OpenGraph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", desc);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute("content", title);

    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute("content", desc);

    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) twitterUrl.setAttribute("content", canonicalUrl);
  }, [location.pathname, language]);

  return null;
};

export default SeoUpdater;
