import React from 'react';
import { BarChart3, Sparkles } from 'lucide-react';

export default function CognitiveLoad({ data, loading }) {
  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluating cognitive metrics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div className="dashboard-panel-header" style={{ marginBottom: '10px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 style={{ width: '18px', color: 'var(--text-muted)' }} />
            Cognitive Load Diagnostic
          </h2>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
          No data available. Add tasks to start diagnostic.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div className="dashboard-panel-header" style={{ marginBottom: '10px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 style={{ width: '18px', color: 'var(--accent-blue)' }} />
          Cognitive Load Diagnostic
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff' }}>
            {data.cognitiveLoad}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 100</span>
          
          <span style={{
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid',
            marginLeft: 'auto',
            color: data.level === 'Critical' ? '#ef4444' : data.level === 'High' ? '#fbbf24' : data.level === 'Moderate' ? '#c084fc' : '#34d399',
            background: data.level === 'Critical' ? 'rgba(239,68,68,0.1)' : data.level === 'High' ? 'rgba(245,158,11,0.1)' : data.level === 'Moderate' ? 'rgba(167,139,250,0.1)' : 'rgba(20,184,166,0.1)',
            borderColor: data.level === 'Critical' ? 'rgba(239,68,68,0.25)' : data.level === 'High' ? 'rgba(245,158,11,0.25)' : data.level === 'Moderate' ? 'rgba(167,139,250,0.25)' : 'rgba(20,184,166,0.25)'
          }}>
            {data.level}
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
          {data.explanation}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>AI Recommendations:</span>
          {data.recommendations.map((rec, idx) => (
            <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(20, 184, 166, 0.03)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '10px', color: '#2dd4bf' }}>
              <Sparkles style={{ width: '14px', flexShrink: 0 }} />
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
