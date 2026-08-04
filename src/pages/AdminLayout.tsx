import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, Globe } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full font-devanagari bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header Bar */}
          <header className="h-16 flex items-center justify-between border-b border-border px-4 md:px-6 bg-card shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-muted p-2 rounded-xl" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-extrabold text-sm text-foreground">{t("वाई नगर परिषद — प्रशासकीय पॅनेल", "Wai Municipal Council Admin Panel")}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-bold">
                <button
                  onClick={() => setLang("mr")}
                  className={`px-3 py-1 rounded-lg transition-all ${lang === "mr" ? "gov-gradient text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-3 py-1 rounded-lg transition-all ${lang === "en" ? "gov-gradient text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  English
                </button>
              </div>

              {user && (
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-3 py-1 rounded-xl border border-border hidden md:inline-block">
                  {user.email}
                </span>
              )}

              <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5 font-bold text-xs hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-xl">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("लॉगआउट", "Logout")}</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8 bg-gradient-to-b from-background via-muted/30 to-background overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
