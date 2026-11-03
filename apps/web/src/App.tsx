import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NoticeProvider } from "@/contexts/NoticeContext";
import ScrollToTop from "@/components/ScrollToTop";
import PublicLayout from "@/components/PublicLayout";

import Index from "./pages/Index";
import { Introduction, History, Structure, Mayor, ChiefOfficer, Corporators } from "./pages/about/AboutPages";
import { GeneralAdmin, Health, Water, Civil, Planning, Tax, Electrical, Computer, Fire, BirthDeath, Accounts, Records, Disabled, WomenChild, Election, Establishment } from "./pages/departments/DepartmentPages";
import { PropertyTax, WaterBill, Complaint, BirthCertificate, DeathCertificate, ConstructionPermit } from "./pages/services/ServicePages";
import { CentralSchemes, StateSchemes, LocalSchemes, PMAY, SwachhBharat } from "./pages/schemes/SchemePages";
import SchemesPage from "./pages/schemes/SchemesPage";
import Tenders from "./pages/Tenders";
import GovtPortals from "./pages/GovtPortals";
import VikasYojna from "./pages/VikasYojna";
import Tourism from "./pages/Tourism";
import Acts from "./pages/Acts";
import LawsPage from "./pages/LawsPage";
import TrackPage from "./pages/TrackPage";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import LiveSabhaPage from "./pages/LiveSabhaPage";
import SitemapPage from "./pages/SitemapPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <NoticeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Persistent Public Layout: TopHeader & MainNav stay alive across all pages */}
              <Route element={<PublicLayout />}>
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
                <Route path="/departments/election" element={<Election />} />
                <Route path="/departments/establishment" element={<Establishment />} />

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

                {/* Civic & City Information */}
                <Route path="/tenders" element={<Tenders />} />
                <Route path="/portals" element={<GovtPortals />} />
                <Route path="/vikas-yojna" element={<VikasYojna />} />
                <Route path="/acts" element={<Acts />} />
                <Route path="/laws" element={<LawsPage />} />
                <Route path="/track" element={<TrackPage />} />
                <Route path="/tourism" element={<Tourism />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/live-sabha" element={<LiveSabhaPage />} />
                <Route path="/sabha-tharav" element={<LiveSabhaPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NoticeProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
