import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequireAuth } from './routes/RequireAuth';
import Login from './pages/Login';
import ClientDashboard from './pages/client/ClientDashboard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminHome from './pages/admin/Home';
import Projects from './pages/admin/Projects';
import ProjectDetail from './pages/admin/ProjectDetail';
import Clients from './pages/admin/Clients';
import Payments from './pages/admin/Payments';
import Contracts from './pages/admin/Contracts';
import Settings from './pages/admin/Settings';
import { Spinner, AuthErrorScreen } from './components/ui';

// Landing at "/" — routes to the right dashboard by role once a session
// exists, otherwise off to /login.
function RoleHome() {
  const { session, role, loading, authError } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Spinner size={22} />
      </div>
    );
  }
  if (authError) return <AuthErrorScreen message={authError} />;
  if (!session) return <Navigate to="/login" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <ClientDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleHome />} />

        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="payments" element={<Payments />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
