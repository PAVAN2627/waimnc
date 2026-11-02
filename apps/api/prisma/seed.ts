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
    console.log('ℹ️ No ADMIN_DEFAULT_EMAIL/PASSWORD in environment; preserving existing database administrator.');
  }

  // ---------------------------------------------------------------------------
  // 2. Seed Elected Officials & Nagarsevaks (अध्यक्ष व नगरसेवक २०२५–२६)
  // ---------------------------------------------------------------------------
  // Delete existing records to sync exact 26 officials
  await prisma.official.deleteMany({});

  const officialsData = [
    // 1. अध्यक्ष व उपाध्यक्ष / President and Deputy President
    {
      displayOrder: 1,
      designationMr: 'नगराध्यक्ष',
      designationEn: 'Municipal President',
      nameMr: 'अनिल लक्ष्मण सावंत',
      nameEn: 'Anil Laxman Sawant',
      wardNumber: 'मा. नगराध्यक्ष',
      addressMr: '३३३, साननगरवाडी, वाई',
      addressEn: '333, Saninagarwadi, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9422600483',
      isActive: true,
    },
    {
      displayOrder: 2,
      designationMr: 'उपनगराध्यक्ष',
      designationEn: 'Deputy President',
      nameMr: 'घनश्याम (पिंटू) सखाराम चक्के',
      nameEn: 'Ghanshyam (Pintu) Sakharam Chakke',
      wardNumber: 'प्रभाग २(अ)',
      addressMr: '१६७०, रविवार पेठ, वाई',
      addressEn: '1670, Ravivar Peth, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '1890906632',
      isActive: true,
    },

    // 2. नगरसेवक यादी / Councillors List
    {
      displayOrder: 3,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'अपर्णा संतोष जमदाडे',
      nameEn: 'Aparna Santosh Jamdade',
      wardNumber: 'प्रभाग १(अ)',
      addressMr: '१४५५, रविवार पेठ, वाई',
      addressEn: '1455, Ravivar Peth, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '8087346593',
      isActive: true,
    },
    {
      displayOrder: 4,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'प्रसाद कृष्णराज वनकर',
      nameEn: 'Prasad Krishnaraj Vankar',
      wardNumber: 'प्रभाग १(ब)',
      addressMr: '१३६१, रविवार पेठ, वाई',
      addressEn: '1361, Ravivar Peth, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9604485485',
      isActive: true,
    },
    {
      displayOrder: 5,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'पद्मा संग्राम जाधव',
      nameEn: 'Padma Sangram Jadhav',
      wardNumber: 'प्रभाग २(ब)',
      addressMr: '१३३७, पाडळी वाडा, रविवार पेठ, वाई',
      addressEn: '1337, Padali Wada, Ravivar Peth, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '8275371188',
      isActive: true,
    },
    {
      displayOrder: 6,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'संदीप ईश्वर जावळे',
      nameEn: 'Sandeep Ishwar Jawale',
      wardNumber: 'प्रभाग ३(अ)',
      addressMr: '२२७२, बुद्धविहार, फुलेनगर, वाई',
      addressEn: '2272, Buddh Vihar, Phulenagar, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9604540366',
      isActive: true,
    },
    {
      displayOrder: 7,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'डॉ. जिविता अतुल जमदाडे',
      nameEn: 'Dr. Jivita Atul Jamdade',
      wardNumber: 'प्रभाग ३(ब)',
      addressMr: '२१९६, महात्मा फुलेनगर, वाई',
      addressEn: '2196, Mahatma Phulenagar, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9890720001',
      isActive: true,
    },
    {
      displayOrder: 8,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'शारदा महेश काळे',
      nameEn: 'Sharda Mahesh Kale',
      wardNumber: 'प्रभाग ४(अ)',
      addressMr: '१९६६, रविवार पेठ, वाई',
      addressEn: '1966, Ravivar Peth, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9511745316',
      isActive: true,
    },
    {
      displayOrder: 9,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'संग्राम ऊर्फ पप्पू दादासाहेब पवार',
      nameEn: 'Sangram alias Pappu Dadasaheb Pawar',
      wardNumber: 'प्रभाग ४(ब)',
      addressMr: '१४६३, रविवार पेठ, वाई',
      addressEn: '1463, Ravivar Peth, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9822690834',
      isActive: true,
    },
    {
      displayOrder: 10,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'भारत सदाशिव खामकर',
      nameEn: 'Bharat Sadashiv Khamkar',
      wardNumber: 'प्रभाग ५(अ)',
      addressMr: '९८१, ब्राह्मणशाही, वाई',
      addressEn: '981, Brahmanshahi, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9922901701',
      isActive: true,
    },
    {
      displayOrder: 11,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'ज्योती सचिन गांधी',
      nameEn: 'Jyoti Sachin Gandhi',
      wardNumber: 'प्रभाग ५(ब)',
      addressMr: '११२, धर्मपुरी, वाई',
      addressEn: '112, Dharmapuri, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9423036458',
      isActive: true,
    },
    {
      displayOrder: 12,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'जागृती मकरंद पारे',
      nameEn: 'Jagruti Makarand Pare',
      wardNumber: 'प्रभाग ६(अ)',
      addressMr: '४५६, गणपती आळी, वाई',
      addressEn: '456, Ganpati Ali, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9881982968',
      isActive: true,
    },
    {
      displayOrder: 13,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'विजय वसंत देकाणे',
      nameEn: 'Vijay Vasant Dekane',
      wardNumber: 'प्रभाग ६(ब)',
      addressMr: '४४०, गणपती आळी, वाई',
      addressEn: '440, Ganpati Ali, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9850760509',
      isActive: true,
    },
    {
      displayOrder: 14,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'शैलेन्द्र सुधाकर देवकुळे',
      nameEn: 'Shailendra Sudhakar Devkule',
      wardNumber: 'प्रभाग ७(अ)',
      addressMr: '६३, गंगापुरी, वाई',
      addressEn: '63, Gangapuri, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9850551536',
      isActive: true,
    },
    {
      displayOrder: 15,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'केतकी विजय मोरे (पाहुणे)',
      nameEn: 'Ketaki Vijay More (Pahune)',
      wardNumber: 'प्रभाग ७(ब)',
      addressMr: '१६, गंगापुरी, वाई',
      addressEn: '16, Gangapuri, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9423391929',
      isActive: true,
    },
    {
      displayOrder: 16,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'अजित बाळासाहेब शिंदे',
      nameEn: 'Ajit Balasaheb Shinde',
      wardNumber: 'प्रभाग ८(अ)',
      addressMr: '१२, नावेचीवाडी, वाई',
      addressEn: '12, Navechivadi, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9922432222',
      isActive: true,
    },
    {
      displayOrder: 17,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'पद्मश्री प्रफुल्ल चोरगे',
      nameEn: 'Padmashri Prafull Chorge',
      wardNumber: 'प्रभाग ८(ब)',
      addressMr: '२६१, गंगापुरी, वाई',
      addressEn: '261, Gangapuri, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '8830150923',
      isActive: true,
    },
    {
      displayOrder: 18,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'रेखा कांतराम जाधव',
      nameEn: 'Rekha Kantaram Jadhav',
      wardNumber: 'प्रभाग ९(अ)',
      addressMr: '२४४४, जुने गुरुवार क्षेत्र, सिद्धनाथवाडी, वाई',
      addressEn: '2444, Old Guruwar area, Siddhanathwadi, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9850076323',
      isActive: true,
    },
    {
      displayOrder: 19,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'सुशील सूर्यकांत खरात',
      nameEn: 'Sushil Suryakant Kharat',
      wardNumber: 'प्रभाग ९(ब)',
      addressMr: '२४४२, सिद्धनाथवाडी, वाई',
      addressEn: '2442, Siddhanathwadi, Wai',
      partyMr: 'अपक्ष',
      partyEn: 'Independent',
      phone: '8237235626',
      isActive: true,
    },
    {
      displayOrder: 20,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'निलिमा दत्तात्रय खरात',
      nameEn: 'Nilima Dattatray Kharat',
      wardNumber: 'प्रभाग १०(अ)',
      addressMr: 'सर्व्हे नं. १, सिद्धनाथवाडी, वाई',
      addressEn: 'Survey No. 1, Siddhanathwadi, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '7385934427',
      isActive: true,
    },
    {
      displayOrder: 21,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'गुरुप्रसाद राजू चव्हाण',
      nameEn: 'Guruprasad Raju Chavan',
      wardNumber: 'प्रभाग १०(ब)',
      addressMr: '२४५९, सिद्धनाथवाडी, वाई',
      addressEn: '2459, Siddhanathwadi, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '9850074308',
      isActive: true,
    },
    {
      displayOrder: 22,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'संग्राम सुनील सपकाळ',
      nameEn: 'Sangram Sunil Sapkal',
      wardNumber: 'प्रभाग ११(अ)',
      addressMr: '२३८४, साननगरवाडी, वाई',
      addressEn: '2384, Saninagarwadi, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9822353680',
      isActive: true,
    },
    {
      displayOrder: 23,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'दिपाली निशिगंध सावंत',
      nameEn: 'Dipali Nishigandh Sawant',
      wardNumber: 'प्रभाग ११(ब)',
      addressMr: 'साननगरवाडी, वाई',
      addressEn: 'Saninagarwadi, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '8430202423',
      isActive: true,
    },
    {
      displayOrder: 24,
      designationMr: 'नगरसेवक',
      designationEn: 'Councillor',
      nameMr: 'नूतन गिरीधर मालुसरे',
      nameEn: 'Nutan Giridhar Malusare',
      wardNumber: 'प्रभाग ११(क)',
      addressMr: 'साननगरवाडी, वाई',
      addressEn: 'Saninagarwadi, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '9922484303',
      isActive: true,
    },

    // 3. नामनिर्देशित सदस्य / Nominated Members
    {
      displayOrder: 25,
      designationMr: 'नामनिर्देशित सदस्य',
      designationEn: 'Nominated Member',
      nameMr: 'शब्बीर दिलावर पठाण',
      nameEn: 'Shabbir Dilawar Pathan',
      wardNumber: 'नामनिर्देशित',
      addressMr: '२००० अ, पटेलवाडा, रविवार पेठ, वाई',
      addressEn: '2000 A, Patelwada, Ravivar Peth, Wai',
      partyMr: 'नॅशनलिस्ट काँग्रेस पार्टी',
      partyEn: 'Nationalist Congress Party (NCP)',
      phone: '—',
      isActive: true,
    },
    {
      displayOrder: 26,
      designationMr: 'नामनिर्देशित सदस्य',
      designationEn: 'Nominated Member',
      nameMr: 'सचिन जगन्नाथ सावंत',
      nameEn: 'Sachin Jagannath Sawant',
      wardNumber: 'नामनिर्देशित',
      addressMr: '१८५, यशवंतनगर, वाई',
      addressEn: '185, Yashwantnagar, Wai',
      partyMr: 'भारतीय जनता पार्टी',
      partyEn: 'Bharatiya Janata Party (BJP)',
      phone: '—',
      isActive: true,
    },
  ];

  await prisma.official.createMany({ data: officialsData });
  console.log(`✅ Seeded all ${officialsData.length} Elected Officials & Nagarsevaks for 2025–26`);

  // ---------------------------------------------------------------------------
  // 3. Seed Initial Civic Notices & Circulars
  // ---------------------------------------------------------------------------
  const noticesCount = await prisma.notice.count();
  if (noticesCount === 0) {
    await prisma.notice.createMany({
      data: [
        {
          title: 'मालमत्ता कर व पाणीपट्टी सवलत मुदतवाढ २०२५–२६',
          titleEn: 'Property Tax and Water Charges Rebate Extension 2025–26',
          content: 'वाई शहरातील सर्व नागरिकांना कळविण्यात येते की चालू आर्थिक वर्षाचा मालमत्ता कर वेळेत भरणाऱ्यास ५% सवलत देण्यात येत आहे.',
          contentEn: 'All citizens of Wai are hereby notified that a 5% discount is applicable for prompt payment of property taxes for the current fiscal year.',
          tag: 'कर आकारणी',
          tagEn: 'Taxation',
          status: 'active',
        },
        {
          title: 'स्वच्छ सर्वेक्षण २०२६: शहर स्वच्छता मोहिमेत नागरिकांचा सहभाग',
          titleEn: 'Swachh Survekshan 2026: Citizen Participation in Cleanliness Drive',
          content: 'कृष्णा नदी घाट आणि प्रमुख पेठांमध्ये विशेष स्वच्छता मोहीम राबविण्यात येत आहे. नागरिकांनी कचरा वर्गीकरण करावे.',
          contentEn: 'Special cleanliness drive is active along Krishna Ghats and major markets. Citizens are requested to segregate waste.',
          tag: 'आरोग्य विभाग',
          tagEn: 'Health & Sanitation',
          status: 'active',
        },
      ],
    });
    console.log('✅ Seeded initial Civic Notices');
  }

  // ---------------------------------------------------------------------------
  // 4. Seed Development Projects
  // ---------------------------------------------------------------------------
  const projectsCount = await prisma.project.count();
  if (projectsCount === 0) {
    await prisma.project.createMany({
      data: [
        {
          titleMr: 'कृष्णा नदी घाट सुशोभीकरण व संवर्धन प्रकल्प',
          titleEn: 'Krishna River Ghat Beautification & Heritage Conservation',
          descMr: 'महागणपती मंदिर घाट व कृष्णा नदीच्या पात्रातील ऐतिहासिक वास्तूंचे संवर्धन आणि प्रकाशयोजना.',
          descEn: 'Conservation and aesthetic lighting for Maha Ganpati Ghat and historic riverfront stone architecture.',
          progress: 75,
          iconName: 'Building2',
          status: 'active',
        },
        {
          titleMr: 'भूमिगत सांडपाणी वाहिनी व जलशुद्धीकरण केंद्र',
          titleEn: 'Underground Sewerage Pipeline & Sewage Treatment Plant (STP)',
          descMr: 'शहरातील सर्व प्रमुख पेठांसाठी भूमिगत सांडपाणी व्यवस्था व आधुनिक जलशुद्धीकरण प्रकल्प.',
          descEn: 'Comprehensive underground sewage network and state-of-the-art STP for sustainable city water management.',
          progress: 50,
          iconName: 'Droplet',
          status: 'active',
        },
      ],
    });
    console.log('✅ Seeded Municipal Development Projects');
  }

  // ---------------------------------------------------------------------------
  // 5. Seed Live Sabha Schedule & Official Previous Sabha Proceedings
  // ---------------------------------------------------------------------------
  const previousSabhasData = [
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (१२/०३/२०२५)',
      titleEn: 'General Body Meeting (12/03/2025)',
      date: '2025-03-12',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1MyEalPhC1IZWwv7rH2z70zojJ66KNpSk/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १२-०३-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (१८/०२/२०२५)',
      titleEn: 'General Body Meeting (18/02/2025)',
      date: '2025-02-18',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1eqbtyEepAhUc-1nFOED5vyD8r9kQN_sk/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १८-०२-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (२७/०२/२०२५)',
      titleEn: 'General Body Meeting (27/02/2025)',
      date: '2025-02-27',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1UMeecOqy1WohMW3HqxEkv4XdO3EEmEzR/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा २७-०२-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (२६/०३/२०२५)',
      titleEn: 'General Body Meeting (26/03/2025)',
      date: '2025-03-26',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1hXtZotgkO6oeZ4JUzIpKeWlnk9E_HSTP/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा २६-०३-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (०६/०२/२०२५)',
      titleEn: 'General Body Meeting (06/02/2025)',
      date: '2025-02-06',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1J7YVJnzf-Y4_dlaRimUg0OAWuDkIjWBy/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा ०६-०२-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (१५/०१/२०२५)',
      titleEn: 'General Body Meeting (15/01/2025)',
      date: '2025-01-15',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1G5FtKnsj1HeJZ6YFX-uvt5uxQd5jqfSG/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १५-०१-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (१४/१०/२०२४)',
      titleEn: 'General Body Meeting (14/10/2024)',
      date: '2024-10-14',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/10s8zr4LxVBZmjJGp6j-MDohOEbWdFkqf/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १४-१०-२०२४.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (०९/१०/२०२४)',
      titleEn: 'General Body Meeting (09/10/2024)',
      date: '2024-10-09',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1OpztHtanPucSxsolLYQtarofEgrS4wBT/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा ०९-१०-२०२४.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (२६/०९/२०२४)',
      titleEn: 'General Body Meeting (26/09/2024)',
      date: '2024-09-26',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1AgXDIDoUVzDQxB8ZohptgLKZx5NhJCtU/view?usp=drive_link',
      minutesName: 'सर्वसाधारण सभा २६-०९-२०२४.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (१४/०९/२०२४)',
      titleEn: 'General Body Meeting (14/09/2024)',
      date: '2024-09-14',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1NyVePuydfAnnIp2TSeysSVkWyzlAUWV3/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १४-०९-२०२४.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा (२१/०६/२०२५)',
      titleEn: 'General Body Meeting (21/06/2025)',
      date: '2025-06-21',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/file/d/1buTvmrlsY84FUYVypgUm4DqaxkRfl6RT/view?usp=sharing',
      minutesName: 'सर्वसाधारण सभा २१-०६-२०२५.pdf',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (२७/०८/२०२४)',
      titleEn: 'General Body Meeting (27/08/2024)',
      date: '2024-08-27',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/drive/folders/1Bu_WAkoGWdm2_c4QSQc0UWUbWK6B0pD6?usp=sharing',
      minutesName: 'सर्वसाधारण सभा २७-०८-२०२४',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (१०/१२/२०२४)',
      titleEn: 'General Body Meeting (10/12/2024)',
      date: '2024-12-10',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/drive/folders/1Bu_WAkoGWdm2_c4QSQc0UWUbWK6B0pD6?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १०-१२-२०२४',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2024,
      titleMr: 'सर्वसाधारण सभा (२८/०८/२०२४)',
      titleEn: 'General Body Meeting (28/08/2024)',
      date: '2024-08-28',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/drive/folders/1Bu_WAkoGWdm2_c4QSQc0UWUbWK6B0pD6?usp=sharing',
      minutesName: 'सर्वसाधारण सभा २८-०८-२०२४',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'vishesh',
      year: 2024,
      titleMr: 'विशेष सभा (२६/०९/२०२४)',
      titleEn: 'Special Meeting (26/09/2024)',
      date: '2024-09-26',
      time: '02:00 PM',
      minutesUrl: 'https://drive.google.com/drive/folders/1Bu_WAkoGWdm2_c4QSQc0UWUbWK6B0pD6?usp=sharing',
      minutesName: 'विशेष सभा २६-०९-२०२४',
      status: 'active',
    },
    {
      type: 'previous',
      sabhaType: 'sarvasadharan',
      year: 2025,
      titleMr: 'सर्वसाधारण सभा ठराव फोल्डर (१२/०३/२०२५)',
      titleEn: 'General Body Meeting Resolutions Folder (12/03/2025)',
      date: '2025-03-12',
      time: '11:00 AM',
      minutesUrl: 'https://drive.google.com/drive/folders/1Bu_WAkoGWdm2_c4QSQc0UWUbWK6B0pD6?usp=sharing',
      minutesName: 'सर्वसाधारण सभा १२-०३-२०२५ ठराव फोल्डर',
      status: 'active',
    },
  ];

  for (const item of previousSabhasData) {
    const existing = await prisma.sabhaMeeting.findFirst({
      where: { date: item.date, titleMr: item.titleMr },
    });
    if (!existing) {
      await prisma.sabhaMeeting.create({ data: item });
    }
  }
  console.log('✅ Seeded 16 Official Previous Sabha Meetings & Resolutions');

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
