import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WeeklyOptimizer({ data, loading, error, onOptimize }) {
  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, rgba(20, 184, 166, 0.01) 100%)', borderColor: 'rgba(124, 58, 237, 0.25)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ color: '#a78bfa', width: '20px' }} /> Weekly Optimizer Agent
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Automatically categorize focus priority tasks, postpone cognitive loads, and assess deadline risks.
          </p>
        </div>
        <button 
          className="btn-primary" 
          onClick={onOptimize} 
          disabled={loading}
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #14b8a6 100%)', borderColor: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Sparkles style={{ width: '14px' }} /> {loading ? "Optimizing..." : "Optimize My Week"}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: '12px', color: '#f87171', margin: '10px 0' }}>{error}</p>
      )}

      {data && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Weekly Strategy:</span>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.45 }}>{data.weeklyPlanSummary}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Risk Assessment:</span>
              <p style={{ fontSize: '13px', color: '#f87171', lineHeight: 1.45 }}>⚠ {data.riskAssessment}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Priority Adjustments:</span>
            {data.priorityChanges.map((change, idx) => (
              <div key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ color: '#a78bfa' }}>◆</span>
                <span>{change}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(52, 211, 153, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.15)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#34d399' }}>✔ Focus On</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.focusList.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-main)' }}>• {item}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(245, 158, 11, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#fbbf24' }}>⌛ Postpone</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.postponeList.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-main)' }}>• {item}</div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(156, 163, 175, 0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(156, 163, 175, 0.15)' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#9ca3af' }}>✕ Ignore / Archive</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {data.ignoreList.map((item, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--text-main)' }}>• {item}</div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
