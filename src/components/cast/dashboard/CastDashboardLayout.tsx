import React from 'react';
// @ts-ignore: Fix import path or provide type declarations if available
import BottomNavigationBar from './BottomNavigationBar';

const CastDashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="max-w-md mx-auto min-h-screen bg-primary pb-24 relative">
    {children}
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-50">
      <BottomNavigationBar />
    </div>
  </div>
);

export default CastDashboardLayout; 