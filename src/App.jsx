import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardStats from './pages/DashboardStats';
import CoachDashboard from './pages/CoachDashboard';
import Packages from './pages/Packages';
import Staff from './pages/Staff';
import Members from './pages/Members';
import Attendance from './pages/Attendance';
import Financials from './pages/Financials';
import Branches from './pages/Branches';
import WhatsApp from './pages/WhatsApp';


// Private Route Guard (handles auth and role checks with normalization)
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-cyber-dark)]">
        <div className="w-10 h-10 border-t-2 border-r-2 border-[var(--color-neon-emerald)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const normUserRole = user.role.toLowerCase().replace(/gym-/, '');
    const isAuthorized = allowedRoles.some(r => r.toLowerCase().replace(/gym-/, '') === normUserRole);
    
    if (!isAuthorized) {
      // Redirect back to a permitted dashboard based on normalized role
      const defaultRedirect = normUserRole === 'coach' ? '/coach-dashboard' : '/members';
      return <Navigate to={defaultRedirect} replace />;
    }
  }

  return children;
};

// Root index redirect based on role (normalized)
const RootRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  const normRole = user.role.toLowerCase().replace(/gym-/, '');
  
  // Direct default routes based on role RBAC
  if (normRole === 'owner') return <Navigate to="/stats" replace />;
  if (normRole === 'coach') return <Navigate to="/coach-dashboard" replace />;
  return <Navigate to="/members" replace />;
};

function App() {
  return (
    <>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard Shell wrapping protected modules */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<RootRedirect />} />
          
          <Route
            path="stats"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner']}>
                <DashboardStats />
              </PrivateRoute>
            }
          />
          <Route
            path="coach-dashboard"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner', 'Coach']}>
                <CoachDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="packages"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner']}>
                <Packages />
              </PrivateRoute>
            }
          />
          <Route
            path="staff"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner']}>
                <Staff />
              </PrivateRoute>
            }
          />
          <Route
            path="members"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner', 'Coach', 'Receptionist']}>
                <Members />
              </PrivateRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner', 'Receptionist']}>
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="financials"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner']}>
                <Financials />
              </PrivateRoute>
            }
          />
          <Route
            path="branches"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner']}>
                <Branches />
              </PrivateRoute>
            }
          />
          <Route
            path="whatsapp"
            element={
              <PrivateRoute allowedRoles={['Gym-Owner', 'Coach', 'Receptionist']}>
                <WhatsApp />
              </PrivateRoute>
            }
          />

          
          {/* Catch-all fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Route>
      </Routes>

      {/* Global premium Toast alerts configuration */}
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            background: 'rgba(16, 18, 27, 0.9)',
            border: '1px solid rgba(45, 212, 191, 0.2)',
            color: '#e2e8f0',
            backdropFilter: 'blur(10px)',
            fontFamily: 'Cairo, sans-serif',
            fontSize: '13px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0a0a0f',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#0a0a0f',
            },
          },
        }}
      />
    </>
  );
}

export default App;
