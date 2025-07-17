import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegisterSteps from './components/auth/RegisterSteps';
import Dashboard from './components/dashboard/Dashboard';
import CastDetail from './pages/CastDetail';
import RoleSelectPage from './pages/RoleSelectPage';
import CastLogin from './pages/cast/CastLogin';
import CastDashboard from './pages/cast/CastDashboard';
import CastGradeDetailPage from './pages/cast/CastGradeDetailPage';
import CastPointHistoryPage from './pages/cast/CastPointHistoryPage';
import CastActivityRecordPage from './pages/cast/CastActivityRecordPage';
import CastFriendReferralPage from './pages/cast/CastFriendReferralPage';
import CastImmediatePaymentPage from './pages/cast/CastImmediatePaymentPage';
import CastGiftBoxPage from './pages/cast/CastGiftBoxPage';
import CastProfilePage from './pages/cast/CastProfilePage';
import CastMessageDetailPage from './pages/cast/CastMessageDetailPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelectPage />} />
        <Route path="/register" element={<RegisterSteps />} />
        <Route path="/cast/login" element={<CastLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cast/:id" element={<CastDetail />} />
        <Route path="/cast/dashboard" element={<CastDashboard />} />
        <Route path="/cast/grade-detail" element={<CastGradeDetailPage />} />
        <Route path="/cast/point-history" element={<CastPointHistoryPage />} />
        <Route path="/cast/activity-record" element={<CastActivityRecordPage />} />
        <Route path="/cast/friend-referral" element={<CastFriendReferralPage />} />
        <Route path="/cast/immediate-payment" element={<CastImmediatePaymentPage />} />
        <Route path="/cast/gift-box" element={<CastGiftBoxPage />} />
        <Route path="/cast/profile" element={<CastProfilePage />} />
        <Route path="/cast/:id/message" element={<CastMessageDetailPage />} />
      </Routes>
    </Router>
  );
};

export default App;
