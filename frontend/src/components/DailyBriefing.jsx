import React from 'react';
import { Wind } from 'lucide-react';

export default function DailyBriefing({ data, loading, onBeginAction }) {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: '#2dd4bf', animation: 'pulse-mic 1.5s infinite', marginBottom: '24px' }}>
        Aegis is preparing your morning briefing...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.05) 0%, rgba(124, 58, 237, 0.02) 100%)', borderColor: 'rgba(20, 184, 166, 0.25)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind style={{ color: '#2dd4bf', width: '20px' }} /> Aegis Daily Briefing
        </h2>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
          Morning Sync
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
          {data.greeting}
        </div>
        
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {data.performanceSummary}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '6px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '14px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Today's Risk Alert:</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%' }} />
              {data.todayRisk}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Recommended First Action:</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }} />
              {data.firstAction}
            </span>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(167, 139, 250, 0.03)', 
          border: '1px solid rgba(167, 139, 250, 0.12)', 
          borderRadius: '12px', 
          padding: '16px', 
          fontSize: '13px', 
          color: 'var(--text-main)', 
          lineHeight: 1.6,
          whiteSpace: 'pre-line' 
        }}>
          <strong style={{ display: 'block', color: '#a78bfa', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Aegis Assessment
          </strong>
          {data.mindfulMessage}
        </div>
      </div>
    </div>
  );
}
