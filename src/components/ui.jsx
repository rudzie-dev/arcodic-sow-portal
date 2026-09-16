import React from 'react';
import { useAuth } from '../context/AuthContext';

// Small shared primitives used across both the admin and client sides so
// the two dashboards stay visually consistent while admin screens can run
// denser (smaller paddings/gaps via className overrides) than client ones.

export function GlassCard({ className = '', children, ...rest }) {
  return (
    <div className={`glass rounded-xl ${className}`} {...rest}>
      {children}
    </div>
  );
}

const BADGE_TONES = {
  neutral: 'text-[var(--muted)] bg-[rgba(107,96,80,0.12)]',
  good: 'text-[var(--good)] bg-[rgba(74,155,111,0.12)]',
  warn: 'text-[var(--warn)] bg-[rgba(192,144,80,0.12)]',
  danger: 'text-[var(--danger)] bg-[rgba(192,97,74,0.12)]',
  gold: 'text-[var(--gold)] bg-[var(--gold-faint)]',
};

export function Badge({ tone = 'neutral', dot = false, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${BADGE_TONES[tone] || BADGE_TONES.neutral}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'currentColor' }} />}
      {children}
    </span>
  );
}

export function Button({ variant = 'primary', className = '', children, ...rest }) {
  const base =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-mono text-[11px] font-medium uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg';
  const variants = {
    primary: 'bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--cream)]',
    ghost: 'border border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--gold-dim)] hover:text-[var(--gold)]',
    danger: 'border border-[rgba(192,97,74,0.4)] text-[var(--danger)] hover:bg-[rgba(192,97,74,0.1)]',
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Input({ label, className = '', ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">{label}</span>}
      <input
        className={`bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none transition-colors focus:border-[var(--gold-dim)] placeholder:text-[var(--faint)] ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Select({ label, className = '', children, ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">{label}</span>}
      <select
        className={`bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none transition-colors focus:border-[var(--gold-dim)] ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = '', ...rest }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">{label}</span>}
      <textarea
        className={`bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[13px] text-[var(--text)] outline-none transition-colors focus:border-[var(--gold-dim)] placeholder:text-[var(--faint)] resize-none ${className}`}
        {...rest}
      />
    </label>
  );
}

export function Spinner({ size = 16 }) {
  return (
    <svg
      className="animate-spin"
      style={{ width: size, height: size, color: 'var(--gold)' }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.2" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Shown instead of an infinite spinner when session/profile restoration
// fails outright, so a real error is always visible and recoverable
// rather than hanging silently forever.
export function AuthErrorScreen({ message }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--bg)] px-6 text-center">
      <p className="text-[13px] text-[var(--danger)] max-w-sm">{message}</p>
      <Button onClick={signOut}>Sign out & try again</Button>
    </div>
  );
}

export function EmptyState({ icon = '◌', title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-[var(--faint)]">
      <div className="text-3xl opacity-40">{icon}</div>
      <div className="font-display text-xl text-[var(--muted)]">{title}</div>
      {sub && <div className="text-[11px] text-[var(--faint)]">{sub}</div>}
    </div>
  );
}
