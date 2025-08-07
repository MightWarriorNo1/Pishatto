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
import ReceiptTestPage from './components/dashboard/ReceiptTestPage';
import { UserProvider } from './contexts/UserContext';
import { ConciergeProvider } from './contexts/ConciergeContext';
import { NotificationSettingsProvider } from './contexts/NotificationSettingsContext';

const CastLoginWrapper: React.FC = () => {
  return <CastLoginOptions onNext={() => {}} />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <NotificationSettingsProvider>
        <ConciergeProvider>
          <Router>
            <Routes>
              <Route path="/" element={<RoleSelectPage />} />
              <Route path="/register" element={<RegisterSteps />} />
              <Route path="/cast/login" element={<CastLoginWrapper />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cast/:id" element={<CastDetail />} />
              <Route path="/guest/:id" element={<GuestDetail />} />
              <Route path="/cast/dashboard" element={<CastDashboard />} />
              <Route path="/cast/grade-detail" element={<CastGradeDetailPage />} />
              <Route path="/cast/profile" element={<CastProfilePage />} />
              <Route path="/cast/:id/message" element={<CastMessageDetailPage />} />
              <Route path="/receipt-test" element={<ReceiptTestPage />} />
            </Routes>
          </Router>
        </ConciergeProvider>
      </NotificationSettingsProvider>
    </UserProvider>
  );
};

export default App;
