import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, Spinner, EmptyState, Button } from '../../components/ui';
import { formatMoney } from '../../lib/format';

// Outstanding balances across all clients. Manual mark-as-paid only for
// MVP — no payment gateway yet, so this is a totals/ledger view, not a
// checkout flow.
export default function Payments() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('projects')
      .select('*, clients(name)')
      .neq('stage', 'cancelled')
      .order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }, []);

  // Standard fetch-on-mount; `load` only ever runs from here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function markPaid(project, field) {
    await supabase.from('projects').update({ [field]: true }).eq('id', project.id);
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, [field]: true } : p)));
  }

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Spinner size={20} />
      </div>
    );

  const rows = projects.filter((p) => !p.deposit_paid || !p.balance_paid);
  const totalOutstanding = rows.reduce((sum, p) => {
    let owed = 0;
    if (!p.deposit_paid) owed += Number(p.price) / 2;
    else if (!p.balance_paid) owed += Number(p.price) / 2;
    return sum + owed;
  }, 0);

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[var(--white)]">Payments</h1>
        <p className="text-[12px] text-[var(--text-dim)] mt-1">Manual mark-as-paid — no gateway integration yet.</p>
      </header>

      <GlassCard className="p-6 w-fit">
        <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mb-2">Total Outstanding</p>
        <p className="font-display text-4xl font-semibold text-[var(--white)]">{formatMoney(totalOutstanding)}</p>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon="✓" title="Everything is settled" sub="No outstanding balances." />
        ) : (
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-soft)] text-[9px] uppercase tracking-[0.15em] text-[var(--faint)]">
                <th className="text-left font-normal px-5 py-3">Project</th>
                <th className="text-left font-normal px-5 py-3">Client</th>
                <th className="text-left font-normal px-5 py-3">Deposit</th>
                <th className="text-left font-normal px-5 py-3">Balance</th>
                <th className="text-left font-normal px-5 py-3">Owed Now</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const owed = !p.deposit_paid ? Number(p.price) / 2 : !p.balance_paid ? Number(p.price) / 2 : 0;
                return (
                  <tr key={p.id} className="border-b border-[var(--border-soft)] last:border-0">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/projects/${p.id}`} className="text-[var(--cream)] hover:text-[var(--gold)]">
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-dim)]">{p.clients?.name || '—'}</td>
                    <td className="px-5 py-3.5">
                      {p.deposit_paid ? (
                        <Badge tone="good">Paid</Badge>
                      ) : (
                        <Button variant="ghost" className="!py-1 !px-2.5" onClick={() => markPaid(p, 'deposit_paid')}>
                          Mark paid
                        </Button>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {p.balance_paid ? (
                        <Badge tone="good">Paid</Badge>
                      ) : (
                        <Button variant="ghost" className="!py-1 !px-2.5" onClick={() => markPaid(p, 'balance_paid')}>
                          Mark paid
                        </Button>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--danger)]">{formatMoney(owed, p.currency)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
}
