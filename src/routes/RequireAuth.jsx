import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';

function FullScreenLoader() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)]">
      <Spinner size={22} />
    </div>
  );
}

// Blocks until a session exists; optionally restricts to a role and sends
// the wrong role to its own home instead of a dead end.
export function RequireAuth({ role, children }) {
  const { session, role: currentRole, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && currentRole && currentRole !== role) {
    return <Navigate to={currentRole === 'admin' ? '/admin' : '/'} replace />;
  }
  return children;
}
