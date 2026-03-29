import React from "react";
import PageLayout from "@/components/PageLayout";
import { Download, FileText, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ACTS = [
  {
    sr: "१",
    titleMr: "महाराष्ट्र नगरपरिषदा, नगरपंचायती व औद्योगिक नगरी अधिनियम १९६५",
    titleEn: "Maharashtra Municipal Councils, Nagar Panchayats and Industrial Townships Act, 1965",
    url: "https://drive.google.com/file/d/1example1/preview",
  },
  {
    sr: "२",
    titleMr: "महाराष्ट्र प्रादेशिक नगररचना अधिनियम, १९६६",
    titleEn: "Maharashtra Regional and Town Planning Act, 1966",
    url: "https://drive.google.com/file/d/1example2/preview",
  },
  {
    sr: "३",
    titleMr: "भूमी संपादन अधिनियम, १८८४",
    titleEn: "Land Acquisition Act, 1884",
    url: "https://drive.google.com/file/d/1example3/preview",
  },
  {
    sr: "४",
    titleMr: "जन्म-मृत्यू अधिनियम",
    titleEn: "Birth and Death Registration Act",
    url: "https://drive.google.com/file/d/1example4/preview",
  },
  {
    sr: "५",
    titleMr: "माहितीचा अधिकार अधिनियम, २००५",
    titleEn: "Right to Information Act, 2005",
    url: "https://drive.google.com/file/d/1example5/preview",
  },
  {
    sr: "७",
    titleMr: "महाराष्ट्र (नागरी क्षेत्र) झाडे तोडण्यावर बंदी अधिनियम, १९७५",
    titleEn: "Maharashtra (Urban Areas) Protection and Preservation of Trees Act, 1975",
    url: "https://drive.google.com/file/d/1example7/preview",
  },
  {
    sr: "८",
    titleMr: "लोक सेवाहक्क अधिनियम, २०१५",
    titleEn: "Right to Public Services Act, 2015",
    url: "https://drive.google.com/file/d/1example8/preview",
  },
  {
    sr: "९",
    titleMr: "लेखा संहिता",
    titleEn: "Accounts Code",
    url: "https://drive.google.com/file/d/1example9/preview",
  },
];

const Acts = () => {
  const { t } = useLanguage();
  const [preview, setPreview] = React.useState<string | null>(null);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-10 space-y-6">
        <h1 className="text-3xl font-bold text-primary">
          {t("अधिनियम", "Acts & Regulations")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("वाई नगर परिषदेशी संबंधित महत्त्वाचे अधिनियम", "Important acts related to Wai Municipal Council")}
        </p>

        <div className="space-y-3">
          {ACTS.map((act) => (
            <div
              key={act.sr}
              className="flex items-center justify-between gap-4 bg-card border rounded-xl px-5 py-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-primary font-bold text-sm w-6 flex-shrink-0">{act.sr})</span>
                <div className="flex items-start gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{t(act.titleMr, act.titleEn)}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setPreview(preview === act.url ? null : act.url)}
                  className="flex items-center gap-1 text-xs border border-primary text-primary px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  {t("पहा", "Preview")}
                </button>
                <a
                  href={act.url.replace("/preview", "/view")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs gov-gradient text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Download className="h-3 w-3" />
                  {t("डाउनलोड", "Download")}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Inline PDF preview */}
        {preview && (
          <div className="mt-6 border rounded-xl overflow-hidden shadow-lg">
            <div className="gov-gradient text-primary-foreground px-4 py-2 flex items-center justify-between text-sm">
              <span>{t("दस्तऐवज पूर्वावलोकन", "Document Preview")}</span>
              <button onClick={() => setPreview(null)} className="hover:opacity-70">✕</button>
            </div>
            <iframe
              src={preview}
              className="w-full h-[600px]"
              title="Document Preview"
              allow="autoplay"
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Acts;
