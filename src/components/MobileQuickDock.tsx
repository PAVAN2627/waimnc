import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PhoneCall, AlertCircle, Search, Video, FileSearch, X, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface MobileQuickDockProps {
  onOpenSearch?: () => void;
}

export const MobileQuickDock: React.FC<MobileQuickDockProps> = ({ onOpenSearch }) => {
  const { t } = useLanguage();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const emergencyContacts = [
    { label: t("नगरपरिषद हेल्पलाईन", "Wai Council Helpline"), number: "02167-220000", desc: "24x7 नागरी मदत", color: "bg-amber-500" },
    { label: t("अग्निशमन दल", "Fire Brigade"), number: "101", desc: "आणीबाणी संपर्क", color: "bg-red-600" },
    { label: t("अ‍ॅम्ब्युलन्स", "Ambulance"), number: "108", desc: "वैद्यकीय मदत", color: "bg-emerald-600" },
    { label: t("पोलीस नियंत्रण", "Police Control"), number: "112", desc: "सुरक्षा नियंत्रण कक्ष", color: "bg-blue-600" },
  ];

  return (
    <>
      {/* Mobile Floating Dock - Only visible on sm/md screens */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
        <div className="bg-card/90 dark:bg-slate-950/90 rounded-full px-3 py-2 shadow-2xl flex items-center justify-around border border-border dark:border-white/20 backdrop-blur-xl">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center p-1.5 text-foreground/80 dark:text-slate-300 hover:text-primary transition-colors group"
          >
            <div className="p-1.5 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">{t("शोध", "Search")}</span>
          </button>

          {/* Track Application */}
          <Link
            to="/track"
            className="flex flex-col items-center justify-center p-1.5 text-foreground/80 dark:text-slate-300 hover:text-primary transition-colors group"
          >
            <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <FileSearch className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">{t("ट्रॅक", "Track")}</span>
          </Link>

          {/* Primary Action Button - File Complaint */}
          <Link
            to="/services/complaint"
            className="flex flex-col items-center justify-center -mt-6 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/40 group-hover:scale-110 transition-transform">
              <div className="w-full h-full rounded-full bg-card dark:bg-slate-900 flex items-center justify-center text-primary border border-primary/40">
                <AlertCircle className="w-6 h-6 animate-pulse-subtle" />
              </div>
            </div>
            <span className="text-[10px] font-bold mt-0.5 text-primary">{t("तक्रार", "Report")}</span>
          </Link>

          {/* Live Sabha */}
          <Link
            to="/live-sabha"
            className="flex flex-col items-center justify-center p-1.5 text-foreground/80 dark:text-slate-300 hover:text-primary transition-colors group"
          >
            <div className="relative p-1.5 rounded-full bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform">
              <Video className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
            <span className="text-[10px] font-medium mt-0.5">{t("लाईव्ह", "Live")}</span>
          </Link>

          {/* Emergency Trigger */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="flex flex-col items-center justify-center p-1.5 text-foreground/80 dark:text-slate-300 hover:text-red-500 transition-colors group"
          >
            <div className="p-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 group-hover:scale-110 transition-transform pulse-ring">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-medium mt-0.5 text-red-500 font-bold">{t("आपत्कालीन", "SOS")}</span>
          </button>
        </div>
      </div>

      {/* Emergency Modal Pop-up */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card dark:bg-slate-900 text-card-foreground dark:text-white rounded-2xl p-5 max-w-sm w-full border border-red-500/40 shadow-2xl relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-4 right-4 p-1 text-muted-foreground hover:text-foreground rounded-full bg-muted"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-500 border border-red-500/30">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground dark:text-white">{t("आपत्कालीन संपर्क क्रमांक", "Emergency Helplines")}</h3>
                <p className="text-xs text-muted-foreground dark:text-slate-400">{t("वाई नगरपरिषद आपत्कालीन कक्ष", "Wai Council 24x7 Emergency Desk")}</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-5">
              {emergencyContacts.map((contact, idx) => (
                <a
                  key={idx}
                  href={`tel:${contact.number}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/60 dark:bg-slate-800/80 hover:bg-muted border border-border transition-all group"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground dark:text-slate-200 group-hover:text-primary">
                      {contact.label}
                    </div>
                    <div className="text-xs text-muted-foreground dark:text-slate-400">{contact.desc}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-background border text-foreground">
                      {contact.number}
                    </span>
                    <div className={`p-2 rounded-lg text-white ${contact.color}`}>
                      <PhoneCall className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-xs transition-colors"
            >
              {t("बंद करा", "Close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileQuickDock;
