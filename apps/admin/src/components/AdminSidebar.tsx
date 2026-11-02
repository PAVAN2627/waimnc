import { 
  LayoutDashboard, FileText, Users, Megaphone, FolderOpen, 
  Settings, Video, Calendar, ImageIcon, MessageSquare, LogOut, Building2, BookOpen, FileCheck2, FileSpreadsheet, X, UserCog, History
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
  // On mobile the drawer is always expanded; icon-only collapse is strictly for desktop
  const isCollapsedDesktop = !isMobile && state === "collapsed";
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setOpenMobile(false);
    await logout();
    navigate("/login");
  };

  const isDeptOfficer = user?.role === "DEPT_OFFICER";

  // Role-based navigation items
  const menuItems = isDeptOfficer
    ? [
        { title: t("डॅशबोर्ड", "Dashboard"), url: "/dashboard", icon: LayoutDashboard },
        { title: t("नागरी तक्रारी", "Civic Complaints"), url: "/complaints", icon: MessageSquare },
        { title: t("दाखले व सेवा अर्ज", "Service Applications"), url: "/applications", icon: FileCheck2 },
        { title: t("सभा / ठराव", "Sabha / Resolutions"), url: "/sabha", icon: Video },
      ]
    : [
        { title: t("डॅशबोर्ड", "Dashboard"), url: "/dashboard", icon: LayoutDashboard },
        { title: t("सूचना व्यवस्थापन", "Notice Management"), url: "/notices", icon: Megaphone },
        { title: t("ई-निविदा", "Tenders"), url: "/tenders", icon: FileSpreadsheet },
        { title: t("नागरी तक्रारी", "Civic Complaints"), url: "/complaints", icon: MessageSquare },
        { title: t("दाखले व सेवा अर्ज", "Service Applications"), url: "/applications", icon: FileCheck2 },
        { title: t("विकास प्रकल्प", "Projects"), url: "/projects", icon: FolderOpen },
        { title: t("बातमीपत्र", "News"), url: "/news", icon: FileText },
        { title: t("सभा / ठराव", "Sabha / Resolutions"), url: "/sabha", icon: Video },
        { title: t("कर्मचारी रोस्टर व भूमिका", "Employee Roster & Roles"), url: "/staff", icon: UserCog },
        { title: t("ऑडिट व ॲक्टिव्हिटी लॉग", "Audit & Activity Logs"), url: "/logs", icon: History },
        { title: t("दैनंदिन दिनक्रम", "Routine"), url: "/routine", icon: Calendar },
        { title: t("पदाधिकारी", "Officials"), url: "/officials", icon: Users },
        { title: t("गॅलरी व्यवस्थापन", "Gallery"), url: "/gallery", icon: ImageIcon },
        { title: t("शासकीय योजना", "Schemes"), url: "/schemes", icon: BookOpen },
        { title: t("सेटिंग्ज", "Settings"), url: "/settings", icon: Settings },
      ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card/95 backdrop-blur-md shadow-xl">
      
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
        <div className="w-10 h-10 rounded-2xl gov-gradient flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!isCollapsedDesktop && (
          <div className="overflow-hidden flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm text-foreground truncate">{t("वाई नगरपरिषद,वाई", "Wai Municipal Council, Wai")}</span>
            </div>
            {isDeptOfficer ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 mt-0.5 truncate max-w-full">
                <Building2 className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{user?.department || t("विभागीय अधिकारी", "Dept. Officer")}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-0.5">
                <Settings className="w-2.5 h-2.5" />
                {t("मुख्य प्रशासन पॅनेल", "Super Admin Panel")}
              </span>
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
              {t("प्रशासकीय मेनू", "Administrative Navigation")}
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
                      activeClassName="gov-gradient text-white shadow-md font-black hover:text-white"
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
          {!isCollapsedDesktop && t("प्रशासन बाहेर पडा (Logout)", "Logout")}
        </Button>
      </SidebarFooter>

    </Sidebar>
  );
}
