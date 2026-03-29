import TopHeader from "@/components/TopHeader";
import MainNav from "@/components/MainNav";
import HeroSection from "@/components/HeroSection";
import LeadershipSection from "@/components/LeadershipSection";
import QuickServices from "@/components/QuickServices";
import MayorRoutine from "@/components/MayorRoutine";
import NoticeBoard from "@/components/NoticeBoard";
import LatestNews from "@/components/LatestNews";
import Projects from "@/components/Projects";
import ComplaintForm from "@/components/ComplaintForm";
import TrackApplication from "@/components/TrackApplication";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-devanagari">
      <TopHeader />
      <MainNav />
      <HeroSection />
      <QuickServices />
      <MayorRoutine />
      <LeadershipSection />
      <NoticeBoard />
      <LatestNews />
      <Projects />
      <ComplaintForm />
      <TrackApplication />
      <Footer />
    </div>
  );
};

export default Index;
