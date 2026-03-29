import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import { Introduction, History, Structure, Mayor, ChiefOfficer, Corporators } from "./pages/about/AboutPages";
import { GeneralAdmin, Health, Water, Civil, Planning, Tax, Electrical, Computer, Fire, BirthDeath, Accounts, Records, Disabled, WomenChild } from "./pages/departments/DepartmentPages";
import { PropertyTax, WaterBill, Complaint, BirthCertificate, DeathCertificate, ConstructionPermit } from "./pages/services/ServicePages";
import { CentralSchemes, StateSchemes, LocalSchemes, PMAY, SwachhBharat } from "./pages/schemes/SchemePages";
import SchemesPage from "./pages/schemes/SchemesPage";
import Tenders from "./pages/Tenders";
import Tourism from "./pages/Tourism";
import Acts from "./pages/Acts";
import LawsPage from "./pages/LawsPage";
import TrackPage from "./pages/TrackPage";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import LiveSabhaPage from "./pages/LiveSabhaPage";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminNews from "./pages/admin/AdminNews";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminRoutine from "./pages/admin/AdminRoutine";
import AdminOfficials from "./pages/admin/AdminOfficials";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminSabha from "./pages/admin/AdminSabha";
import AdminSchemes from "./pages/admin/AdminSchemes";
import { AdminSettings } from "./pages/admin/AdminPlaceholders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>        <AuthProvider>        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />

            {/* About */}
            <Route path="/about/introduction" element={<Introduction />} />
            <Route path="/about/history" element={<History />} />
            <Route path="/about/structure" element={<Structure />} />
            <Route path="/about/mayor" element={<Mayor />} />
            <Route path="/about/chief-officer" element={<ChiefOfficer />} />
            <Route path="/about/corporators" element={<Corporators />} />

            {/* Departments */}
            <Route path="/departments/general-admin" element={<GeneralAdmin />} />
            <Route path="/departments/health" element={<Health />} />
            <Route path="/departments/water" element={<Water />} />
            <Route path="/departments/civil" element={<Civil />} />
            <Route path="/departments/planning" element={<Planning />} />
            <Route path="/departments/tax" element={<Tax />} />
            <Route path="/departments/electrical" element={<Electrical />} />
            <Route path="/departments/computer" element={<Computer />} />
            <Route path="/departments/fire" element={<Fire />} />
            <Route path="/departments/birth-death" element={<BirthDeath />} />
            <Route path="/departments/accounts" element={<Accounts />} />
            <Route path="/departments/records" element={<Records />} />
            <Route path="/departments/disabled" element={<Disabled />} />
            <Route path="/departments/women" element={<WomenChild />} />

            {/* Services */}
            <Route path="/services/property-tax" element={<PropertyTax />} />
            <Route path="/services/water-bill" element={<WaterBill />} />
            <Route path="/services/complaint" element={<Complaint />} />
            <Route path="/services/birth-certificate" element={<BirthCertificate />} />
            <Route path="/services/death-certificate" element={<DeathCertificate />} />
            <Route path="/services/construction-permit" element={<ConstructionPermit />} />

            {/* Schemes */}
            <Route path="/schemes/central" element={<CentralSchemes />} />
            <Route path="/schemes/state" element={<StateSchemes />} />
            <Route path="/schemes/local" element={<LocalSchemes />} />
            <Route path="/schemes/pmay" element={<PMAY />} />
            <Route path="/schemes/swachh-bharat" element={<SwachhBharat />} />
            <Route path="/schemes/all" element={<SchemesPage />} />

            {/* Others */}
            <Route path="/tenders" element={<Tenders />} />
            <Route path="/acts" element={<Acts />} />
            <Route path="/laws" element={<LawsPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/tourism" element={<Tourism />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/live-sabha" element={<LiveSabhaPage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="complaints" element={<AdminComplaints />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="sabha" element={<AdminSabha />} />
              <Route path="routine" element={<AdminRoutine />} />
              <Route path="officials" element={<AdminOfficials />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="schemes" element={<AdminSchemes />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
