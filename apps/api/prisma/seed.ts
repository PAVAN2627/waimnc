import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Wai Municipal Council (वाई नगरपरिषद)...');

  // ---------------------------------------------------------------------------
  // 1. System Administrator Seeding (From environment variables only)
  // ---------------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL;
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

  if (adminEmail && adminPassword) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      await prisma.admin.create({
        data: {
          email: adminEmail,
          name: 'Chief Municipal Officer (मुख्याधिकारी)',
          passwordHash,
        },
      });
      console.log(`✅ Administrator created: ${adminEmail}`);
    } else {
      await prisma.admin.update({
        where: { email: adminEmail },
        data: { passwordHash },
      });
      console.log(`ℹ️ Administrator updated: ${adminEmail}`);
    }
  } else {
    console.log('ℹ️ Preserving existing database administrator.');
  }

  // ---------------------------------------------------------------------------
  // 2. Official Government Welfare Schemes (शासकीय व नागरी कल्याण योजना २०२६)
  // ---------------------------------------------------------------------------
  const welfareSchemesData = [
    {
      category: 'central',
      titleMr: 'प्रधानमंत्री आवास योजना (PMAY - नागरी २.०)',
      titleEn: 'Pradhan Mantri Awas Yojana (PMAY - Urban 2.0)',
      descMr: 'वाई शहरातील बेघर, झोपडपट्टी व आर्थिकदृष्ट्या दुर्बल घटकांतील (EWS/LIG) कुटुंबांना हक्काचे पक्के घरकुल उभारणीसाठी केंद्र व महाराष्ट्र शासनाचे थेट अनुदान.',
      descEn: 'Financial grant by Central & Maharashtra State Government for constructing permanent pucca houses for homeless and economically weaker sections in Wai city.',
      eligibilityMr: '१. अर्जदार वाई नगरपरिषद हद्दीतील रहिवासी असावा.\n२. कुटुंबाचे वार्षिक उत्पन्न ₹ ३,००,००० पर्यंत (EWS) किंवा ₹ ६,००,००० पर्यंत (LIG) असावे.\n३. भारतात इतरत्र कोठेही स्वतःचे किंवा कुटुंबीयांचे पक्के घर नसावे.\n४. स्वतःची अधिकृत जागा / भूखंड मालकी हक्क अथवा ७/१२ किंवा नगर भूमापन (City Survey) प्रमाणपत्र असणे आवश्यक.\n५. कुटुंबातील सर्व सदस्यांचे आधार कार्ड व बँक खाते आवश्यक.',
      eligibilityEn: '1. Resident within Wai Municipal Council limits.\n2. Annual family income up to ₹3,00,000 (EWS) or ₹6,00,000 (LIG).\n3. Must not own a pucca house anywhere in India.\n4. Valid land title / 7-12 extract / City Survey property card in Wai.\n5. Aadhaar cards and bank accounts of all family members.',
      benefitsMr: '१. घरकुल बांधकामासाठी ₹ २,५०,००० थेट बँक खात्यात अनुदान (४ टप्प्यांत जिओ-टॅगिंगनुसार).\n२. गृहकर्ज व्याज सबसिडी (CLSS) सवलत.\n३. घरकुलासाठी नगरपरिषदेमार्फत विनामूल्य नळ जोडणी व वीज कनेक्शन प्राधान्य.\n४. महिला कुटुंब प्रमुखाच्या नावावर मालकी हक्क नोंदणी.',
      benefitsEn: '1. Direct bank subsidy up to ₹2,50,000 in 4 geotagged construction phases.\n2. Interest subsidy under Credit Linked Subsidy Scheme (CLSS).\n3. Priority free water tap connection and electric metering by Wai Municipal Council.\n4. Mandatory co-ownership for female head of the family.',
      externalUrl: 'https://pmaymis.gov.in',
      status: 'active',
    },
    {
      category: 'central',
      titleMr: 'स्वच्छ भारत अभियान (वैयक्तिक शौचालय अनुदान - SBM 2.0)',
      titleEn: 'Swachh Bharat Mission (IHHL Toilet Subsidy - SBM 2.0)',
      descMr: 'वाई शहरात उघड्यावर शौचास जाणे पूर्णतः बंद करण्यासाठी व १००% स्वच्छता साध्य करण्यासाठी ज्यांच्याकडे वैयक्तिक शौचालय नाही अशा कुटुंबांना अनुदान दिले जाते.',
      descEn: 'Subsidy provided to households in Wai city without individual toilets to ensure 100% open defecation free (ODF++) city and hygienic sanitation.',
      eligibilityMr: '१. वाई नगरपरिषद क्षेत्रातील रहिवासी कुटुंब.\n२. घरात आधीपासून पक्के वैयक्तिक शौचालय नसावे.\n३. शौचालय बांधकामासाठी जागेची उपलब्धता असणे आवश्यक.\n४. आधार कार्ड, रहिवासी पुरावा व बँक पासबुक झेरॉक्स.',
      eligibilityEn: '1. Resident family within Wai Municipal limits.\n2. Household must not already have a functional private toilet.\n3. Adequate space available for toilet construction.\n4. Aadhaar card, residence proof, and bank passbook copy.',
      benefitsMr: '१. वैयक्तिक शौचालय (IHHL) बांधकामासाठी ₹ १२,००० ते ₹ १८,००० थेट बँक खात्यात अनुदान.\n२. दोन हप्त्यांत रक्कम वितरण (बांधकाम सुरू करताना व पूर्ण झाल्यावर जिओ-टॅग फोटो).\n३. नगरपरिषदेच्या सेप्टिक टँक सक्शन व प्रक्रिया प्रकल्पाची मोफत/सवलत सेवा.',
      benefitsEn: '1. Financial subsidy of ₹12,000 to ₹18,000 directly deposited in bank account.\n2. Disbursed in 2 stages upon geotagged photo verification.\n3. Wai Municipal Council Faecal Sludge Treatment Plant (FSTP) desludging support.',
      externalUrl: 'https://sbmurban.org',
      status: 'active',
    },
    {
      category: 'central',
      titleMr: 'अमृत योजना २.० (शहरी पाणीपुरवठा व कृष्णा नदी संवर्धन)',
      titleEn: 'AMRUT 2.0 Mission (Urban Water Supply & Krishna River Conservation)',
      descMr: 'वाई शहरातील प्रत्येक घराला शुद्ध पिण्याचे पाणी नळाद्वारे पुरवणे, धोम धरणातून पाणीपुरवठा बळकटीकरण, भूमिगत सांडपाणी वाहिनी व कृष्णा नदीचे प्रदूषण रोखणे.',
      descEn: 'Ensuring 100% functional household tap connections (FHTC) from Dhom Dam source, underground sewerage network, and protecting sacred Krishna river from wastewater.',
      eligibilityMr: '१. वाई शहरातील सर्व १७ प्रभागांमधील घरे, सोसायट्या व व्यावसायिक मिळकती.\n२. मालमत्ता कर व पाणीपट्टीची कोणतीही थकबाकी नसावी.\n३. नियमित नळ जोडणीसाठी अधिकृत अर्ज.',
      eligibilityEn: '1. All households, residential societies, and properties across all 17 wards of Wai.\n2. No outstanding municipal property tax or water supply dues.\n3. Formal application for meter-based connection.',
      benefitsMr: '१. २४x७ शुद्ध व सुरक्षित पिण्याचे पाणी (१३५ LPCD मानकानुसार).\n२. जुन्या गंजलेल्या जलवाहिन्या बदलून नवीन दर्जेदार जलवाहिनी नेटवर्क.\n३. भूमिगत गटार व सांडपाणी प्रक्रिया प्रकल्प (STP) द्वारे नदीचे संवर्धन व दुर्गंधी निर्मूलन.',
      benefitsEn: '1. 24x7 clean, treated, and safe drinking water as per 135 LPCD urban standard.\n2. Replacement of old pipelines with modern ductile iron network and digital meters.\n3. Krishna riverfront beautification and sewage treatment plant (STP) preventing river pollution.',
      externalUrl: 'https://amrut.gov.in',
      status: 'active',
    },
    {
      category: 'state',
      titleMr: 'संजय गांधी निराधार अनुदान योजना (महाराष्ट्र शासन)',
      titleEn: 'Sanjay Gandhi Niradhar Anudan Yojana (Govt. of Maharashtra)',
      descMr: 'अनाथ मुले, निराधार वृद्ध, विधवा, परित्यक्ता महिला, अपंग व्यक्ती व दुर्धर आजाराने ग्रस्त नागरिकांना दरमहा थेट आर्थिक निवृत्तीवेतन मदत.',
      descEn: 'Monthly financial assistance by Maharashtra Social Justice Dept to destitute persons, widows, divorced women, persons with severe illness, and disabled citizens.',
      eligibilityMr: '१. वय ६५ वर्षांपेक्षा कमी असावे (वृद्धांसाठी ६५ वर्षांवरील श्रावणबाळ योजना लागू).\n२. कुटुंब दारिद्र्यरेषेखालील (BPL) अथवा वार्षिक कौटुंबिक उत्पन्न ₹ ५०,००० पेक्षा कमी असावे.\n३. अर्जदार महाराष्ट्र राज्याचा व वाई शहराचा किमान १५ वर्षे सलग रहिवासी असावा.\n४. अनाथ, निराधार, ४०% पेक्षा जास्त दिव्यांग किंवा कर्करोग/टीबी/अर्धांगवायू आजारग्रस्त व्यक्ती.',
      eligibilityEn: '1. Age below 65 years.\n2. Family living below poverty line (BPL) or annual income not exceeding ₹50,000.\n3. Continuous domicile of at least 15 years in Maharashtra / Wai.\n4. Destitute, widows, divorced/abandoned women, 40%+ disabled, or chronically ill.',
      benefitsMr: '१. लाभार्थी व्यक्तीला दरमहा ₹ १,५०० थेट आधार लिंक बँक खात्यात जमा.\n२. कुटुंबात एकापेक्षा जास्त लाभार्थी असल्यास दरमहा ₹ २,५०० पर्यंत अनुदान.\n३. मोफत वैद्यकीय तपासणी व उपचारासाठी शासकीय रुग्णालयांत प्राधान्य.',
      benefitsEn: '1. Monthly pension of ₹1,500 deposited directly into DBT bank account.\n2. Up to ₹2,500 per month if more than one eligible beneficiary in the family.\n3. Free healthcare and diagnostic access at government hospitals.',
      externalUrl: 'https://sjsa.maharashtra.gov.in',
      status: 'active',
    },
    {
      category: 'state',
      titleMr: 'श्रावणबाळ सेवा राज्य निवृत्तीवेतन योजना (महाराष्ट्र शासन)',
      titleEn: 'Shravanbal Seva Rajya Nivruttivetan Yojana (Govt. of Maharashtra)',
      descMr: '६५ वर्षे किंवा त्याहून अधिक वयाच्या गरीब व वृद्ध नागरिकांना उतारवयात सन्मानाने जगण्यासाठी दरमहा नियमित शासकीय पेन्शन योजना.',
      descEn: 'Guaranteed monthly social security pension by Maharashtra Government for senior citizens aged 65 and above from economically weaker backgrounds.',
      eligibilityMr: '१. अर्जदाराचे वय ६५ वर्षे किंवा त्यापेक्षा जास्त असणे बंधनकारक.\n२. दारिद्र्यरेषेखालील यादीत नाव (गट अ) किंवा वार्षिक कौटुंबिक उत्पन्न ₹ ५०,००० च्या आत (गट ब).\n३. वाई / महाराष्ट्र राज्यात किमान १५ वर्षे वास्तव्याचा पुरावा (अधिवास प्रमाणपत्र / रेशन कार्ड / मतदार कार्ड).',
      eligibilityEn: '1. Age must be 65 years or above.\n2. Included in BPL list (Category A) or annual family income below ₹50,000 (Category B).\n3. Minimum 15 years domicile proof in Wai, Maharashtra.',
      benefitsMr: '१. दरमहा ₹ १,५०० थेट बँक खात्यात डीबीटी (DBT) द्वारे जमा.\n२. वाई उपजिल्हा रुग्णालय व नागरी प्राथमिक आरोग्य केंद्रात ज्येष्ठ नागरिकांसाठी मोफत ओपीडी व औषधे.\n३. वृद्ध नागरिकांसाठी सामाजिक सुरक्षा व आर्थिक स्वावलंबन.',
      benefitsEn: '1. ₹1,500 monthly pension deposited directly into bank account.\n2. Free geriatric OPD consultations, checkups, and medicines at Wai Cottage Hospital.\n3. Dignified social security and independence in old age.',
      externalUrl: 'https://sjsa.maharashtra.gov.in',
      status: 'active',
    },
    {
      category: 'local',
      titleMr: 'दिव्यांग कल्याण योजना (वाई नगरपरिषद ५% राखीव निधी)',
      titleEn: 'Divyang Kalyan Yojana (Wai Municipal Council 5% Reserved Budget)',
      descMr: 'वाई नगरपरिषदेच्या वार्षिक अर्थसंकल्पातील ५% विशेष राखीव निधीतून शहरातील दिव्यांग बंधू-भगिनींच्या सक्षमीकरणासाठी सहाय्य, साधने वाटप व कर सवलत.',
      descEn: 'Statutory 5% municipal budget allocation by Wai Municipal Council for empowerment, assistive equipment, scholarships, and self-employment of differently-abled citizens.',
      eligibilityMr: '१. किमान ४०% किंवा त्याहून अधिक दिव्यांगत्वाचे सक्षम वैद्यकीय मंडळ (Civil Surgeon) किंवा UDID कार्ड.\n२. अर्जदार वाई नगरपरिषद हद्दीतील किमान ३ वर्षे कायमस्वरूपी रहिवासी असावा.\n३. आधार कार्ड, सक्षम अपंगत्व प्रमाणपत्र, बँक पासबुक झेरॉक्स व रहिवासी दाखला.',
      eligibilityEn: '1. Minimum 40% disability certified by District Civil Surgeon or UDID Smart Card.\n2. Permanent resident of Wai Municipal Council limits for at least 3 years.\n3. Aadhaar card, disability certificate, bank passbook, and proof of residence.',
      benefitsMr: '१. दरवर्षी ₹ ६,००० ते ₹ १२,००० थेट शैक्षणिक शिष्यवृत्ती / आर्थिक अर्थसहाय्य.\n२. मोफत तीनचाकी सायकल (Tricycle), व्हीलचेअर, श्रवणयंत्र, जयपूर फूट व कृत्रिम अवयव वाटप.\n३. स्वतःच्या मालकीच्या निवासी मालमत्तेवर ५०% घरपट्टी (मालमत्ता कर) सवलत.\n४. शहरात स्वयंरोजगारासाठी नगरपरिषदेच्या जागांवर गाळे/स्टॉल वाटपात प्राधान्य.',
      benefitsEn: '1. Annual education scholarship / financial aid of ₹6,000 to ₹12,000.\n2. Free distribution of battery tricycles, wheelchairs, hearing aids, and calipers.\n3. 50% concession on municipal property tax for self-occupied residential houses in Wai.\n4. Preference in municipal vending stalls and hawker zones for self-employment.',
      externalUrl: 'https://waimnc.gov.in',
      status: 'active',
    },
    {
      category: 'local',
      titleMr: 'महिला व बालकल्याण योजना (वाई नगरपरिषद ५% राखीव निधी)',
      titleEn: 'Women & Child Welfare Scheme (Wai Municipal 5% Special Fund)',
      descMr: 'वाई शहरातील महिलांचे आर्थिक सक्षमीकरण, बचत गटांना फिरता निधी, कौशल्य विकास प्रशिक्षण व मुलींच्या शिक्षणासाठी नगरपरिषदेचा उपक्रम.',
      descEn: 'Empowering women and children in Wai city through revolving funds for Self-Help Groups (SHGs), free skill training, vocational equipment, and educational incentives.',
      eligibilityMr: '१. वाई नगरपरिषद क्षेत्रातील महिला व महिला बचत गट (SHG).\n२. आर्थिक दुर्बल, विधवा, घटस्फोटित व एकल महिलांना प्रथम प्राधान्य.\n३. वाई पालिकेच्या शाळांमधील विद्यार्थिनी किंवा शहरात किमान ३ वर्षे वास्तव्य.',
      eligibilityEn: '1. Women residents and registered Self-Help Groups (SHGs) within Wai city.\n2. Economically weaker, widowed, divorced, or single mothers given highest priority.\n3. Girl students in municipal schools or residents with at least 3 years domicile.',
      benefitsMr: '१. पात्र महिलांना मोफत शिलाई मशीन (Sewing Machine) वाटप.\n२. ब्युटी पार्लर, फॅशन डिझायनिंग, अन्न प्रक्रिया व संगणक प्रशिक्षणाचा १००% खर्च नगरपरिषदेमार्फत.\n३. नोंदणीकृत महिला बचत गटांना ₹ १०,००० ते ₹ २५,००० फिरता निधी (Revolving Fund).\n४. १०वी व १२वी मध्ये गुणवंत ठरलेल्या विद्यार्थिनींना रोख पारितोषिक व गौरव सन्मान.',
      benefitsEn: '1. Free motorized sewing machines distributed to eligible women.\n2. 100% sponsored vocational training in beauty care, tailoring, food processing, and IT.\n3. Revolving funds of ₹10,000 to ₹25,000 for registered Women Self-Help Groups.\n4. Merit awards and cash scholarships for top-scoring female students in 10th and 12th standards.',
      externalUrl: 'https://waimnc.gov.in',
      status: 'active',
    },
    {
      category: 'central',
      titleMr: 'पीएम स्वनिधी योजना (पंतप्रधान पथविक्रेता आत्मनिर्भर निधी)',
      titleEn: "PM SVANidhi Scheme (PM Street Vendor's AtmaNirbhar Nidhi)",
      descMr: 'वाई शहरातील फेरीवाले, भाजी-फळ विक्रेते, हातगाडी चालक व छोटे विक्रेते यांच्यासाठी विनातारण खेळते भांडवल कर्ज व ७% व्याज अनुदान योजना.',
      descEn: 'Collateral-free affordable working capital loans and 7% interest subsidy for street vendors, hawkers, and micro-merchants in Wai.',
      eligibilityMr: '१. वाई शहरातील भाजी मंडई, महागणपती मंदिर परिसर, बस स्थानक व आठवडे बाजारातील पथविक्रेते.\n२. नगरपरिषदेचे फेरीवाला सर्वेक्षण (TVC Survey) नोंदणी किंवा विक्रेता ओळखपत्र (Vendor ID / CoV).\n३. आधार कार्ड व सक्रिय बँक खाते आणि मोबाईल नंबर लिंक असणे आवश्यक.',
      eligibilityEn: '1. Street vendors, fruit/vegetable sellers, hawkers around Mandai, Ganpati Ghat, ST Stand, and weekly market in Wai.\n2. Possess Vendor ID card or Certificate of Vending (CoV) from Town Vending Committee (TVC) Wai.\n3. Aadhaar-linked active bank account with mobile number.',
      benefitsMr: '१. प्रथम टप्प्यात ₹ १०,००० पर्यंत विनातारण सुलभ खेळते भांडवल कर्ज.\n२. कर्जाची वेळेत परतफेड केल्यास दुसऱ्या टप्प्यात ₹ २०,००० व तिसऱ्या टप्प्यात ₹ ५०,००० पर्यंत वाढीव कर्ज.\n३. नियमित परतफेडीवर ७% वार्षिक व्याज अनुदान थेट बँक खात्यात जमा.\n४. डिजिटल व्यवहारांवर (UPI/QR Code) दरमहा ₹ १०० पर्यंत कॅशबॅक प्रोत्साहन.',
      benefitsEn: '1. 1st Tranche collateral-free working capital loan up to ₹10,000.\n2. On timely repayment, eligible for 2nd Tranche up to ₹20,000 and 3rd Tranche up to ₹50,000.\n3. 7% per annum interest subsidy directly credited via DBT.\n4. Monthly cashback up to ₹100 on accepting digital UPI QR code payments.',
      externalUrl: 'https://pmsvanidhi.mohua.gov.in',
      status: 'active',
    },
  ];

  for (const scheme of welfareSchemesData) {
    const existing = await prisma.scheme.findFirst({
      where: {
        OR: [
          { titleMr: scheme.titleMr },
          { titleEn: scheme.titleEn },
        ],
      },
    });
    if (!existing) {
      await prisma.scheme.create({ data: scheme });
    }
  }
  console.log('✅ Seeded / Verified all 8 Active Government Welfare Schemes for 2026');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
