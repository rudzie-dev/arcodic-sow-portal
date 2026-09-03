import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, Spinner, EmptyState } from '../../components/ui';
import { INTERNAL_STAGES, INTERNAL_STAGE_LABELS, stageBadgeTone } from '../../lib/stages';
import { formatMoney, formatDate } from '../../lib/format';

export default function Projects() {
  const { openNewProject } = useOutletContext() || {};
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    supabase
      .from('projects')
      .select('*, clients(name, business_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProjects(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = stageFilter === 'all' ? projects : projects.filter((p) => p.stage === stageFilter);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[var(--white)]">Projects</h1>
          <p className="text-[12px] text-[var(--text-dim)] mt-1">Full pipeline, including internal-only stages.</p>
        </div>
        <button
          onClick={openNewProject}
          className="rounded-lg bg-[var(--gold)] text-[var(--bg)] px-4 py-2 text-[11px] font-medium uppercase tracking-wider hover:bg-[var(--cream)] transition-colors"
        >
          + New Project
        </button>
      </header>

      {/* Stage filter */}
      <div className="flex gap-2 flex-wrap">
        <FilterChip label="All" active={stageFilter === 'all'} onClick={() => setStageFilter('all')} count={projects.length} />
        {INTERNAL_STAGES.map((s) => (
          <FilterChip
            key={s}
            label={INTERNAL_STAGE_LABELS[s]}
            active={stageFilter === s}
            onClick={() => setStageFilter(s)}
            count={projects.filter((p) => p.stage === s).length}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size={20} />
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon="◌" title="No projects" sub="Nothing matches this filter." />
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] text-[9px] uppercase tracking-[0.15em] text-[var(--faint)]">
                  <th className="text-left font-normal px-5 py-3">Project</th>
                  <th className="text-left font-normal px-5 py-3">Client</th>
                  <th className="text-left font-normal px-5 py-3">Tier</th>
                  <th className="text-left font-normal px-5 py-3">Stage</th>
                  <th className="text-left font-normal px-5 py-3">Value</th>
                  <th className="text-left font-normal px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/projects/${p.id}`} className="text-[var(--cream)] hover:text-[var(--gold)]">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-dim)]">{p.clients?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-[var(--text-dim)] capitalize">{p.tier}</td>
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
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider border transition-colors ${
        active
          ? 'border-[var(--gold-dim)] text-[var(--gold)] bg-[var(--gold-faint)]'
          : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
      }`}
    >
      {label} <span className="opacity-60">({count})</span>
    </button>
  );
}
