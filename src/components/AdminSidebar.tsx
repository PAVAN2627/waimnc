import { 
  LayoutDashboard, FileText, Users, Megaphone, FolderOpen, 
  Settings, Video, Calendar, ImageIcon, MessageSquare, LogOut, Building2, BookOpen, Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  const menuItems = [
    { title: t("डॅशबोर्ड", "Dashboard"), url: "/admin/dashboard", icon: LayoutDashboard },
    { title: t("सूचना व्यवस्थापन", "Notice Management"), url: "/admin/notices", icon: Megaphone },
    { title: t("तक्रारी निवारा", "Complaints"), url: "/admin/complaints", icon: MessageSquare },
    { title: t("विकास प्रकल्प", "Projects"), url: "/admin/projects", icon: FolderOpen },
    { title: t("बातमीपत्र", "News"), url: "/admin/news", icon: FileText },
    { title: t("लाईव्ह सभा", "Live Sabha"), url: "/admin/sabha", icon: Video },
    { title: t("दैनंदिन दिनक्रम", "Routine"), url: "/admin/routine", icon: Calendar },
    { title: t("पदाधिकारी", "Officials"), url: "/admin/officials", icon: Users },
    { title: t("गॅलरी व्यवस्थापन", "Gallery"), url: "/admin/gallery", icon: ImageIcon },
    { title: t("शासकीय योजना", "Schemes"), url: "/admin/schemes", icon: BookOpen },
    { title: t("सेटिंग्ज", "Settings"), url: "/admin/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card/80 backdrop-blur-md shadow-lg">
      
      {/* Brand Header */}
      <div className="p-4 flex items-center gap-3 border-b border-border bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10">
        <div className="w-10 h-10 rounded-2xl gov-gradient flex items-center justify-center flex-shrink-0 shadow-md border border-white/20">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm text-foreground truncate">{t("वाई नगर परिषद", "Wai Municipal Council")}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              {t("प्रशासन पॅनेल", "Admin Control Panel")}
            </span>
          </div>
        )}
      </div>

      {/* Menu List */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && (
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
                      className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 hover:bg-muted/70 text-muted-foreground hover:text-foreground group"
                      activeClassName="gov-gradient text-white shadow-md font-black hover:text-white"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {!collapsed && <span>{item.title}</span>}
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
          {!collapsed && t("प्रशासन बाहेर पडा (Logout)", "Logout")}
        </Button>
      </SidebarFooter>

    </Sidebar>
  );
}
