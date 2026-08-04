import { useState, useEffect } from "react";
import TopHeader from "@/components/TopHeader";
import MainNav from "@/components/MainNav";
import HeroSection from "@/components/HeroSection";
import LeadershipSection from "@/components/LeadershipSection";
import Officials from "@/components/Officials";
import QuickServices from "@/components/QuickServices";
import MayorRoutine from "@/components/MayorRoutine";
import NoticeBoard from "@/components/NoticeBoard";
import LatestNews from "@/components/LatestNews";
import Projects from "@/components/Projects";
import ComplaintForm from "@/components/ComplaintForm";
import TrackApplication from "@/components/TrackApplication";
import Footer from "@/components/Footer";
import WelcomeOpeningAnimation from "@/components/WelcomeOpeningAnimation";
import CivicStatsCounter from "@/components/CivicStatsCounter";
import MobileQuickDock from "@/components/MobileQuickDock";
import QuickSearchModal from "@/components/QuickSearchModal";

const Index = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("open-quick-search", handleOpenSearch);
    return () => window.removeEventListener("open-quick-search", handleOpenSearch);
  }, []);

  return (
    <div className="min-h-screen bg-background font-devanagari relative pb-16 lg:pb-0">
      {/* Website Opening Entrance Animation */}
      <WelcomeOpeningAnimation />

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Main Layout Sections */}
      <TopHeader />
      <MainNav />
      <HeroSection />

      {/* Animated Civic Milestones & Highlights */}
      <CivicStatsCounter />

      {/* Interactive Quick Services */}
      <QuickServices />

      {/* Mayor Routine & Messages */}
      <MayorRoutine />

      {/* Leadership */}
      <LeadershipSection />

      {/* Notices & Announcements */}
      <NoticeBoard />

      {/* Latest Development News */}
      <LatestNews />

      {/* Key Municipal Projects */}
      <Projects />

      {/* Grievance Complaint Portal */}
      <ComplaintForm />

      {/* Application Tracker */}
      <TrackApplication />

      {/* Footer */}
      <Footer />

      {/* Mobile Floating Action Dock */}
      <MobileQuickDock onOpenSearch={() => setIsSearchOpen(true)} />
    </div>
  );
};

export default Index;
