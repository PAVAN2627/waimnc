import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Lang = "mr" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (mr: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "mr",
  setLang: () => {},
  t: (mr) => mr,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("nss_lang");
    return saved === "en" || saved === "mr" ? saved : "mr";
  });

  useEffect(() => {
    localStorage.setItem("nss_lang", lang);
  }, [lang]);

  const t = (mr: string, en: string) => (lang === "mr" ? mr : en);
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
