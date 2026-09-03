import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Input, Textarea, Button, Spinner } from '../../components/ui';

// Business details (autofill the contract template), SignWell API key,
// notification preferences. Single-row `settings` table, admin-only RLS.
export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setForm(data || {});
        setLoading(false);
      });
  }, []);

  const set = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));
  const setBool = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.checked }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { error } = await supabase.from('settings').update(form).eq('id', 1);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading || !form)
    return (
      <div className="flex justify-center py-24">
        <Spinner size={20} />
      </div>
    );

  return (
    <div className="flex flex-col gap-8 animate-fade-up max-w-2xl">
      <header>
        <h1 className="font-display text-3xl font-semibold text-[var(--white)]">Settings</h1>
        <p className="text-[12px] text-[var(--text-dim)] mt-1">Business details, e-signature, and notifications.</p>
      </header>

      <form onSubmit={save} className="flex flex-col gap-8">
        <GlassCard className="p-6 flex flex-col gap-4">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Business Details</h3>
          <p className="text-[11px] text-[var(--faint)] -mt-2">Used to autofill the contract template.</p>
          <Input label="Business name" value={form.business_name || ''} onChange={set('business_name')} />
          <Input label="Business email" type="email" value={form.business_email || ''} onChange={set('business_email')} />
          <Textarea label="Business address" rows={2} value={form.business_address || ''} onChange={set('business_address')} />
        </GlassCard>

        <GlassCard className="p-6 flex flex-col gap-4">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">SignWell</h3>
          <p className="text-[11px] text-[var(--faint)] -mt-2">
            Used server-side to create signing requests. Stored here for MVP convenience — never exposed to clients.
          </p>
          <Input
            label="API key"
            type="password"
            value={form.signwell_api_key || ''}
            onChange={set('signwell_api_key')}
            placeholder="sk_live_…"
          />
        </GlassCard>

        <GlassCard className="p-6 flex flex-col gap-3">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Notifications</h3>
          <ToggleRow label="Notify me when a contract is signed" checked={form.notify_on_signature} onChange={setBool('notify_on_signature')} />
          <ToggleRow label="Notify me when a payment is marked paid" checked={form.notify_on_payment} onChange={setBool('notify_on_payment')} />
        </GlassCard>

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner size={13} /> : 'Save settings'}
          </Button>
          {saved && <span className="text-[11px] text-[var(--good)]">Saved.</span>}
        </div>
      </form>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-[12px] text-[var(--text)]">{label}</span>
      <input type="checkbox" checked={!!checked} onChange={onChange} className="accent-[var(--gold)] w-4 h-4" />
    </label>
  );
}
