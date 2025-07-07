// <start App.tsx>
import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

import { supabase } from '@/lib/supabase';
import { useBootstrapAuth } from '@/hooks/useBootstrapAuth';
import { useAuthStore } from '@/lib/store';

import { ProtectedRoute } from '@/pages/StandardPages/StandardPageComponents/ProtectedRoute';
import { Navbar } from '@/pages/StandardPages/StandardPageComponents/Navbar';
import { ScrollToTop } from '@/pages/StandardPages/StandardPageComponents/ScrollToTop';

/* ── lazy-loaded pages ─────────────────────────────────────────── */
const LandingPage        = lazy(() => import('@/pages/StandardPages/LandingPage'));
const ResetPassword      = lazy(() => import('@/pages/StandardPages/ResetPassword'));
const UpdatePassword     = lazy(() => import('@/pages/StandardPages/UpdatePassword'));
const UserOnboarding     = lazy(() => import('@/pages/StandardPages/UserOnboarding'));
const Dashboard          = lazy(() => import('@/pages/StandardPages/Dashboard'));

const ContractDashboard  = lazy(() => import('@/pages/Contract/ContractDashboard'));
const ContractSettings   = lazy(() => import('@/pages/Contract/ContractSettings'));
const Calculators        = lazy(() => import('@/pages/Contract/Calculators'));
const CalculatorUsage    = lazy(() => import('@/pages/Contract/CalculatorUsage'));
const CalculatorCreation = lazy(() => import('@/pages/Contract/CalculatorCreation'));
const ChangeOrders       = lazy(() => import('@/pages/Contract/ChangeOrders'));
const EquipmentLog       = lazy(() => import('@/pages/Contract/EquipmentLog'));
const Inspections        = lazy(() => import('@/pages/Contract/Inspections'));
const Issues             = lazy(() => import('@/pages/Contract/Issues'));
const DailyReports       = lazy(() => import('@/pages/Contract/DailyReports'));

const NotFoundPage       = lazy(() => import('@/pages/StandardPages/NotFoundPage'));

/* ── component ─────────────────────────────────────────────────── */
export default function App(): JSX.Element {
  /* bootstraps auth → sets store, returns nothing we need here */
  useBootstrapAuth();

  const { loading, user } = useAuthStore();

  /* block UI only while we’re restoring a stored session */
  const isLoading: boolean = loading.initialization && user !== null;

  /* page-transition “mini progress bar” */
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  useEffect(() => {
    setPageLoading(true);
    const t = setTimeout(() => setPageLoading(false), 500);
    return () => clearTimeout(t);
  }, [location.pathname]);

  /* dev-only session / user debug */
  useEffect(() => {
    if (import.meta.env.DEV) {
      (async () => {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const { data: userData,    error: userError    } = await supabase.auth.getUser();

        // Narrowing: only log when result objects contain expected keys
        if (sessionError) {
          console.warn('[App] session error', sessionError);
        } else {
          console.log('[App] session', sessionData);
        }

        if (userError) {
          console.warn('[App] user error', userError);
        } else {
          console.log('[App] user', userData);
        }
      })().catch(console.error);
    }
  }, []);

  /* hide navbar on auth-style routes */
  const hideNavbarRoutes: string[] = ['/', '/reset-password', '/onboarding'];
  const shouldShowNavbar: boolean  = !hideNavbarRoutes.includes(location.pathname);

  /* ── initial bootstrap spinner ──────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 mt-4">Loading Macadamy…</p>
        </div>
      </div>
    );
  }

  /* ── main app shell ─────────────────────────────────────────── */
  return (
    <>
      <Toaster position="top-right" />
      <ScrollToTop />

      {pageLoading && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary animate-pulse z-50" />
      )}

      {shouldShowNavbar && <Navbar />}

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-400 mt-4">Loading page…</p>
            </div>
          </div>
        }
      >
        <Routes>
          {/* ── public ─────────────────────────────────────────── */}
          <Route path="/"              element={<LandingPage />}   />
          <Route path="/reset-password"   element={<ResetPassword />} />
          <Route path="/update-password"  element={<UpdatePassword />} />
          <Route path="/onboarding"    element={<UserOnboarding />} />

          {/* ── protected (authenticated) ─────────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Contract stack */}
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

          {/* Calculator stack */}
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

          {/* Other tools */}
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

      {/* Future: role-based ProtectedRoute props
       * <ProtectedRoute allowedRoles={['engineer']}>…</ProtectedRoute>
       */}
    </>
  );
}
