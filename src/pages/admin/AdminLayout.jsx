import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Users, CreditCard, FileSignature, Settings as SettingsIcon,
  Plus, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NewProjectModal from './NewProjectModal';

const NAV = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: Briefcase },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/contracts', label: 'Contracts', icon: FileSignature },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

// Denser/utilitarian sidebar shell shared by every admin screen. "New
// project" is a persistent action, not a nav item — it opens a modal from
// anywhere in the admin side.
export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [showNew, setShowNew] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 shrink-0 glass-strong flex flex-col transition-transform md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-[var(--border-soft)]">
          <div className="w-7 h-7 rounded-md bg-[var(--gold)] flex items-center justify-center font-display font-bold text-[13px] text-[var(--bg)]">
            A
          </div>
          <span className="font-display text-[15px] font-semibold text-[var(--white)]">
            Arcodic <span className="text-[var(--gold-dim)] font-normal">Admin</span>
          </span>
          <button className="ml-auto md:hidden text-[var(--muted)]" onClick={() => setMobileOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <button
          onClick={() => setShowNew(true)}
          className="mx-4 mt-4 flex items-center justify-center gap-2 rounded-lg bg-[var(--gold)] text-[var(--bg)] py-2.5 text-[11px] font-medium uppercase tracking-wider hover:bg-[var(--cream)] transition-colors"
        >
          <Plus size={14} /> New Project
        </button>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12px] transition-colors ${
                  isActive
                    ? 'bg-[var(--gold-faint)] text-[var(--gold)]'
                    : 'text-[var(--text-dim)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--text)]'
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border-soft)]">
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg text-[11px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden h-14 flex items-center px-4 border-b border-[var(--border-soft)]">
          <button onClick={() => setMobileOpen(true)} className="text-[var(--muted)]">
            <Menu size={18} />
          </button>
        </div>
        <main className="flex-1 px-6 md:px-10 py-8 md:py-10 max-w-[1400px] w-full">
          <Outlet context={{ openNewProject: () => setShowNew(true) }} />
        </main>
      </div>

      {showNew && (
        <NewProjectModal
          onClose={() => setShowNew(false)}
          onCreated={(project) => {
            setShowNew(false);
            navigate(`/admin/projects/${project.id}`);
          }}
        />
      )}
    </div>
  );
}
