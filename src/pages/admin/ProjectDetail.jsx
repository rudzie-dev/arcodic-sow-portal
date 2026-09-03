import React, { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GlassCard, Badge, Button, Select, Input, Textarea, Spinner, EmptyState } from '../../components/ui';
import { INTERNAL_STAGES, INTERNAL_STAGE_LABELS, stageBadgeTone, TIER_LABELS } from '../../lib/stages';
import { formatMoney, formatDate } from '../../lib/format';

export default function ProjectDetail() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [sow, setSow] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [revisions, setRevisions] = useState([]);
  const [sendBusy, setSendBusy] = useState(false);
  const [sendError, setSendError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data: p } = await supabase.from('projects').select('*, clients(*)').eq('id', id).single();
    setProject(p);
    setClient(p?.clients || null);
    const [{ data: sows }, { data: files }, { data: revs }] = await Promise.all([
      supabase.from('sow_documents').select('*').eq('project_id', id).order('created_at', { ascending: false }),
      supabase.from('deliverables').select('*').eq('project_id', id).order('uploaded_at', { ascending: false }),
      supabase.from('revisions').select('*').eq('project_id', id).order('requested_at', { ascending: false }),
    ]);
    setSow(sows?.[0] || null);
    setDeliverables(files || []);
    setRevisions(revs || []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateProject(patch) {
    const { data, error } = await supabase.from('projects').update(patch).eq('id', id).select().single();
    if (!error) setProject(data);
  }

  async function sendForSignature() {
    if (!sow) return;
    setSendBusy(true);
    setSendError('');
    try {
      const res = await fetch('/api/send-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sow_document_id: sow.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send contract');
      await load();
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSendBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size={20} />
      </div>
    );
  }

  if (!project) return <EmptyState icon="⚠" title="Project not found" />;

  return (
    <div className="flex flex-col gap-8 animate-fade-up max-w-4xl">
      <Link to="/admin/projects" className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--gold)] w-fit">
        <ArrowLeft size={13} /> All Projects
      </Link>

      <header className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--gold-dim)] mb-1.5">
            {client?.name} {client?.business_name ? `· ${client.business_name}` : ''}
          </p>
          <h1 className="font-display text-3xl font-semibold text-[var(--white)]">{project.name}</h1>
        </div>
        <Badge tone={stageBadgeTone(project.stage)}>{INTERNAL_STAGE_LABELS[project.stage]}</Badge>
      </header>

      {/* Overview + controls */}
      <GlassCard className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Field label="Tier" value={TIER_LABELS[project.tier]} />
        <Field label="Price" value={formatMoney(project.price, project.currency)} />
        <Field label="Support Window" value={`${project.support_window_days} days`} />
        <Field label="Created" value={formatDate(project.created_at)} />
      </GlassCard>

      {/* Stage + payments */}
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard className="p-6 flex flex-col gap-4">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Pipeline Stage</h3>
          <Select value={project.stage} onChange={(e) => updateProject({ stage: e.target.value })}>
            {INTERNAL_STAGES.map((s) => (
              <option key={s} value={s}>
                {INTERNAL_STAGE_LABELS[s]}
              </option>
            ))}
          </Select>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col gap-4">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Payments (manual)</h3>
          <ToggleRow
            label={`Deposit paid (${formatMoney(project.price / 2, project.currency)})`}
            checked={project.deposit_paid}
            onChange={(v) => updateProject({ deposit_paid: v })}
          />
          <ToggleRow
            label={`Balance paid (${formatMoney(project.price / 2, project.currency)})`}
            checked={project.balance_paid}
            onChange={(v) => updateProject({ balance_paid: v })}
          />
        </GlassCard>
      </div>

      {/* Contract */}
      <GlassCard className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Contract</h3>
          {sow && (
            <Badge tone={sow.status === 'signed' ? 'good' : sow.status === 'sent' ? 'warn' : 'neutral'}>
              {sow.status}
            </Badge>
          )}
        </div>
        {sow ? (
          <>
            <Textarea
              rows={10}
              value={sow.content}
              disabled={sow.status !== 'draft'}
              onChange={(e) => setSow((s) => ({ ...s, content: e.target.value }))}
              className="font-mono text-[11px] leading-relaxed"
            />
            {sow.status === 'draft' && (
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await supabase.from('sow_documents').update({ content: sow.content }).eq('id', sow.id);
                  }}
                >
                  Save draft
                </Button>
                <Button onClick={sendForSignature} disabled={sendBusy}>
                  {sendBusy ? <Spinner size={13} /> : <><Send size={13} /> Send for signature</>}
                </Button>
              </div>
            )}
            {sow.status === 'sent' && (
              <p className="text-[11px] text-[var(--text-dim)]">
                Sent {formatDate(sow.sent_at)} — awaiting the client's signature via SignWell.
              </p>
            )}
            {sow.status === 'signed' && (
              <p className="text-[11px] text-[var(--good)] flex items-center gap-1.5">
                <CheckCircle2 size={13} /> Signed {formatDate(sow.signed_at)}
              </p>
            )}
            {sendError && <p className="text-[11px] text-[var(--danger)]">{sendError}</p>}
          </>
        ) : (
          <p className="text-[12px] text-[var(--text-dim)]">No contract drafted yet.</p>
        )}
      </GlassCard>

      {/* Deliverables */}
      <DeliverablesPanel projectId={id} deliverables={deliverables} onChange={setDeliverables} />

      {/* Revisions */}
      <RevisionsPanel projectId={id} revisions={revisions} onChange={setRevisions} />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)] mb-1.5">{label}</p>
      <p className="text-[13px] text-[var(--cream)]">{value}</p>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <span className="text-[12px] text-[var(--text)]">{label}</span>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[var(--gold)] w-4 h-4"
      />
    </label>
  );
}

function DeliverablesPanel({ projectId, deliverables, onChange }) {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from('deliverables')
      .insert({ project_id: projectId, label, file_url: url })
      .select()
      .single();
    setBusy(false);
    if (!error) {
      onChange([data, ...deliverables]);
      setLabel('');
      setUrl('');
    }
  };

  const remove = async (deliverableId) => {
    await supabase.from('deliverables').delete().eq('id', deliverableId);
    onChange(deliverables.filter((d) => d.id !== deliverableId));
  };

  return (
    <GlassCard className="p-6 flex flex-col gap-4">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">Deliverables</h3>
      <form onSubmit={add} className="flex gap-2 flex-wrap">
        <Input placeholder="Label (e.g. Homepage v1)" value={label} onChange={(e) => setLabel(e.target.value)} className="flex-1 min-w-[160px]" />
        <Input placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-[2] min-w-[200px]" />
        <Button type="submit" variant="ghost" disabled={busy}>
          <Plus size={14} /> Add
        </Button>
      </form>
      <div className="flex flex-col gap-1.5">
        {deliverables.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--card)] text-[12px]">
            <a href={d.file_url} target="_blank" rel="noreferrer" className="text-[var(--text)] hover:text-[var(--gold)] truncate">
              {d.label}
            </a>
            <button onClick={() => remove(d.id)} className="text-[var(--faint)] hover:text-[var(--danger)]">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

function RevisionsPanel({ projectId, revisions, onChange }) {
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    setBusy(true);
    const { data, error } = await supabase
      .from('revisions')
      .insert({ project_id: projectId, description, round_number: revisions.length + 1 })
      .select()
      .single();
    setBusy(false);
    if (!error) {
      onChange([data, ...revisions]);
      setDescription('');
    }
  };

  return (
    <GlassCard className="p-6 flex flex-col gap-4">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
        Revisions ({revisions.length} logged — 2 included per contract)
      </h3>
      <form onSubmit={add} className="flex gap-2">
        <Input placeholder="Log a revision request…" value={description} onChange={(e) => setDescription(e.target.value)} className="flex-1" />
        <Button type="submit" variant="ghost" disabled={busy}>
          <Plus size={14} /> Log
        </Button>
      </form>
      <div className="flex flex-col gap-1.5">
        {revisions.map((r) => (
          <div key={r.id} className="px-3 py-2.5 rounded-lg bg-[var(--card)] text-[12px] flex items-center justify-between">
            <span className="text-[var(--text)]">
              <span className="text-[var(--gold-dim)]">#{r.round_number}</span> {r.description}
            </span>
            <span className="text-[10px] text-[var(--faint)]">{formatDate(r.requested_at)}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
