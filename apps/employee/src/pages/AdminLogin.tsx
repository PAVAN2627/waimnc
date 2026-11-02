import { useEffect, useState } from "react";
import { Lock, Mail, LoaderCircle, ShieldCheck, Eye, EyeOff, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, login } = useAuth();
  const { t } = useLanguage();

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email.trim(), password);
      toast({
        title: t("लॉगिन यशस्वी", "Login Successful"),
        description: t("विभागीय कर्मचारी पोर्टलमध्ये आपले स्वागत आहे.", "Welcome to Department Employee Portal."),
      });
      navigate("/dashboard");
    } catch (err: unknown) {
      toast({
        title: t("लॉगिन अयशस्वी", "Login Failed"),
        description: err instanceof Error ? err.message : t("ईमेल किंवा पासवर्ड चुकीचा आहे.", "Invalid credentials."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-background flex items-center justify-center p-4 font-devanagari relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-3xl shadow-2xl border border-border overflow-hidden backdrop-blur-md">
          
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 p-8 text-center relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full pointer-events-none" />
            
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3 border border-white/30 shadow-xl">
              <Building2 className="h-9 w-9 text-white" />
            </div>
            
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-white/30">
              <ShieldCheck className="w-3 h-3 text-blue-200" />
              {t("कर्मचारी व अधिकारी पोर्टल", "Department Officer Portal")}
            </span>
            
            <h1 className="text-2xl md:text-3xl font-black text-white">{t("विभागीय कर्मचारी लॉगिन", "Employee Login")}</h1>
            <p className="text-white/80 text-xs font-semibold mt-1">
              {t("वाई नगरपरिषद - विभागीय तक्रारी व दाखले कक्ष", "Wai Municipal Council Employee Workdesk")}
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
                  placeholder={t("ई-मेल टाका (उदा. water.dept@wai.gov.in)", "Enter official email")}
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
                  type={showPassword ? "text" : "password"}
                  placeholder={t("पासवर्ड टाका", "Enter your password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3 rounded-xl shadow-lg transition-all flex items-center justify-center text-xs tracking-wider"
            >
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                  {t("पडताळणी होत आहे...", "Authenticating...")}
                </>
              ) : (
                t("पोर्टलमध्ये प्रवेश करा (Login)", "Sign In to Employee Desk")
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
