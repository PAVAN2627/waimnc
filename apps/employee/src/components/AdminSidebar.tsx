import { 
  LayoutDashboard, FileText, Settings, Video, MessageSquare, LogOut, Building2, FileCheck2, X, History, UserCheck
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export function AdminSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isCollapsedDesktop = !isMobile && state === "collapsed";
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setOpenMobile(false);
    await logout();
    navigate("/login");
  };

  const departments = user?.departments || (user?.department ? user.department.split(',').map((d: string) => d.trim()) : []);

  // Dedicated Employee Portal Navigation (Strictly departmental complaints & applications)
  const menuItems = [
    { title: t("विभागीय डॅशबोर्ड", "Department Dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("नागरी तक्रारी निवारण", "Civic Grievances"), url: "/complaints", icon: MessageSquare },
    { title: t("दाखले व सेवा अर्ज", "Service Applications"), url: "/applications", icon: FileCheck2 },
    { title: t("माझे प्रोफाइल", "My Profile"), url: "/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card/95 backdrop-blur-md shadow-xl">
      
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!isCollapsedDesktop && (
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm text-foreground truncate">{t("वाई नगरपरिषद", "Wai Municipal Council")}</span>
            </div>
            <div className="mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/30 truncate max-w-full">
                <UserCheck className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{user?.name || t("विभागीय कर्मचारी", "Employee Portal")}</span>
              </span>
            </div>
            {departments.length > 0 && (
              <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                {departments.join(", ")}
              </p>
            )}
          </div>
        )}

        {/* Cancel / Close button for mobile */}
        <button
          type="button"
          onClick={() => setOpenMobile(false)}
          aria-label={t("मेनू बंद करा", "Close menu")}
          className="md:hidden ml-auto p-2 rounded-xl text-foreground bg-muted/80 hover:bg-destructive hover:text-white transition-colors border border-border shadow-sm flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Menu List */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!isCollapsedDesktop && (
            <SidebarGroupLabel className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground px-3 mb-2">
              {t("कर्मचारी कार्यक्षेत्र मेनू", "Department Workplace Navigation")}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 hover:bg-muted/70 text-muted-foreground hover:text-foreground group"
                      activeClassName="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-black hover:text-white"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {!isCollapsedDesktop && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Logout */}
      <SidebarFooter className="border-t border-border p-3 bg-muted/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-xs font-bold text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl py-2.5 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
          {!isCollapsedDesktop && t("लॉगआउट करा (Logout)", "Logout")}
        </Button>
      </SidebarFooter>

    </Sidebar>
  );
}
