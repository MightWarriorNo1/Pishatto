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
      </Routes>
    </Router>
  );
};

export default App;
