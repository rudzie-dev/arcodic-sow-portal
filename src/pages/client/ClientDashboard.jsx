import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, CreditCard, RefreshCcw, Layers, Download, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import StageTracker from '../../components/StageTracker';
import { GlassCard, Badge, Button, Spinner, EmptyState } from '../../components/ui';
import { CLIENT_STAGES, TIER_LABELS, stageToClientIndex } from '../../lib/stages';
import { formatDate, daysBetween } from '../../lib/format';

const REVISIONS_INCLUDED = 2;

export default function ClientDashboard() {
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [sow, setSow] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [revisionCount, setRevisionCount] = useState(0);

  useEffect(() => {
    if (!profile?.client_id) {
      setLoading(false);
      return;
    }
    load();
  }, [profile?.client_id]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      // Most clients only ever have one active project — take the most
      // recently created one that isn't cancelled.
      const { data: projects, error: pErr } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', profile.client_id)
        .neq('stage', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1);
      if (pErr) throw pErr;

      const activeProject = projects?.[0] || null;
      setProject(activeProject);

      if (activeProject) {
        const [{ data: sows }, { data: files }, { data: revisions }] = await Promise.all([
          supabase
            .from('sow_documents')
            .select('*')
            .eq('project_id', activeProject.id)
            .order('created_at', { ascending: false })
            .limit(1),
          supabase
            .from('deliverables')
            .select('*')
            .eq('project_id', activeProject.id)
            .order('uploaded_at', { ascending: false }),
          supabase.from('revisions').select('id').eq('project_id', activeProject.id),
        ]);
        setSow(sows?.[0] || null);
        setDeliverables(files || []);
        setRevisionCount(revisions?.length || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your project.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Spinner size={22} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <nav className="sticky top-0 z-20 glass-strong px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center font-display font-bold text-[var(--bg)]">
            A
          </div>
          <span className="font-display text-lg font-semibold text-[var(--white)]">
            Arcodic <span className="text-[var(--gold-dim)] font-normal">Client Portal</span>
          </span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
        >
          <LogOut size={13} /> Sign out
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 md:px-10 py-12">
        {error && (
          <div className="mb-8 p-4 rounded-lg border border-[rgba(192,97,74,0.3)] text-[var(--danger)] text-[13px]">
            {error}
          </div>
        )}

        {!project ? (
          <EmptyState
            icon="◌"
            title="No active project yet"
            sub="Once Arcodic sets up your project, it will appear here."
          />
        ) : (
          <ProjectView
            project={project}
            sow={sow}
            deliverables={deliverables}
            revisionCount={revisionCount}
          />
        )}
      </main>
    </div>
  );
}

function ProjectView({ project, sow, deliverables, revisionCount }) {
  const clientIndex = stageToClientIndex(project.stage);
  const nextUp = getNextUp({ project, sow, deliverables });

  return (
    <div className="flex flex-col gap-10 animate-fade-up">
      <header>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--gold-dim)] mb-2">Your Project</p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-[var(--white)]">{project.name}</h1>
      </header>

      {/* Stage tracker */}
      <GlassCard className="p-6 md:p-8">
        <StageTracker activeIndex={clientIndex} />
      </GlassCard>

      {/* Next up hero */}
      {nextUp && (
        <GlassCard className="p-8 relative overflow-hidden glow-gold">
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full opacity-[0.08]"
            style={{ background: 'radial-gradient(circle, var(--gold), transparent 70%)' }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--gold-faint)' }}>
                <nextUp.icon size={18} className="text-[var(--gold)]" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--gold-dim)] mb-1.5">Next Up</p>
                <h2 className="font-display text-xl font-semibold text-[var(--white)] mb-1.5">{nextUp.title}</h2>
                <p className="text-[12px] text-[var(--text-dim)] leading-relaxed max-w-md">{nextUp.body}</p>
              </div>
            </div>
            {nextUp.action && (
              <a href={nextUp.action.href} target="_blank" rel="noreferrer" className="shrink-0">
                <Button className="whitespace-nowrap">
                  {nextUp.action.label} <ExternalLink size={13} />
                </Button>
              </a>
            )}
          </div>
        </GlassCard>
      )}

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          icon={FileText}
          label="Contract Status"
          value={sow ? CONTRACT_STATUS_LABEL[sow.status] : 'Not yet sent'}
          tone={sow?.status === 'signed' ? 'good' : sow?.status === 'sent' ? 'warn' : 'neutral'}
        />
        <MetricCard
          icon={CreditCard}
          label="Payment Status"
          value={
            project.balance_paid
              ? 'Paid in full'
              : project.deposit_paid
              ? 'Deposit paid'
              : 'Deposit due'
          }
          tone={project.balance_paid ? 'good' : project.deposit_paid ? 'warn' : 'neutral'}
        />
        <MetricCard
          icon={RefreshCcw}
          label="Revisions Used"
          value={`${revisionCount} of ${REVISIONS_INCLUDED}`}
          tone={revisionCount >= REVISIONS_INCLUDED ? 'warn' : 'neutral'}
        />
        <MetricCard icon={Layers} label="Tier" value={TIER_LABELS[project.tier] || project.tier} tone="gold" />
      </div>

      {/* Support countdown */}
      {(project.stage === 'delivered' || project.stage === 'support') && project.delivered_at && (
        <SupportCountdown deliveredAt={project.delivered_at} windowDays={project.support_window_days} />
      )}

      {/* Deliverables */}
      <section>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Deliverables</h3>
        {deliverables.length === 0 ? (
          <GlassCard className="p-8">
            <EmptyState icon="◌" title="Nothing here yet" sub="Files and links will appear once Arcodic uploads them." />
          </GlassCard>
        ) : (
          <div className="flex flex-col gap-2">
            {deliverables.map((d) => (
              <a
                key={d.id}
                href={d.file_url}
                target="_blank"
                rel="noreferrer"
                className="glass rounded-lg px-5 py-4 flex items-center justify-between hover:border-[var(--gold-dim)] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Download size={15} className="text-[var(--gold-dim)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] text-[var(--text)] truncate group-hover:text-[var(--cream)]">{d.label}</p>
                    <p className="text-[10px] text-[var(--faint)]">{formatDate(d.uploaded_at)}</p>
                  </div>
                </div>
                <ExternalLink size={13} className="text-[var(--faint)] shrink-0" />
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const CONTRACT_STATUS_LABEL = { draft: 'Preparing', sent: 'Awaiting signature', signed: 'Signed', expired: 'Expired' };

function MetricCard(props) {
  const { icon: Icon, label, value, tone = 'neutral' } = props;
  return (
    <GlassCard className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">{label}</span>
        <Icon size={14} className="text-[var(--gold-dim)]" />
      </div>
      <Badge tone={tone}>{value}</Badge>
    </GlassCard>
  );
}

function SupportCountdown({ deliveredAt, windowDays }) {
  const daysUsed = daysBetween(deliveredAt);
  const daysLeft = Math.max(0, windowDays - daysUsed);
  const expired = daysLeft <= 0;
  return (
    <GlassCard className="p-6 flex items-center justify-between">
      <div>
        <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">Free Support Window</p>
        <p className="text-[12px] text-[var(--text-dim)]">
          {expired
            ? 'Your free bug-fix window has ended.'
            : `Covers bug fixes on the delivered work through ${formatDate(
                new Date(new Date(deliveredAt).getTime() + windowDays * 86400000)
              )}.`}
        </p>
      </div>
      <div className="text-right shrink-0">
        <div className="font-display text-3xl font-semibold" style={{ color: expired ? 'var(--muted)' : 'var(--gold)' }}>
          {daysLeft}
        </div>
        <div className="text-[9px] uppercase tracking-[0.15em] text-[var(--faint)]">days left</div>
      </div>
    </GlassCard>
  );
}

function getNextUp({ project, sow, deliverables }) {
  if (sow && sow.status === 'sent') {
    return {
      icon: FileText,
      title: 'Sign your contract',
      body: 'Your Statement of Work is ready for signature. Review and sign it to kick off the project.',
      action: sow.signing_url ? { label: 'Review & Sign', href: sow.signing_url } : null,
    };
  }
  if (project.stage === 'deposit_due' && !project.deposit_paid) {
    return {
      icon: CreditCard,
      title: 'Deposit payment due',
      body: `A 50% deposit is due before work begins. Reach out to Arcodic to arrange payment.`,
      action: null,
    };
  }
  if (project.stage === 'delivered' && !project.balance_paid) {
    return {
      icon: CreditCard,
      title: 'Final balance due',
      body: 'Your project has been delivered — the remaining 50% balance is due to complete handover.',
      action: null,
    };
  }
  const latest = deliverables[0];
  if (latest && ['in_progress', 'delivered'].includes(project.stage) && daysBetween(latest.uploaded_at) <= 7) {
    return {
      icon: Layers,
      title: 'Review new files',
      body: `Arcodic just uploaded "${latest.label}" — take a look below.`,
      action: { label: 'Open file', href: latest.file_url },
    };
  }
  if (project.stage === 'support') {
    return {
      icon: Layers,
      title: "You're all caught up",
      body: 'Your project is live and in its post-launch support window.',
      action: null,
    };
  }
  return {
    icon: Layers,
    title: "You're all caught up",
    body: `Current stage: ${CLIENT_STAGES[stageToClientIndex(project.stage)]}. We'll update this as things move.`,
    action: null,
  };
}
