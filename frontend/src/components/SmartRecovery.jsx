import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function SmartRecovery({ data, loading, onApprove, onDismiss, compact }) {
  if (loading) {
    if (compact) {
      return (
        <div style={{
          padding: '12px',
          background: 'rgba(245, 158, 11, 0.04)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '10px',
          color: '#a78bfa',
          fontSize: '11.5px',
          animation: 'pulse-mic 1.5s infinite',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle style={{ color: '#fbbf24', width: '14px', height: '14px', flexShrink: 0 }} />
          <span>Evaluating missed tasks and finding alternative slots...</span>
        </div>
      );
    }
    return (
      <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', color: '#a78bfa', animation: 'pulse-mic 1.5s infinite', marginBottom: '24px' }}>
        Evaluating missed tasks and finding alternative slots...
      </div>
    );
  }

  if (!data) return null;

  if (compact) {
    return (
      <div style={{
        padding: '12px',
        background: 'rgba(245, 158, 11, 0.04)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <AlertCircle style={{ color: '#fbbf24', width: '14px', height: '14px', flexShrink: 0 }} /> Smart Recovery Agent
          </h4>
          <span style={{ fontSize: '8px', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
            Missed Action
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold', margin: 0, lineHeight: 1.4 }}>
            {data.missedTask} missed.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '2px' }}>Recovery Plan:</span>
            {data.adjustments.map((adj, idx) => (
              <div key={idx} style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center', lineHeight: 1.35 }}>
                <span style={{ color: '#fbbf24', flexShrink: 0 }}>⚡</span>
                <span>{adj}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onApprove();
              }}
              className="action-btn-pill" 
              style={{ flexGrow: 1, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderColor: '#fbbf24', color: '#000', fontWeight: 'bold', fontSize: '11px', padding: '4px 10px', cursor: 'pointer', border: 'none' }}
            >
              Approve Recovery Replan
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="action-btn-pill"
              style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', fontSize: '11px', padding: '4px 10px', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', borderColor: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.03)', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'var(--font-title)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle style={{ color: '#fbbf24', width: '20px' }} /> Smart Recovery Agent
        </h2>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
          Missed Action Detected
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
          {data.missedTask} missed.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', marginBottom: '4px' }}>Recovery Plan:</span>
          {data.adjustments.map((adj, idx) => (
            <div key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ color: '#fbbf24' }}>⚡</span>
              <span>{adj}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button 
            onClick={onApprove}
            className="btn-primary" 
            style={{ flexGrow: 1, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', borderColor: '#fbbf24', color: '#000', fontWeight: 'bold' }}
          >
            Approve Recovery Replan
          </button>
          <button 
            onClick={onDismiss}
            className="action-btn-pill"
            style={{ padding: '0 16px' }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
