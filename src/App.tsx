import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelectPage from './pages/RoleSelectPage';
import RegisterSteps from './components/auth/RegisterSteps';
import CastLoginOptions from './components/cast/auth/CastLoginOptions';
import Dashboard from './components/dashboard/Dashboard';
import CastDetail from './pages/CastDetail';
import CastDashboard from './pages/cast/CastDashboard';
import CastGradeDetailPage from './pages/cast/CastGradeDetailPage';
import CastProfilePage from './pages/cast/CastProfilePage';
import CastMessageDetailPage from './pages/cast/CastMessageDetailPage';
import { UserProvider } from './contexts/UserContext';

const CastLoginWrapper: React.FC = () => {
  return <CastLoginOptions onNext={() => {}} />;
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/register" element={<RegisterSteps />} />
          <Route path="/cast/login" element={<CastLoginWrapper />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cast/:id" element={<CastDetail />} />
          <Route path="/cast/dashboard" element={<CastDashboard />} />
          <Route path="/cast/grade-detail" element={<CastGradeDetailPage />} />
          <Route path="/cast/profile" element={<CastProfilePage />} />
          <Route path="/cast/:id/message" element={<CastMessageDetailPage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
