import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NoticeProvider } from "@/contexts/NoticeContext";
import RequireAuth from "@/components/RequireAuth";
import ScrollToTop from "@/components/ScrollToTop";

import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminNews from "./pages/admin/AdminNews";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminRoutine from "./pages/admin/AdminRoutine";
import AdminOfficials from "./pages/admin/AdminOfficials";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminSabha from "./pages/admin/AdminSabha";
import AdminSchemes from "./pages/admin/AdminSchemes";
import AdminTenders from "./pages/admin/AdminTenders";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminLogs from "./pages/admin/AdminLogs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <NoticeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                {/* Admin Auth Route */}
                <Route path="/" element={<AdminLogin />} />
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLogin />} />

                {/* Subdomain Root Authenticated Routes */}
                <Route
                  element={
                    <RequireAuth>
                      <AdminLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="/dashboard" element={<AdminDashboard />} />
                  <Route path="/notices" element={<AdminNotices />} />
                  <Route path="/complaints" element={<AdminComplaints />} />
                  <Route path="/applications" element={<AdminApplications />} />
                  <Route path="/projects" element={<AdminProjects />} />
                  <Route path="/news" element={<AdminNews />} />
                  <Route path="/sabha" element={<AdminSabha />} />
                  <Route path="/routine" element={<AdminRoutine />} />
                  <Route path="/officials" element={<AdminOfficials />} />
                  <Route path="/gallery" element={<AdminGallery />} />
                  <Route path="/schemes" element={<AdminSchemes />} />
                  <Route path="/tenders" element={<AdminTenders />} />
                  <Route path="/staff" element={<AdminStaff />} />
                  <Route path="/employees" element={<Navigate to="/staff" replace />} />
                  <Route path="/roster" element={<Navigate to="/staff" replace />} />
                  <Route path="/logs" element={<AdminLogs />} />
                  <Route path="/settings" element={<AdminSettings />} />

                  {/* Backward-compatible `/admin/...` paths */}
                  <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/admin/notices" element={<Navigate to="/notices" replace />} />
                  <Route path="/admin/complaints" element={<Navigate to="/complaints" replace />} />
                  <Route path="/admin/applications" element={<Navigate to="/applications" replace />} />
                  <Route path="/admin/staff" element={<Navigate to="/staff" replace />} />
                  <Route path="/admin/employees" element={<Navigate to="/staff" replace />} />
                  <Route path="/admin/roster" element={<Navigate to="/staff" replace />} />
                  <Route path="/admin/logs" element={<Navigate to="/logs" replace />} />
                  <Route path="/admin/projects" element={<Navigate to="/projects" replace />} />
                  <Route path="/admin/news" element={<Navigate to="/news" replace />} />
                  <Route path="/admin/sabha" element={<Navigate to="/sabha" replace />} />
                  <Route path="/admin/routine" element={<Navigate to="/routine" replace />} />
                  <Route path="/admin/officials" element={<Navigate to="/officials" replace />} />
                  <Route path="/admin/gallery" element={<Navigate to="/gallery" replace />} />
                  <Route path="/admin/schemes" element={<Navigate to="/schemes" replace />} />
                  <Route path="/admin/tenders" element={<Navigate to="/tenders" replace />} />
                  <Route path="/admin/settings" element={<Navigate to="/settings" replace />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NoticeProvider>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
