import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import LandingPage from './pages/LandingPage';
import RoleSelectPage from './pages/RoleSelectPage';
import RegisterSteps from './components/auth/RegisterSteps';
import CastLoginOptions from './components/cast/auth/CastLoginOptions';
import Dashboard from './components/dashboard/Dashboard';
import CastDetail from './pages/CastDetail';
import GuestDetail from './pages/GuestDetail';
import CastDashboard from './pages/cast/CastDashboard';
import CastGradeDetailPage from './pages/cast/CastGradeDetailPage';
import CastProfilePage from './pages/cast/CastProfilePage';
import CastMessageDetailPage from './pages/cast/CastMessageDetailPage';
import PublicReceiptView from './components/dashboard/PublicReceiptView';
import LineLogin from './pages/LineLogin';
import LineRegister from './pages/LineRegister';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserProvider } from './contexts/UserContext';
import { CastProvider } from './contexts/CastContext';
import { ConciergeProvider } from './contexts/ConciergeContext';
import { NotificationSettingsProvider } from './contexts/NotificationSettingsContext';
import { queryClient } from './lib/react-query';
import CastRegisterPage from './pages/cast/CastRegisterPage';
import CastRegisterDirectPage from './pages/cast/CastRegisterDirectPage';
import { useFavicon } from './hooks/useFavicon';
import TermsOfService from './pages/legal/TermsOfService';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfSale from './pages/legal/TermsOfSale';
import PaymentReturnPage from './pages/PaymentReturnPage';

const CastLoginWrapper: React.FC = () => {
  return <CastLoginOptions onNext={() => {}} />;
};

// Component that manages favicon state
const FaviconManager: React.FC = () => {
  useFavicon();
  return null; // This component doesn't render anything
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <CastProvider>
            <NotificationSettingsProvider>
              <ConciergeProvider>
                <FaviconManager />
                  <Router>
                  <Routes>
                    <Route path="/welcome" element={<LandingPage />} />
                    <Route path="/" element={<RoleSelectPage />} />
                    <Route path="/legal/terms" element={<TermsOfService />} />
                    <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                    <Route path="/legal/specified-commercial" element={<TermsOfSale />} />
                    <Route path="/register" element={<RegisterSteps />} />
                    <Route path="/cast/login" element={<CastLoginWrapper />} />
                    <Route path="/line-login" element={<LineLogin />} />
                    <Route path="/line-register" element={<LineRegister />} />
                    <Route path="/receipt/:receiptNumber" element={<PublicReceiptView />} />
                    <Route path="/payment/return" element={<PaymentReturnPage />} />
                    <Route path="/cast/register" element={<CastRegisterPage />} />
                    <Route path="/cast/register-direct" element={<CastRegisterDirectPage />} />  
                    <Route path="/dashboard" element={
                      <ProtectedRoute userType="guest">
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/cast/:id" element={<CastDetail />} />
                    <Route path="/guest/:id" element={<GuestDetail />} />
                    <Route path="/cast/dashboard" element={
                      <ProtectedRoute userType="cast">
                        <CastDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/cast/grade-detail" element={
                      <ProtectedRoute userType="cast">
                        <CastGradeDetailPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/cast/profile" element={
                      <ProtectedRoute userType="cast">
                        <CastProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/cast/:id/message" element={
                      <ProtectedRoute userType="cast">
                        <CastMessageDetailPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                  </Router>
              </ConciergeProvider>
            </NotificationSettingsProvider>
          </CastProvider>
        </UserProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
