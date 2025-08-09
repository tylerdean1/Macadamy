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
const LandingPage = lazy(() => import('@/pages/StandardPages/LandingPage'));
const ResetPassword = lazy(() => import('@/pages/StandardPages/ResetPassword'));
const UpdatePassword = lazy(() => import('@/pages/StandardPages/UpdatePassword'));
const UserOnboarding = lazy(() => import('@/pages/StandardPages/UserOnboarding'));
const Dashboard = lazy(() => import('@/pages/StandardPages/Dashboard'));

const ProjectDashboard = lazy(() => import('@/pages/Projects/ProjectDashboard'));
const ContractSettings = lazy(() => import('@/pages/Projects/ContractSettings'));
const ContractCreation = lazy(() => import('@/pages/Projects/ContractCreation'));
const Calculators = lazy(() => import('@/pages/Projects/Calculators'));
const CalculatorUsage = lazy(() => import('@/pages/Projects/CalculatorUsage'));
const CalculatorCreation = lazy(() => import('@/pages/Projects/CalculatorCreation'));
const ChangeOrders = lazy(() => import('@/pages/Projects/ChangeOrders'));
const EquipmentLog = lazy(() => import('@/pages/Projects/EquipmentLog'));
const Inspections = lazy(() => import('@/pages/Projects/Inspections'));
const Issues = lazy(() => import('@/pages/Projects/Issues'));
const DailyReports = lazy(() => import('@/pages/Projects/DailyReports'));

const Projects = lazy(() => import('@/pages/Features/Projects'));
const Estimates = lazy(() => import('@/pages/Features/Estimates'));
const CostCodes = lazy(() => import('@/pages/Features/CostCodes'));
const ScheduleTasks = lazy(() => import('@/pages/Features/ScheduleTasks'));
const PreconstructionBidding = lazy(() => import('@/pages/Features/PreconstructionBidding'));
const DocumentManagement = lazy(() => import('@/pages/Features/DocumentManagement'));
const FinancialManagement = lazy(() => import('@/pages/Features/FinancialManagement'));
const FieldOperations = lazy(() => import('@/pages/Features/FieldOperations'));
const AccountingPayroll = lazy(() => import('@/pages/Features/AccountingPayroll'));
const ResourcePlanning = lazy(() => import('@/pages/Features/ResourcePlanning'));
const ReportingCollaboration = lazy(() => import('@/pages/Features/ReportingCollaboration'));
const OrganizationDashboard = lazy(() => import('@/pages/Organization/OrganizationDashboard'));
const OrganizationOnboarding = lazy(() => import('@/pages/Organization/OrganizationOnboarding'));
const QualitySafety = lazy(() => import("@/pages/Features/QualitySafety"));
const SubcontractorManagement = lazy(() => import("@/pages/Features/SubcontractorManagement"));
const EquipmentManagement = lazy(() => import('@/pages/Features/EquipmentManagement'));
const DesignReviews = lazy(() => import('@/pages/Features/DesignReviews'));
const EquipmentMaintenance = lazy(() => import('@/pages/Features/EquipmentMaintenance'));
const AccountsPayable = lazy(() => import('@/pages/Features/AccountsPayable'));
const AccountsReceivable = lazy(() => import('@/pages/Features/AccountsReceivable'));
const Payments = lazy(() => import('@/pages/Features/Payments'));

const NotFoundPage = lazy(() => import('@/pages/StandardPages/NotFoundPage'));

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
    if (!import.meta.env.DEV) return;
    const debug = typeof localStorage !== 'undefined' && localStorage.getItem('DEBUG_AUTH') === '1';
    if (!debug) return;
    (async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const { data: userData, error: userError } = await supabase.auth.getUser();

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
  }, []);

  /* hide navbar on auth-style routes */
  const hideNavbarRoutes: string[] = ['/', '/reset-password', '/onboarding'];
  const shouldShowNavbar: boolean = !hideNavbarRoutes.includes(location.pathname);

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

      {import.meta.env.PROD && <Analytics />}

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/onboarding" element={<UserOnboarding />} />

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
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id/settings"
            element={
              <ProtectedRoute>
                <ContractSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/create"
            element={
              <ProtectedRoute>
                <ContractCreation />
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

          {/* Core features */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estimates"
            element={
              <ProtectedRoute>
                <Estimates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cost-codes"
            element={
              <ProtectedRoute>
                <CostCodes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule-tasks"
            element={
              <ProtectedRoute>
                <ScheduleTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/preconstruction"
            element={
              <ProtectedRoute>
                <PreconstructionBidding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-management"
            element={
              <ProtectedRoute>
                <DocumentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financial-management"
            element={
              <ProtectedRoute>
                <FinancialManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/field-operations"
            element={
              <ProtectedRoute>
                <FieldOperations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment-management"
            element={
              <ProtectedRoute>
                <EquipmentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/design-reviews"
            element={
              <ProtectedRoute>
                <DesignReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/equipment-maintenance"
            element={
              <ProtectedRoute>
                <EquipmentMaintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounting-payroll"
            element={
              <ProtectedRoute>
                <AccountingPayroll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts-payable"
            element={
              <ProtectedRoute>
                <AccountsPayable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts-receivable"
            element={
              <ProtectedRoute>
                <AccountsReceivable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resource-planning"
            element={
              <ProtectedRoute>
                <ResourcePlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reporting"
            element={
              <ProtectedRoute>
                <ReportingCollaboration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quality-safety"
            element={
              <ProtectedRoute>
                <QualitySafety />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subcontractors"
            element={
              <ProtectedRoute>
                <SubcontractorManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations"
            element={
              <ProtectedRoute>
                <OrganizationDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizations/onboarding"
            element={
              <ProtectedRoute>
                <OrganizationOnboarding />
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
