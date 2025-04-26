// App.tsx

// React and Libraries
import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { ResetPassword } from './pages/ResetPassword';
import { UserOnboarding } from './pages/UserOnboarding';
import { Dashboard } from './pages/Dashboard';
import { ContractDashboard } from './pages/ContractDashboard';
import { ContractSettings } from './pages/ContractSettings';
import { CalculatorCreation } from './pages/CalculatorCreation';
import { Calculators } from './pages/Calculators';
import { CalculatorUsage } from './pages/CalculatorUsage';
import { ChangeOrders } from './pages/ChangeOrders';
import { EquipmentLog } from './pages/EquipmentLog';
import { Inspections } from './pages/Inspections';
import { Issues } from './pages/Issues';
import { LaborRecords } from './pages/LaborRecords';
import { DailyReports } from './pages/DailyReports';
import { DemoRedirect } from './pages/DemoRedirect';
import { NotFoundPage } from './pages/NotFoundPage';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { ScrollToTop } from './components/ScrollToTop';
import { Toaster } from 'sonner';

// Utilities and Libraries
import { Analytics } from '@vercel/analytics/react';
import { supabase } from './lib/supabase';

// Store and Hooks
import { useBootstrapAuth } from './hooks/useBootstrapAuth';

export default function App() {
  const isLoading = useBootstrapAuth();
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/reset-password', '/onboarding'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    const debugSession = async () => {
      const session = await supabase.auth.getSession();
      const user = await supabase.auth.getUser();
      console.log('[App Debug] Session:', session);
      console.log('[App Debug] User:', user);
    };
    debugSession();
  }, []);

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
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<UserOnboarding />} />
        <Route path="/demo" element={<DemoRedirect />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/contracts/:id" element={<ProtectedRoute><ContractDashboard /></ProtectedRoute>} />
        <Route path="/contracts/:id/contractsettings" element={<ProtectedRoute><ContractSettings /></ProtectedRoute>} />
        <Route path="/calculators" element={<ProtectedRoute><Calculators /></ProtectedRoute>} />
        <Route path="/calculators/usage" element={<ProtectedRoute><CalculatorUsage /></ProtectedRoute>} />
        <Route path="/calculators/create" element={<ProtectedRoute><CalculatorCreation /></ProtectedRoute>} />
        <Route path="/changeorders" element={<ProtectedRoute><ChangeOrders /></ProtectedRoute>} />
        <Route path="/equipmentlog" element={<ProtectedRoute><EquipmentLog /></ProtectedRoute>} />
        <Route path="/inspections" element={<ProtectedRoute><Inspections /></ProtectedRoute>} />
        <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
        <Route path="/laborrecords" element={<ProtectedRoute><LaborRecords /></ProtectedRoute>} />
        <Route path="/dailyreports" element={<ProtectedRoute><DailyReports /></ProtectedRoute>} />

        {/* Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Analytics />

      {/* 
        // TODO:
        In the future, apply role-based ProtectedRoutes 
        Example: 
        <ProtectedRoute allowedRoles={['engineer']}><EngineerDashboard /></ProtectedRoute>
      */}
    </>
  );
}
