import { MapPin, Phone, Mail, Facebook, Twitter, Landmark, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { label: t("मुख्य पृष्ठ", "Home"), href: "/" },
    { label: t("नागरिक सेवा", "Citizen Services"), href: "/services/water-bill" },
    { label: t("तक्रार नोंदवा", "Register Complaint"), href: "/services/complaint" },
    { label: t("कायदे व नियम", "Laws & Rules"), href: "/laws" },
    { label: t("पर्यटन स्थळे", "Tourism Spots"), href: "/tourism" },
    { label: t("निविदा", "Tenders"), href: "/tenders" },
    { label: t("गॅलरी", "Gallery"), href: "/gallery" },
    { label: t("संपर्क", "Contact Us"), href: "/contact" },
  ];

  return (
    <footer id="contact" className="gov-gradient text-white pt-14 pb-8 border-t border-amber-400/30">
      <div className="container mx-auto px-4">
        {/* Top Emergency & Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 border-b border-white/20 pb-10">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-md">
            <div className="p-3 rounded-xl bg-white/20 text-white border border-white/30">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-white/80 font-medium">{t("नगरपरिषद हेल्पलाईन", "Council Helpline")}</div>
              <div className="text-sm font-black text-white font-mono">02167-220000</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-md">
            <div className="p-3 rounded-xl bg-red-500/30 text-white border border-white/30">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-white/80 font-medium">{t("आपत्कालीन नियंत्रण", "Emergency SOS")}</div>
              <div className="text-sm font-black text-white font-mono">112 / 101 / 108</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-md">
            <div className="p-3 rounded-xl bg-white/20 text-white border border-white/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-white/80 font-medium">{t("ई-मेल संपर्क", "Official Email")}</div>
              <div className="text-xs font-bold text-white">info@wainagarpalika.gov.in</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-3 shadow-md">
            <div className="p-3 rounded-xl bg-white/20 text-white border border-white/30">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-white/80 font-medium">{t("कार्यालयीन वेळ", "Office Hours")}</div>
              <div className="text-xs font-bold text-white">सोम - शनि (10 AM - 5:30 PM)</div>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Column 1: Council Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/90 p-1.5 shadow-lg flex items-center justify-center border border-white/40">
                <img src="/wai-logo-withoutbg.png" alt="Wai Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-black text-xl text-white leading-tight">{t("वाई नगर परिषद", "Wai Municipal Council")}</h3>
                <p className="text-xs text-amber-200 font-semibold">{t("जिल्हा सातारा, महाराष्ट्र शासन", "District Satara, Govt of Maharashtra")}</p>
              </div>
            </div>

            <p className="text-xs text-white/90 leading-relaxed max-w-sm">
              {t(
                "कृष्णा नदीच्या काठावर वसलेले ऐतिहासिक 'दक्षिण काशी' वाई शहर. नागरिकांच्या सेवा व शहराच्या शाश्वत विकासासाठी सदैव तत्पर.",
                "Historic Wai city on Krishna banks. Dedicated to sustainable development & citizen services."
              )}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <MapPin className="w-4 h-4 text-amber-200 flex-shrink-0" />
              <span className="text-xs text-white/90 font-medium">
                {t("मुख्य कार्यालय, स्टेशन रोड, वाई, जिल्हा सातारा - ४१२८०३", "Main Office, Station Road, Wai, Satara - 412803")}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links Grid */}
          <div>
            <h4 className="font-black text-sm text-white uppercase tracking-wider mb-4 border-b border-white/20 pb-2">
              {t("महत्त्वाच्या लिंक्स", "Important Links")}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              {quickLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.href}
                  className="text-white/90 hover:text-white hover:underline transition-all flex items-center gap-1.5 py-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3: Social & Compliance */}
          <div>
            <h4 className="font-black text-sm text-white uppercase tracking-wider mb-4 border-b border-white/20 pb-2">
              {t("सोशल मीडिया व उपक्रम", "Social Media & Initiatives")}
            </h4>
            <p className="text-xs text-white/90 mb-4 leading-relaxed">
              {t("वाई नगरपालिकेच्या अधिकृत सोशल मीडिया पेजशी जोडले जा व नवीन नागरी उपक्रमांचे अपडेट्स मिळवा.", "Follow official Wai Council social media pages for updates.")}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/30 text-white border border-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-md"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/30 text-white border border-white/30 flex items-center justify-center transition-all hover:scale-110 shadow-md"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <div className="px-3.5 py-2 rounded-xl bg-white/15 border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Swachh Bharat Digital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Footer Strip */}
        <div className="border-t border-white/20 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-white/80 font-medium gap-2">
          <p>{t("© २०२६ वाई नगर परिषद, सातारा. सर्व हक्क राखीव.", "© 2026 Wai Municipal Council, Satara. All rights reserved.")}</p>
          <div className="flex items-center gap-1">
            <span>{t("डिजिटल नागरी सेवा सेतू पोर्टलाद्वारे संचालित", "Powered by Digital Nagari Seva Setu Portal")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
