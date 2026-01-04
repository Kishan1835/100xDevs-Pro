import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

// Pages
import CommonDashboard from '../pages/dashboard/CommonDashboard';
import PolicyDashboard from '../pages/dashboard/PolicyDashboard';
import BranchList from '../pages/branch/BranchList';
import BranchDetails from '../pages/branch/BranchDetails';
import ComplaintsPage from '../pages/complaints/ComplaintsPage';
import MapPage from '../pages/map/MapPage';

const AppRoutes = () => {
  const { user } = useAuth();

  // Redirect to appropriate dashboard based on role
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'NCVET_ADMIN':
        return '/policy-dashboard';
      case 'PRINCIPAL':
      case 'TO':
      case 'ATO':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
            
            {/* Common Dashboard for Branch roles */}
            {(user?.role === 'PRINCIPAL' || user?.role === 'TO' || user?.role === 'ATO') && (
              <Route path="/dashboard" element={<CommonDashboard />} />
            )}
            
            {/* Policy Dashboard for NCVET Admin */}
            {user?.role === 'NCVET_ADMIN' && (
              <Route path="/policy-dashboard" element={<PolicyDashboard />} />
            )}
            
            {/* Branch Management */}
            <Route path="/branches" element={<BranchList />} />
            <Route path="/branches/:id" element={<BranchDetails />} />
            
            {/* Complaints */}
            <Route path="/complaints" element={<ComplaintsPage />} />
            
            {/* Map */}
            <Route path="/map" element={<MapPage />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AppRoutes;