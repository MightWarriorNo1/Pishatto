import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import CastLineLogin from './pages/cast/CastLineLogin';
import LineRegister from './pages/LineRegister';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthDebugger from './components/debug/AuthDebugger';
import { UserProvider } from './contexts/UserContext';
import { CastProvider } from './contexts/CastContext';
import { ConciergeProvider } from './contexts/ConciergeContext';
import { NotificationSettingsProvider } from './contexts/NotificationSettingsContext';

const CastLoginWrapper: React.FC = () => {
  return <CastLoginOptions onNext={() => {}} />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <CastProvider>
        <NotificationSettingsProvider>
          <ConciergeProvider>
            <Router>
              <Routes>
                <Route path="/" element={<RoleSelectPage />} />
                <Route path="/register" element={<RegisterSteps />} />
                <Route path="/cast/login" element={<CastLoginWrapper />} />
                <Route path="/line-login" element={<LineLogin />} />
                <Route path="/cast/line-login" element={<CastLineLogin />} />
                <Route path="/line-register" element={<LineRegister />} />
                <Route path="/receipt/:receiptNumber" element={<PublicReceiptView />} />
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
              <AuthDebugger />
            </Router>
          </ConciergeProvider>
        </NotificationSettingsProvider>
      </CastProvider>
    </UserProvider>
  );
};

export default App;
