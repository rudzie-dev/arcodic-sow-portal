import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, Spinner, EmptyState } from '../../components/ui';
import { formatDate } from '../../lib/format';

const STATUS_TONE = { draft: 'neutral', sent: 'warn', signed: 'good', expired: 'danger' };
const FILTERS = ['all', 'draft', 'sent', 'signed', 'expired'];

// Filtered view of sow_documents across all projects — draft/sent/signed/
// expired at a glance.
export default function Contracts() {
  const [loading, setLoading] = useState(true);
  const [sows, setSows] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    supabase
      .from('sow_documents')
      .select('*, projects(name, clients(name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSows(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'all' ? sows : sows.filter((s) => s.status === filter);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[var(--white)]">Contracts</h1>
        <p className="text-[12px] text-[var(--text-dim)] mt-1">Every Statement of Work, across every project.</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider border transition-colors capitalize ${
              filter === f
                ? 'border-[var(--gold-dim)] text-[var(--gold)] bg-[var(--gold-faint)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            {f} <span className="opacity-60">({f === 'all' ? sows.length : sows.filter((s) => s.status === f).length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size={20} />
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState icon="◌" title="No contracts" />
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border-soft)] text-[9px] uppercase tracking-[0.15em] text-[var(--faint)]">
                  <th className="text-left font-normal px-5 py-3">Project</th>
                  <th className="text-left font-normal px-5 py-3">Client</th>
                  <th className="text-left font-normal px-5 py-3">Status</th>
                  <th className="text-left font-normal px-5 py-3">Sent</th>
                  <th className="text-left font-normal px-5 py-3">Signed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[rgba(255,255,255,0.02)]">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/projects/${s.project_id}`} className="text-[var(--cream)] hover:text-[var(--gold)]">
                        {s.projects?.name || '—'}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-dim)]">{s.projects?.clients?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--faint)]">{formatDate(s.sent_at)}</td>
                    <td className="px-5 py-3.5 text-[var(--faint)]">{formatDate(s.signed_at)}</td>
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
