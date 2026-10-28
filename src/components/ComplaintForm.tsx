import { useRef, useState } from "react";
import { Paperclip, X, FileText, ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createComplaint } from "@/lib/complaints";

const WARDS = Array.from({ length: 17 }, (_, i) => i + 1);

const ComplaintForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const departments = [
    t("बांधकाम", "Construction"),
    t("आरोग्य व स्वच्छता", "Health & Sanitation"),
    t("पाणी पुरवठा", "Water Supply"),
    t("दिवाबत्ती", "Street Lights"),
    t("अतिक्रमण", "Encroachment"),
    t("कर विभाग", "Tax Dept."),
    t("इतर", "Other"),
  ];

  const complaintTypes = [
    t("पाणी", "Water"),
    t("रस्ते", "Roads"),
    t("कचरा", "Garbage"),
    t("दिवाबत्ती", "Street Lights"),
    t("इतर", "Other"),
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...selected.filter((f) => !existing.has(f.name + f.size))];
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = data.get("name") as string;
    const mobile = data.get("mobile") as string;
    const ward = data.get("ward") as string;
    const type = data.get("type") as string;
    const department = data.get("department") as string;
    const description = data.get("description") as string;

    if (!isFirebaseConfigured) {
      setTrackingId("OFFLINE");
      form.reset();
      setFiles([]);
      return;
    }

    try {
      setSubmitting(true);
      const record = await createComplaint({ name, mobile, ward, type, department, description, files });
      setTrackingId(`TK-${record.id.slice(-6).toUpperCase()}`);
      form.reset();
      setFiles([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("तक्रार पाठवता आली नाही.", "Failed to submit complaint.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (trackingId) {
    return (
      <section id="complaint" className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-card p-8 rounded-xl border shadow-sm text-center space-y-5">
            <div className="text-5xl">✅</div>
            <h2 className="text-xl font-bold text-green-700">
              {t("तक्रार यशस्वीरित्या नोंदवली!", "Complaint Submitted Successfully!")}
            </h2>

            {trackingId !== "OFFLINE" && (
              <>
                {/* Tracking ID card */}
                <div className="bg-primary/5 border-2 border-primary/30 rounded-xl p-5 space-y-2">
                  <p className="text-sm text-muted-foreground">{t("आपला ट्रॅकिंग आयडी", "Your Tracking ID")}</p>
                  <p className="font-mono font-extrabold text-3xl text-primary tracking-widest">{trackingId}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("हा आयडी जपून ठेवा", "Keep this ID safe")}
                  </p>
                </div>

                {/* Screenshot instruction */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left space-y-1">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    📸 {t("स्क्रीनशॉट घ्या!", "Take a Screenshot!")}
                  </p>
                  <p className="text-xs text-amber-700">
                    {t(
                      "या ट्रॅकिंग आयडीचा स्क्रीनशॉट घ्या. तक्रारीची स्थिती तपासण्यासाठी हा आयडी आवश्यक आहे.",
                      "Take a screenshot of this tracking ID. You will need it to check the status of your complaint."
                    )}
                  </p>
                </div>

                {/* How to track */}
                <div className="text-left bg-muted rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold">{t("तक्रार कशी ट्रॅक करावी?", "How to track your complaint?")}</p>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>{t("नगरपालिका कार्यालयात संपर्क करा", "Contact the municipal office")}</li>
                    <li>{t("हा ट्रॅकिंग आयडी सांगा", "Provide this tracking ID")}</li>
                    <li>{t("तक्रारीची सद्यस्थिती जाणून घ्या", "Know the current status of your complaint")}</li>
                  </ol>
                  <p className="text-xs text-muted-foreground pt-1">
                    📞 {t("ऑफिस: ०२१६७-२२००२२ / टोल फ्री: १८००२३३२२१", "Office: 02167-220022 / Toll Free: 1800233221")}
                  </p>
                </div>
              </>
            )}

            <p className="text-sm text-muted-foreground">
              {t("आम्ही लवकरच आपल्या तक्रारीवर कार्यवाही करू.", "We will process your complaint soon.")}
            </p>
            <button
              className="gov-gradient text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              onClick={() => setTrackingId(null)}
            >
              {t("नवीन तक्रार", "New Complaint")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="complaint" className="py-12 bg-muted">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2">
          {t("तक्रार नोंदणी", "Register Complaint")}
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          {t("आपली तक्रार येथे नोंदवा", "Register your complaint here")}
        </p>
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto bg-card p-6 rounded-xl border shadow-sm space-y-4"
        >
          {/* Row 1: Name + Mobile */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("नाव *", "Name *")}</label>
              <input
                name="name"
                type="text"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
              <input
                name="mobile"
                type="tel"
                required
                pattern="[0-9]{10}"
                title={t("10 अंकी नंबर", "10-digit number")}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Ward + Type + Department */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t("वार्ड क्र. *", "Ward No. *")}</label>
              <select
                name="ward"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">{t("निवडा...", "Select...")}</option>
                {WARDS.map((w) => (
                  <option key={w} value={String(w)}>
                    {t(`वार्ड ${w}`, `Ward ${w}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("तक्रारीचा प्रकार *", "Complaint Type *")}</label>
              <select
                name="type"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">{t("निवडा...", "Select...")}</option>
                {complaintTypes.map((ct) => (
                  <option key={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t("विभाग *", "Department *")}</label>
              <select
                name="department"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
              >
                <option value="">{t("निवडा...", "Select...")}</option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">{t("तक्रारीचे वर्णन *", "Complaint Description *")}</label>
            <textarea
              name="description"
              required
              rows={4}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none resize-none"
            />
          </div>

          {/* File picker */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("दस्तऐवज / फोटो अपलोड", "Upload Documents / Photos")}
            </label>
            <div
              className="border-2 border-dashed rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {t("फाइल्स निवडा (फोटो, PDF, कागदपत्रे)", "Choose files (photos, PDF, documents)")}
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("ऐच्छिक: एकाधिक फाइल्स निवडता येतात. प्रत्येक फाइल जास्तीत जास्त 5 MB.", "Optional: multiple files allowed. Max 5 MB per file.")}
            </p>

            {/* File preview list */}
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, i) => (
                  <li key={i} className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-background">
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      aria-label="Remove file"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="gov-gradient text-primary-foreground px-8 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting
              ? t("पाठवत आहे...", "Submitting...")
              : t("तक्रार पाठवा", "Submit Complaint")}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ComplaintForm;
