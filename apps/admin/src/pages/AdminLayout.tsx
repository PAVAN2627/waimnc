import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
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
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full font-devanagari bg-background overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Header Bar */}
          <header className="h-16 flex-shrink-0 flex items-center justify-between border-b border-border px-3 sm:px-4 md:px-6 bg-card shadow-sm z-30">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <SidebarTrigger className="hover:bg-muted p-2 rounded-xl flex-shrink-0" />
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="font-extrabold text-xs sm:text-sm text-foreground truncate">
                  <span className="inline sm:hidden">{t("वाई नगरपरिषद,वाई", "Wai Council")}</span>
                  <span className="hidden sm:inline">{t("वाई नगरपरिषद,वाई — प्रशासकीय पॅनेल", "Wai Municipal Council Admin")}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Language Switcher */}
              <div className="flex items-center bg-muted/60 p-0.5 sm:p-1 rounded-xl border border-border text-[11px] sm:text-xs font-bold">
                <button
                  onClick={() => setLang("mr")}
                  className={`px-2 sm:px-3 py-1 rounded-lg transition-all ${lang === "mr" ? "gov-gradient text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  मराठी
                </button>
                <button
                  onClick={() => setLang("en")}
                  className={`px-2 sm:px-3 py-1 rounded-lg transition-all ${lang === "en" ? "gov-gradient text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  EN
                </button>
              </div>

              {user && (
                <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-3 py-1 rounded-xl border border-border hidden lg:inline-block">
                  {user.email}
                </span>
              )}

              <Button size="sm" variant="ghost" onClick={handleLogout} className="gap-1.5 font-bold text-xs hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-xl px-2 sm:px-3">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">{t("लॉगआउट", "Logout")}</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 w-full min-w-0 p-3 sm:p-5 md:p-8 bg-gradient-to-b from-background via-muted/30 to-background overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
