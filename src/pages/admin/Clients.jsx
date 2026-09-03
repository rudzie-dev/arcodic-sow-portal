import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Spinner, EmptyState, Badge } from '../../components/ui';
import { formatDate } from '../../lib/format';

// CRM-style list — separate from Projects, since a client can have
// multiple projects over time.
export default function Clients() {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('clients')
      .select('*, projects(id, name, stage)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClients(data || []);
        setLoading(false);
      });
  }, []);

  const q = search.toLowerCase();
  const filtered = clients.filter(
    (c) => !q || c.name?.toLowerCase().includes(q) || c.business_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[var(--white)]">Clients</h1>
        <p className="text-[12px] text-[var(--text-dim)] mt-1">{clients.length} total.</p>
      </header>

      <input
        placeholder="Search clients…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-[12px] text-[var(--text)] outline-none focus:border-[var(--gold-dim)] placeholder:text-[var(--faint)]"
      />

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner size={20} />
        </div>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-8">
          <EmptyState icon="◌" title="No clients found" />
        </GlassCard>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <GlassCard key={c.id} className="p-5 flex flex-col gap-3">
              <div>
                <p className="font-display text-lg font-semibold text-[var(--white)]">{c.name}</p>
                {c.business_name && <p className="text-[11px] text-[var(--gold-dim)]">{c.business_name}</p>}
              </div>
              <div className="text-[11px] text-[var(--text-dim)] flex flex-col gap-1">
                <span>{c.email}</span>
                {c.phone && <span>{c.phone}</span>}
              </div>
              {c.notes && <p className="text-[11px] text-[var(--faint)] italic">{c.notes}</p>}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--border-soft)]">
                {(c.projects || []).length === 0 ? (
                  <span className="text-[10px] text-[var(--faint)]">No projects yet</span>
                ) : (
                  c.projects.map((p) => (
                    <Badge key={p.id} tone="neutral">
                      {p.name}
                    </Badge>
                  ))
                )}
              </div>
              <p className="text-[9px] text-[var(--faint)]">Client since {formatDate(c.created_at)}</p>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
