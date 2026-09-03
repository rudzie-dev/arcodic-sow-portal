import React from 'react';
import { CLIENT_STAGES } from '../lib/stages';

// Filled-line progress across the 5 client-facing stages.
export default function StageTracker({ activeIndex }) {
  return (
    <div className="flex items-center w-full">
      {CLIENT_STAGES.map((label, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`h-3 w-3 rounded-full transition-colors ${
                  done || current ? 'bg-[var(--gold)]' : 'bg-[var(--border)]'
                }`}
                style={current ? { boxShadow: '0 0 0 4px var(--gold-faint)' } : undefined}
              />
              <span
                className={`text-[9px] uppercase tracking-[0.12em] whitespace-nowrap ${
                  done || current ? 'text-[var(--cream)]' : 'text-[var(--faint)]'
                }`}
              >
                {label}
              </span>
            </div>
            {i < CLIENT_STAGES.length - 1 && (
              <div className="flex-1 h-px mx-2 -mt-4" style={{ background: 'var(--border)' }}>
                <div
                  className="h-px transition-all duration-500"
                  style={{ background: 'var(--gold)', width: i < activeIndex ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
