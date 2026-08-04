import { useEffect, useState } from "react";
import { Lock, Mail, ArrowLeft, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (user) navigate("/admin/dashboard", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      toast({ title: t("त्रुटी", "Error"), description: t("Firebase configure केलेले नाही.", "Firebase is not configured."), variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const messages: Record<string, string> = {
        "auth/user-not-found": t("हा ईमेल नोंदणीकृत नाही.", "This email is not registered."),
        "auth/wrong-password": t("चुकीचा पासवर्ड.", "Incorrect password."),
        "auth/invalid-credential": t("ईमेल किंवा पासवर्ड चुकीचा आहे.", "Email or password is incorrect."),
        "auth/too-many-requests": t("अनेक चुकीचे प्रयत्न. थोड्या वेळाने पुन्हा प्रयत्न करा.", "Too many failed attempts. Please try again later."),
      };
      toast({
        title: t("लॉगिन अयशस्वी", "Login Failed"),
        description: messages[code] ?? t("काहीतरी चुकले. पुन्हा प्रयत्न करा.", "Something went wrong. Please try again."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background flex items-center justify-center p-4 font-devanagari relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden backdrop-blur-md">
          
          {/* Saffron Government Header */}
          <div className="gov-gradient p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
            
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 border border-white/30 shadow-xl">
              <ShieldCheck className="h-9 w-9 text-white" />
            </div>
            
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-white/30">
              <Sparkles className="w-3 h-3 text-amber-200" />
              {t("सुरक्षित पोर्टल", "Secure Administrative Portal")}
            </span>
            
            <h1 className="text-2xl md:text-3xl font-black text-white">{t("प्रशासन लॉगिन", "Admin Portal Login")}</h1>
            <p className="text-primary-foreground/90 text-xs font-semibold mt-1">
              {t("वाई नगर परिषद प्रशासकीय पॅनेल", "Wai Municipal Council Admin Control Desk")}
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleLogin} className="p-6 md:p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">{t("अधिकृत ई-मेल पत्ता *", "Official Email Address *")}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@wainagarpalika.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary font-medium"
                  required
                  maxLength={254}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">{t("पासवर्ड *", "Password *")}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={t("पासवर्ड टाका", "Enter admin password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary font-medium"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gov-gradient text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              <span>{loading ? t("प्रमाणित करत आहे...", "Authenticating...") : t("प्रशासकीय पॅनेलमध्ये प्रवेश करा", "Login to Admin Panel")}</span>
            </button>

            <div className="pt-2 text-center">
              <Link to="/" className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>{t("मुख्य संकेतस्थळावर परत जा", "Return to Main Portal")}</span>
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
