import { useRef, useState } from "react";
import { Paperclip, X, FileText, ImageIcon, Copy, Check, Search, ShieldCheck, AlertCircle, ExternalLink, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { createComplaint } from "@/lib/complaints";
import { validateMobileInput, sanitizeMobileInput } from "@/lib/validation";

const ComplaintForm = ({ standalone = false }: { standalone?: boolean }) => {
  const [submitting, setSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [mobileValue, setMobileValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [driveLink, setDriveLink] = useState("");
  const [attachMode, setAttachMode] = useState<"file" | "drive">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useLanguage();

  const departments = [
    t("पाणी पुरवठा विभाग", "Water Supply Dept."),
    t("रस्ते व बांधकाम विभाग", "Roads & Civil Works"),
    t("आरोग्य व स्वच्छता विभाग", "Health & Sanitation Dept."),
    t("दिवाबत्ती व विद्युत विभाग", "Street Lights & Electrical"),
    t("सांडपाणी व गटार व्यवस्था", "Drainage & Sewerage"),
    t("अतिक्रमण निर्मूलन विभाग", "Encroachment Dept."),
    t("कर व मूल्यांकन विभाग", "Taxation Dept."),
    t("सामान्य प्रशासन / इतर", "General Administration / Other"),
  ];

  const complaintTypes = [
    t("पाणी समस्या / पाईपलाईन गळती", "Water Problem / Pipe Leakage"),
    t("रस्त्यावरील खड्डे / डांबरीकरण", "Potholes / Road Damage"),
    t("कचरा साचणे / अस्वच्छता", "Garbage / Cleanliness"),
    t("बंद पथदिवे / नादुरुस्त खांब", "Faulty Streetlights"),
    t("तुंबलेली गटारे / दुर्गंधी", "Choked Drains / Overflow"),
    t("अनधिकृत अतिक्रमण / रस्ता अडवणे", "Encroachments"),
    t("डास प्रतिबंधक धुरळणी / आरोग्य", "Mosquito Spraying / Health"),
    t("इतर नागरी तक्रार", "Other Civic Issue"),
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
    const mobile = (data.get("mobile") as string) || mobileValue;
    const type = data.get("type") as string;
    const department = data.get("department") as string;
    const location = (data.get("location") as string) || "";
    const description = (data.get("description") as string) || "";
    const combinedDesc = location ? `[ठिकाण: ${location.trim()}]\n${description.trim()}` : description.trim();

    // 10-digit real mobile validation (no fake / repeating numbers like 9999999999)
    const mobileCheck = validateMobileInput(mobile, lang);
    if (!mobileCheck.isValid) {
      setError(mobileCheck.error || t("कृपया १० अंकी वैध मोबाईल नंबर प्रविष्ट करा.", "Please enter a valid 10-digit mobile number."));
      return;
    }

    try {
      setSubmitting(true);
      const record = await createComplaint({
        name,
        mobile: mobileCheck.cleaned,
        type,
        department,
        description: combinedDesc,
        files,
        driveUrl: driveLink.trim() || undefined,
      });
      setTrackingId(record.trackingId || `WMC-${record.id.slice(0, 6).toUpperCase()}`);
      form.reset();
      setMobileValue("");
      setFiles([]);
      setDriveLink("");
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
      <section id="complaint" className={`py-12 ${standalone ? "bg-background" : "bg-muted"}`}>
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto bg-card p-6 sm:p-8 rounded-3xl border shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center text-3xl shadow-lg">
              ✓
            </div>
            <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {t("तक्रार यशस्वीरित्या नोंदवली गेली!", "Complaint Registered Successfully!")}
            </h2>

            {/* Tracking ID card */}
            <div className="bg-primary/5 border-2 border-primary/30 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("आपला अधिकृत ट्रॅकिंग आयडी", "Official Tracking Ticket ID")}
              </p>
              <p className="font-mono font-black text-3xl sm:text-4xl text-primary tracking-widest">
                {trackingId}
              </p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingId);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t("आयडी कॉपी झाला!", "Copied!") : t("ट्रॅकिंग आयडी कॉपी करा", "Copy Tracking ID")}</span>
              </button>
              <p className="text-xs text-muted-foreground">
                {t("हा आयडी तुमच्या स्क्रीनवर दाखवला आहे, कृपया तो लिहून किंवा कॉपी करून ठेवा.", "Please save or copy this Tracking ID displayed right on your screen.")}
              </p>
            </div>

            {/* Screenshot instruction */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-left space-y-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                📸 {t("स्क्रीनशॉट घ्या!", "Take a Screenshot!")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "या ट्रॅकिंग आयडीचा स्क्रीनशॉट काढून ठेवा. तक्रारीची सद्यस्थिती तपासण्यासाठी हा आयडी आवश्यक आहे.",
                  "Take a screenshot of this Tracking ID. You can check the real-time resolution status anytime."
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <Search className="w-4 h-4" />
                <span>{t("तक्रार ट्रॅक करा (Track Status)", "Track Application Status")}</span>
              </Link>
              <button
                type="button"
                className="w-full sm:w-auto gov-gradient text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:opacity-90 transition-opacity"
                onClick={() => setTrackingId(null)}
              >
                {t("नवीन तक्रार नोंदवा", "Submit Another Complaint")}
              </button>
            </div>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium">{t("मोबाइल नंबर *", "Mobile Number *")}</label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {mobileValue.length}/10 {t("अंक", "digits")}
                </span>
              </div>
              <input
                name="mobile"
                type="tel"
                inputMode="numeric"
                required
                maxLength={10}
                value={mobileValue}
                onChange={(e) => {
                  setMobileValue(sanitizeMobileInput(e.target.value));
                  if (error) setError(null);
                }}
                placeholder="98XXXXXXXX"
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none font-mono"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {t("१० अंकी खरा नंबर (६, ७, ८ किंवा ९ ने सुरू; ९९९९९९९९९९ असे बनावट नंबर चालणार नाहीत)", "10 real digits (starting 6-9; fake numbers like 9999999999 prohibited)")}
              </p>
            </div>
          </div>

          {/* Row 2: Type + Department */}
          <div className="grid md:grid-cols-2 gap-4">
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

          {/* Location / Landmark */}
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("समस्येचे अचूक ठिकाण / रस्ता / लँडमार्क *", "Exact Problem Location / Street / Landmark *")}
            </label>
            <input
              name="location"
              type="text"
              required
              placeholder={t("उदा. मारुती आळी, मारुती मंदिरासमोर, गणपती घाटाजवळ", "e.g. Maruti Ali, opposite Maruti Temple, near Ganpati Ghat")}
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-ring focus:outline-none"
            />
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

          {/* Document / Photo / Drive Link Attachment */}
          <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Paperclip className="w-4 h-4 text-primary" />
                {t("कागदपत्रे / पुरावा / फोटो (PDF किंवा गुगल ड्राईव्ह लिंक)", "Evidence / Documents (PDF or Drive Link)")}
                <span className="text-muted-foreground font-normal text-[11px]">({t("ऐच्छिक", "Optional")})</span>
              </label>

              <div className="inline-flex rounded-lg bg-muted p-0.5 border border-border/60">
                <button
                  type="button"
                  onClick={() => setAttachMode("file")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    attachMode === "file"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  {t("PDF / फोटो फाईल", "Upload Files")}
                </button>
                <button
                  type="button"
                  onClick={() => setAttachMode("drive")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    attachMode === "drive"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ExternalLink className="w-3 h-3 inline mr-1" />
                  {t("गुगल ड्राईव्ह लिंक", "Drive Link")}
                </button>
              </div>
            </div>

            {attachMode === "file" ? (
              <div>
                <div
                  className="border-2 border-dashed rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {t("फाइल्स निवडा (फोटो, PDF, कागदपत्रे - Vercel Blob वर सुरक्षित होतील)", "Choose files (photos, PDF, documents - stored in Vercel Blob)")}
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
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t("ऐच्छिक: एकाधिक फाइल्स निवडता येतात. प्रत्येक फाइल जास्तीत जास्त 10 MB.", "Optional: multiple files allowed. Max 10 MB per file.")}
                </p>

                {/* File preview list */}
                {files.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {files.map((file, i) => (
                      <li key={i} className="flex items-center gap-2 border rounded-xl px-3 py-2 text-xs bg-background">
                        {file.type.startsWith("image/") ? (
                          <ImageIcon className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-destructive flex-shrink-0" />
                        )}
                        <span className="truncate flex-1 font-medium">{file.name}</span>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">
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
            ) : (
              <div className="space-y-1.5">
                <input
                  type="url"
                  placeholder={t(
                    "गुगल ड्राईव्ह किंवा डॉक्युमेंट लिंक पेस्ट करा (https://drive.google.com/...)",
                    "Paste Google Drive link for documents (https://drive.google.com/...)"
                  )}
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs bg-background focus:ring-2 focus:ring-ring focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("गुगल ड्राईव्ह लिंक थेट Supabase मध्ये सुरक्षित केली जाईल आणि अधिकारी ती पाहू शकतील.", "Google Drive link will be stored directly in Supabase for municipal officers to view.")}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-bold flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

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
