import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Briefcase, FileSignature, Wallet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, Spinner, EmptyState } from '../../components/ui';
import { INTERNAL_STAGE_LABELS, stageBadgeTone } from '../../lib/stages';
import { formatMoney, formatDate, daysBetween } from '../../lib/format';

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [sows, setSows] = useState([]);

  const load = useCallback(async () => {
    const [{ data: p }, { data: s }] = await Promise.all([
      supabase
        .from('projects')
        .select('*, clients(name, business_name)')
        .order('created_at', { ascending: false }),
      supabase.from('sow_documents').select('*, projects(name, clients(name))'),
    ]);
    setProjects(p || []);
    setSows(s || []);
    setLoading(false);
  }, []);

  // Standard fetch-on-mount; `load` only ever runs from here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) return <CenterSpinner />;

  const active = projects.filter((p) => !['delivered', 'cancelled'].includes(p.stage));
  const awaitingSignature = sows.filter((s) => s.status === 'sent');
  const outstandingBalance = projects.reduce((sum, p) => {
    let owed = 0;
    if (!p.deposit_paid) owed += Number(p.price) / 2;
    else if (!p.balance_paid) owed += Number(p.price) / 2;
    return sum + (['delivered', 'in_progress', 'deposit_due', 'support'].includes(p.stage) ? owed : 0);
  }, 0);

  const overdueSows = sows.filter((s) => s.status === 'sent' && s.sent_at && daysBetween(s.sent_at) > 7);
  const overduePayments = projects.filter(
    (p) => p.stage === 'deposit_due' && !p.deposit_paid && daysBetween(p.created_at) > 5
  );

  const needsAttention = [
    ...overduePayments.map((p) => ({
      key: `pay-${p.id}`,
      tone: 'danger',
      icon: Wallet,
      title: `${p.clients?.name || 'Client'} — deposit overdue`,
      sub: p.name,
      href: `/admin/projects/${p.id}`,
    })),
    ...overdueSows.map((s) => ({
      key: `sow-${s.id}`,
      tone: 'warn',
      icon: FileSignature,
      title: `${s.projects?.clients?.name || 'Client'} — contract unsigned`,
      sub: `${s.projects?.name} · sent ${formatDate(s.sent_at)}`,
      href: `/admin/contracts`,
    })),
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-up">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[var(--white)]">Home</h1>
        <p className="text-[12px] text-[var(--text-dim)] mt-1">Everything that needs your attention, at a glance.</p>
      </header>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Briefcase} label="Active Projects" value={active.length} />
        <StatCard icon={FileSignature} label="Awaiting Signature" value={awaitingSignature.length} />
        <StatCard icon={Wallet} label="Outstanding Balance" value={formatMoney(outstandingBalance)} />
      </div>

      {/* Needs attention */}
      <section>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Needs Attention</h2>
        {needsAttention.length === 0 ? (
          <GlassCard className="p-6 text-[12px] text-[var(--text-dim)]">Nothing flagged — you're on top of it.</GlassCard>
        ) : (
          <div className="flex flex-col gap-2">
            {needsAttention.map((item) => (
              <Link
                key={item.key}
                to={item.href}
                className="glass rounded-lg px-5 py-3.5 flex items-center gap-3 hover:border-[var(--gold-dim)] transition-colors"
                style={{
                  borderLeft: `2px solid ${item.tone === 'danger' ? 'var(--danger)' : 'var(--warn)'}`,
                }}
              >
                <item.icon size={15} className={item.tone === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--warn)]'} />
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-[var(--text)] truncate">{item.title}</p>
                  <p className="text-[10px] text-[var(--faint)] truncate">{item.sub}</p>
                </div>
                <AlertTriangle size={13} className={item.tone === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--warn)]'} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent projects */}
      <section>
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Recent Projects</h2>
        <GlassCard className="overflow-hidden">
          {projects.length === 0 ? (
            <EmptyState icon="◌" title="No projects yet" sub="Create your first project to get started." />
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] text-[9px] uppercase tracking-[0.15em] text-[var(--faint)]">
                  <th className="text-left font-normal px-5 py-3">Project</th>
                  <th className="text-left font-normal px-5 py-3">Client</th>
                  <th className="text-left font-normal px-5 py-3">Stage</th>
                  <th className="text-left font-normal px-5 py-3">Value</th>
                  <th className="text-left font-normal px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 8).map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/projects/${p.id}`} className="text-[var(--cream)] hover:text-[var(--gold)]">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-dim)]">{p.clients?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={stageBadgeTone(p.stage)}>{INTERNAL_STAGE_LABELS[p.stage]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--gold)]">{formatMoney(p.price, p.currency)}</td>
                    <td className="px-5 py-3.5 text-[var(--faint)]">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </GlassCard>
      </section>
    </div>
  );
}

function StatCard(props) {
  const { icon: Icon, label, value } = props;
  return (
    <GlassCard className="p-6 flex items-center justify-between">
      <div>
        <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2">{label}</p>
        <p className="font-display text-3xl font-semibold text-[var(--white)]">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-faint)' }}>
        <Icon size={17} className="text-[var(--gold)]" />
      </div>
    </GlassCard>
  );
}

function CenterSpinner() {
  return (
    <div className="flex items-center justify-center py-32">
      <Spinner size={20} />
    </div>
  );
}
