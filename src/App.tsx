import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from '@/lib/supabase';
import { useBootstrapAuth } from '@/hooks/useBootstrapAuth';

import { LandingPage } from '@/pages/StandardPages/LandingPage';
import { ResetPassword } from '@/pages/StandardPages/ResetPassword';
import UserOnboarding from '@/pages/StandardPages/UserOnboarding';
import { Dashboard } from '@/pages/StandardPages/Dashboard';
import { ContractDashboard } from '@/pages/Contract/ContractDashboard';
import ContractSettings from '@/pages/Contract/ContractSettings';
import { Calculators } from '@/pages/Contract/Calculators';
import { CalculatorUsage } from '@/pages/Contract/CalculatorUsage';
import { CalculatorCreation } from '@/pages/Contract/CalculatorCreation';
import { ChangeOrders } from '@/pages/Contract/ChangeOrders';
import { EquipmentLog } from '@/pages/Contract/EquipmentLog';
import { Inspections } from '@/pages/Contract/Inspections';
import { Issues } from '@/pages/Contract/Issues';
import { LaborRecords } from '@/pages/Contract/LaborRecords';
import { DailyReports } from '@/pages/Contract/DailyReports';
import { DemoRedirect } from '@/pages/StandardPages/DemoRedirect';
import { NotFoundPage } from '@/pages/StandardPages/NotFoundPage';

import { ProtectedRoute } from '@/pages/StandardPages/StandardPageComponents/ProtectedRoute';
import { Navbar } from '@/pages/StandardPages/StandardPageComponents/Navbar';
import { ScrollToTop } from '@/pages/StandardPages/StandardPageComponents/ScrollToTop';

export default function App() {
  const isLoading = useBootstrapAuth();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(false);

  // Hide navbar on these public routes
  const hideNavbarRoutes = ['/', '/demo', '/reset-password', '/onboarding'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  // Debug current session/user
  useEffect(() => {
    const debugSession = async () => {
      const { data: session } = await supabase.auth.getSession();
      const { data: user } = await supabase.auth.getUser();
      console.log('[App Debug] Session:', session);
      console.log('[App Debug] User:', user);
    };
    debugSession();
  }, []);

  // Page transition loader
  useEffect(() => {
    setPageLoading(true);
    const timeout = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 mt-4">Loading Macadamy...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <ScrollToTop />
      {pageLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary animate-pulse z-50" />
      )}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoRedirect />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<UserOnboarding />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id"
          element={
            <ProtectedRoute>
              <ContractDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts/:id/contractsettings"
          element={
            <ProtectedRoute>
              <ContractSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculators"
          element={
            <ProtectedRoute>
              <Calculators />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculators/usage"
          element={
            <ProtectedRoute>
              <CalculatorUsage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculators/create"
          element={
            <ProtectedRoute>
              <CalculatorCreation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/changeorders"
          element={
            <ProtectedRoute>
              <ChangeOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipmentlog"
          element={
            <ProtectedRoute>
              <EquipmentLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspections"
          element={
            <ProtectedRoute>
              <Inspections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/issues"
          element={
            <ProtectedRoute>
              <Issues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laborrecords"
          element={
            <ProtectedRoute>
              <LaborRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dailyreports"
          element={
            <ProtectedRoute>
              <DailyReports />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Analytics />
      {/*
        // TODO: Add role-based access control via ProtectedRoute props
        // <ProtectedRoute allowedRoles={['engineer']}><EngineerDashboard /></ProtectedRoute>
      */}
    </>
  );
}