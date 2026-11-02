import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import TopHeader from "@/components/TopHeader";
import MainNav from "@/components/MainNav";
import Footer from "@/components/Footer";
import QuickSearchModal from "@/components/QuickSearchModal";
import MobileQuickDock from "@/components/MobileQuickDock";

/**
 * PublicLayout: Persistent layout wrapper for all public-facing pages.
 * Keeps TopHeader (announcement ticker marquee & contact info) and MainNav
 * mounted in the DOM across route navigations, preventing any marquee reset,
 * reload flicker, or redundant re-subscriptions.
 */
const PublicLayout = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("open-quick-search", handleOpenSearch);
    return () => window.removeEventListener("open-quick-search", handleOpenSearch);
  }, []);

  return (
    <div className="min-h-screen bg-background font-devanagari relative pb-16 lg:pb-0 flex flex-col">
      {/* Persistent Header & Scrolling Announcement Marquee */}
      <TopHeader />
      
      {/* Persistent Navigation Bar */}
      <MainNav />

      {/* Dynamic Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Global Footer */}
      <Footer />

      {/* Global Quick Search Modal (Ctrl+K or Header search button) */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Floating Action Dock */}
      <MobileQuickDock onOpenSearch={() => setIsSearchOpen(true)} />
    </div>
  );
};

export default PublicLayout;
