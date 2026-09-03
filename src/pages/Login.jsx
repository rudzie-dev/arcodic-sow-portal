import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Spinner } from '../components/ui';
import { Mail } from 'lucide-react';

// Passwordless email sign-in via a magic link — no password, no code to
// type. Clicking the link in the email brings the user straight back here
// signed in (see AuthContext for how the session gets picked up).
export default function Login() {
  const { requestOtp, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState('email'); // 'email' | 'sent'
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate(location.state?.from || '/', { replace: true });
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendLink = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError('');
    try {
      await requestOtp(email.trim());
      setStep('sent');
    } catch (err) {
      setError(err.message || 'Could not send link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)] px-6 relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, var(--gold), transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full opacity-[0.06]"
        style={{ background: 'radial-gradient(circle, var(--teal), transparent 70%)' }}
      />

      <div className="w-full max-w-[380px] animate-fade-up relative z-10">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-lg bg-[var(--gold)] flex items-center justify-center font-display text-lg font-bold text-[var(--bg)]">
            A
          </div>
          <span className="font-display text-xl font-semibold text-[var(--white)] tracking-wide">
            Arcodic <span className="text-[var(--gold-dim)] font-normal">Portal</span>
          </span>
        </div>

        <div className="glass rounded-2xl p-8 glow-gold">
          {step === 'email' ? (
            <form onSubmit={sendLink} className="flex flex-col gap-5">
              <div>
                <h1 className="font-display text-2xl font-semibold text-[var(--white)] mb-1.5">Sign in</h1>
                <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                  Enter your email and we'll send you a one-time sign-in link — no password needed.
                </p>
              </div>
              <label className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase tracking-[0.15em] text-[var(--muted)]">Email</span>
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3.5 py-3 text-[14px] text-[var(--text)] outline-none transition-colors focus:border-[var(--gold-dim)] placeholder:text-[var(--faint)]"
                />
              </label>
              {error && <p className="text-[11px] text-[var(--danger)]">{error}</p>}
              <Button type="submit" disabled={busy || !email.trim()} className="w-full py-3">
                {busy ? <Spinner size={14} /> : 'Send sign-in link →'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-5 items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--gold-faint)' }}>
                <Mail size={20} className="text-[var(--gold)]" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-[var(--white)] mb-1.5">Check your email</h1>
                <p className="text-[11px] text-[var(--text-dim)] leading-relaxed">
                  We sent a sign-in link to <span className="text-[var(--cream)]">{email}</span>. Open it on this
                  device to continue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setStep('email'); setError(''); }}
                className="text-[10px] uppercase tracking-wider text-[var(--muted)] hover:text-[var(--gold)] transition-colors"
              >
                ← Use a different email
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-[9px] uppercase tracking-[0.15em] text-[var(--faint)] mt-8">
          Arcodic · Client Portal
        </p>
      </div>
    </div>
  );
}
