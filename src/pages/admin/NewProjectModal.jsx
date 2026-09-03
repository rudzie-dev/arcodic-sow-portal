import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button, Input, Select, Spinner } from '../../components/ui';
import { defaultSupportWindowDays } from '../../lib/stages';
import { generateContract } from '../../lib/contractTemplate';

const TIERS = [
  { value: 'landing', label: 'Landing Page' },
  { value: 'starter', label: 'Starter Site' },
  { value: 'business', label: 'Business Site' },
  { value: 'custom', label: 'Custom' },
];

// Admin creates a project → picks a client (existing or new) → picks a
// tier → the portal auto-generates a contract from the master template,
// filling in client/project/price/tier/dates. Nothing is sent yet — that
// happens from the project page's "Send for signature" action.
export default function NewProjectModal({ onClose, onCreated }) {
  const [clients, setClients] = useState([]);
  const [clientMode, setClientMode] = useState('existing'); // 'existing' | 'new'
  const [clientId, setClientId] = useState('');
  const [newClient, setNewClient] = useState({ name: '', business_name: '', email: '', phone: '' });
  const [project, setProject] = useState({ name: '', tier: 'starter', price: '', currency: 'USD' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('clients').select('id,name,business_name,email').order('name').then(({ data }) => {
      setClients(data || []);
      if (data?.length) setClientId(data[0].id);
      else setClientMode('new');
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!project.name.trim()) return setError('Project name is required.');
    setBusy(true);
    setError('');
    try {
      let resolvedClientId = clientId;
      let clientRecord;

      if (clientMode === 'new') {
        if (!newClient.name.trim() || !newClient.email.trim()) {
          throw new Error('Client name and email are required.');
        }
        const { data, error: cErr } = await supabase.from('clients').insert(newClient).select().single();
        if (cErr) throw cErr;
        clientRecord = data;
        resolvedClientId = data.id;
      } else {
        clientRecord = clients.find((c) => c.id === clientId);
        if (!clientRecord) throw new Error('Select a client.');
      }

      const { data: businessSettings } = await supabase.from('settings').select('*').eq('id', 1).single();

      const { data: newProject, error: pErr } = await supabase
        .from('projects')
        .insert({
          client_id: resolvedClientId,
          name: project.name.trim(),
          tier: project.tier,
          price: Number(project.price) || 0,
          currency: project.currency,
          stage: 'contract_sent',
          support_window_days: defaultSupportWindowDays(project.tier),
        })
        .select()
        .single();
      if (pErr) throw pErr;

      const content = generateContract({
        client: clientRecord,
        project: newProject,
        business: businessSettings || {},
      });

      const { error: sErr } = await supabase.from('sow_documents').insert({
        project_id: newProject.id,
        content,
        status: 'draft',
      });
      if (sErr) throw sErr;

      onCreated(newProject);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70">
      <div className="glass-strong glow-gold rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-soft)]">
          <h2 className="font-display text-xl font-semibold text-[var(--white)]">New Project</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--gold)]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 flex flex-col gap-5">
          {/* Client picker */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">Client</span>
            <div className="flex gap-2 mb-1">
              <button
                type="button"
                onClick={() => setClientMode('existing')}
                className={`flex-1 py-2 rounded-lg text-[11px] uppercase tracking-wider border transition-colors ${
                  clientMode === 'existing'
                    ? 'border-[var(--gold-dim)] text-[var(--gold)] bg-[var(--gold-faint)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setClientMode('new')}
                className={`flex-1 py-2 rounded-lg text-[11px] uppercase tracking-wider border transition-colors ${
                  clientMode === 'new'
                    ? 'border-[var(--gold-dim)] text-[var(--gold)] bg-[var(--gold-faint)]'
                    : 'border-[var(--border)] text-[var(--muted)]'
                }`}
              >
                New Client
              </button>
            </div>

            {clientMode === 'existing' ? (
              <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {clients.length === 0 && <option value="">No clients yet</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.business_name ? `· ${c.business_name}` : ''}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Name"
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient((s) => ({ ...s, name: e.target.value }))}
                />
                <Input
                  label="Business"
                  value={newClient.business_name}
                  onChange={(e) => setNewClient((s) => ({ ...s, business_name: e.target.value }))}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={newClient.email}
                  onChange={(e) => setNewClient((s) => ({ ...s, email: e.target.value }))}
                />
                <Input
                  label="Phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient((s) => ({ ...s, phone: e.target.value }))}
                />
              </div>
            )}
          </div>

          <Input
            label="Project name"
            required
            value={project.name}
            onChange={(e) => setProject((s) => ({ ...s, name: e.target.value }))}
            placeholder="e.g. Acme Co — Marketing Site"
          />

          <div className="grid grid-cols-3 gap-3">
            <Select
              label="Tier"
              value={project.tier}
              onChange={(e) => setProject((s) => ({ ...s, tier: e.target.value }))}
              className="col-span-1"
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Input
              label="Price"
              type="number"
              min="0"
              step="0.01"
              value={project.price}
              onChange={(e) => setProject((s) => ({ ...s, price: e.target.value }))}
            />
            <Input
              label="Currency"
              value={project.currency}
              onChange={(e) => setProject((s) => ({ ...s, currency: e.target.value.toUpperCase() }))}
              maxLength={3}
            />
          </div>

          {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full py-3 mt-2">
            {busy ? <Spinner size={14} /> : 'Create project & draft contract →'}
          </Button>
        </form>
      </div>
    </div>
  );
}
