import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { supabase } from '@/lib/supabase';
import { useBootstrapAuth } from '@/hooks/useBootstrapAuth';

// Lazy load main pages
const LandingPage = lazy(() => import('@/pages/StandardPages/LandingPage'));
const ResetPassword = lazy(() => import('@/pages/StandardPages/ResetPassword'));
const UserOnboarding = lazy(() => import('@/pages/StandardPages/UserOnboarding'));
const Dashboard = lazy(() => import('@/pages/StandardPages/Dashboard'));
const ContractDashboard = lazy(() => import('@/pages/Contract/ContractDashboard'));
const ContractSettings = lazy(() => import('@/pages/Contract/ContractSettings'));
const Calculators = lazy(() => import('@/pages/Contract/Calculators'));
const CalculatorUsage = lazy(() => import('@/pages/Contract/CalculatorUsage'));
const CalculatorCreation = lazy(() => import('@/pages/Contract/CalculatorCreation'));
const ChangeOrders = lazy(() => import('@/pages/Contract/ChangeOrders'));
const EquipmentLog = lazy(() => import('@/pages/Contract/EquipmentLog'));
const Inspections = lazy(() => import('@/pages/Contract/Inspections'));
const Issues = lazy(() => import('@/pages/Contract/Issues'));
const DailyReports = lazy(() => import('@/pages/Contract/DailyReports'));
const DemoRedirect = lazy(() => import('@/pages/StandardPages/DemoRedirect'));
const NotFoundPage = lazy(() => import('@/pages/StandardPages/NotFoundPage'));

import { ProtectedRoute } from '@/pages/StandardPages/StandardPageComponents/ProtectedRoute';
import { Navbar } from '@/pages/StandardPages/StandardPageComponents/Navbar';
import { ScrollToTop } from '@/pages/StandardPages/StandardPageComponents/ScrollToTop';

export default function App(): JSX.Element {
  const isLoading = Boolean(useBootstrapAuth());
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // Hide navbar on these public routes
  const hideNavbarRoutes: string[] = ['/', '/demo', '/reset-password', '/onboarding'];
  const shouldShowNavbar: boolean = !hideNavbarRoutes.includes(location.pathname);

  // Debug current session/user
  useEffect((): void => {
    const debugSession = async (): Promise<void> => {
      if (import.meta.env.DEV === true && typeof supabase.auth?.getSession === 'function' && typeof supabase.auth?.getUser === 'function') {
        const sessionResult = await supabase.auth.getSession();
        if ('data' in sessionResult && !('error' in sessionResult)) {
          // @ts-expect-error: Supabase type may be incorrect, but data is present at runtime
          console.log('[App Debug] Session:', sessionResult.data);
        } else {
          console.warn('[App Debug] Could not get session:', sessionResult);
        }
        const userResult = await supabase.auth.getUser();
        if ('data' in userResult && !('error' in userResult)) {
          // @ts-expect-error: Supabase type may be incorrect, but data is present at runtime
          console.log('[App Debug] User:', userResult.data);
        } else {
          console.warn('[App Debug] Could not get user:', userResult);
        }
      }
    };
    void debugSession();
  }, []);

  // Page transition loader
  useEffect(() => {
    setPageLoading(true);
    const timeout = setTimeout(() => setPageLoading(false), 500);
    return () => { clearTimeout(timeout); };
  }, [location.pathname]);

  if (isLoading === true) {
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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" /><p className="text-gray-400 mt-4">Loading page...</p></div></div>}>
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
      </Suspense>
      <Analytics />
      {/*
        // TODO: Add role-based access control via ProtectedRoute props
        // <ProtectedRoute allowedRoles={['engineer']}><EngineerDashboard /></ProtectedRoute>
      */}
    </>
  );
}