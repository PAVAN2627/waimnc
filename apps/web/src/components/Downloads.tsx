import { Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Downloads = () => {
  const { t } = useLanguage();

  const docs = [
    { label: t("नागरी तक्रार / अर्ज फॉर्म", "Citizen Grievance & Application Form"), href: "/services/complaint" },
    { label: t("बांधकाम परवाना अर्ज", "Construction Permit Application"), href: "/services/construction-permit" },
    { label: t("मालमत्ता कर आकारणी व बिल", "Property Tax Assessment & Bill"), href: "/services/property-tax" },
    { label: t("जन्म दाखला अर्ज", "Birth Certificate Application"), href: "/services/birth-certificate" },
    { label: t("मृत्यू दाखला अर्ज", "Death Certificate Application"), href: "/services/death-certificate" },
    { label: t("पाणी पुरवठा व मीटर बिल", "Water Supply & Meter Bill"), href: "/services/water-bill" },
  ];

  return (
    <section className="py-12 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">{t("डाउनलोड व अर्ज फॉर्म", "Downloads & Application Forms")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
          {docs.map((d) => (
            <Link
              key={d.href}
              to={d.href}
              className="flex items-center gap-2 border rounded-lg p-3 hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <FileText className="w-4 h-4 text-primary group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="text-sm font-medium">{d.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Downloads;
