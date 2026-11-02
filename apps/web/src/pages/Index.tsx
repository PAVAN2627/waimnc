import HeroSection from "@/components/HeroSection";
import LeadershipSection from "@/components/LeadershipSection";
import QuickServices from "@/components/QuickServices";
import MayorRoutine from "@/components/MayorRoutine";
import NoticeBoard from "@/components/NoticeBoard";
import LatestNews from "@/components/LatestNews";
import Projects from "@/components/Projects";
import ComplaintForm from "@/components/ComplaintForm";
import TrackApplication from "@/components/TrackApplication";
import CivicStatsCounter from "@/components/CivicStatsCounter";

const Index = () => {
  return (
    <>
      {/* Hero Section */}
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
    </>
  );
};

export default Index;
