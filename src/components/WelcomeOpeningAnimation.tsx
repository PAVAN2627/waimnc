import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, ShieldCheck, Landmark } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeOpeningAnimationProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const WelcomeOpeningAnimation: React.FC<WelcomeOpeningAnimationProps> = ({
  onComplete,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    // Check session storage if already shown in current session
    const hasSeenIntro = sessionStorage.getItem("wai_intro_seen");
    
    if (forceShow || !hasSeenIntro) {
      setIsVisible(true);
      
      // Animate progress bar from 0 to 100
      const duration = 2800; // 2.8 seconds
      const interval = 30;
      const step = (interval / duration) * 100;
      
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              handleClose();
            }, 400);
            return 100;
          }
          return prev + step;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [forceShow]);

  // Listen to custom replay event
  useEffect(() => {
    const handleReplay = () => {
      setIsClosing(false);
      setProgress(0);
      setIsVisible(true);
      
      let p = 0;
      const timer = setInterval(() => {
        p += 4;
        if (p >= 100) {
          setProgress(100);
          clearInterval(timer);
          setTimeout(() => {
            handleClose();
          }, 400);
        } else {
          setProgress(p);
        }
      }, 30);
    };

    window.addEventListener("replay-opening-intro", handleReplay);
    return () => window.removeEventListener("replay-opening-intro", handleReplay);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    sessionStorage.setItem("wai_intro_seen", "true");
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 700);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950 text-white overflow-hidden transition-all duration-700 ${
        isClosing ? "opacity-0 -translate-y-full scale-105 pointer-events-none" : "opacity-100 translate-y-0 scale-100"
      }`}
    >
      {/* Background Animated Gradient Rays & Orbs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-emerald-600/10 to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-[90px] animate-pulse-subtle pointer-events-none" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Main Content Box */}
      <div className="relative z-10 max-w-xl mx-auto px-6 text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-bounce-gentle backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t("डिजिटल वाई नगरपरिषद पोर्टल", "Digital Wai Municipal Portal")}</span>
        </div>

        {/* Glowing Logo */}
        <div className="relative mb-6 group cursor-pointer" onClick={handleClose}>
          <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl animate-pulse-subtle group-hover:bg-amber-400/50 transition-all" />
          <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-slate-900/90 border border-amber-500/40 p-4 shadow-2xl flex items-center justify-center backdrop-blur-xl transition-transform duration-500 group-hover:scale-105">
            <img
              src="/wai-logo-withoutbg.png"
              alt="वाई नगरपरिषद बोधचिन्ह"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse-subtle"
            />
          </div>
        </div>

        {/* Titles */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
          {t("श्री क्षेत्र वाई नगरपरिषद", "Wai Municipal Council")}
        </h1>
        <p className="text-sm md:text-lg text-emerald-300 font-medium mb-1 tracking-wide">
          {t("नागरी सेवा सेतू पोर्टल", "Nagari Seva Setu Civic Portal")}
        </p>
        <p className="text-xs md:text-sm text-slate-400 max-w-md mb-8">
          {t("स्वच्छ, सुंदर व स्मार्ट वाई शहराच्या सेवेत तत्पर डिजिटल व्यासपीठ", "Prompt digital platform serving clean, beautiful & smart Wai city")}
        </p>

        {/* Progress Bar & Status */}
        <div className="w-full max-w-xs space-y-2 mb-6">
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5 backdrop-blur">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t("सुरक्षित जोडणी...", "Secure Connecting...")}
            </span>
            <span className="text-amber-400 font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Skip Action Button */}
        <button
          onClick={handleClose}
          className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-xs font-semibold tracking-wider hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10"
        >
          <span>{t("पोर्टलवर जा", "Enter Portal")}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-amber-400" />
        </button>
      </div>

      {/* Footer Branding Credit */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
        <Landmark className="w-3.5 h-3.5 text-amber-500/70" />
        <span>{t("दक्षिण काशी वाई — कृष्णा काठ", "Dakshin Kashi Wai — Krishna Banks")}</span>
      </div>
    </div>
  );
};

export default WelcomeOpeningAnimation;
