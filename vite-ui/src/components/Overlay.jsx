import React from 'react';

export const Overlay = ({ netStatus, onEStop }) => {
  return (
    <>
      <div 
        id="netStatusPanel" 
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '8px 12px',
          borderRadius: '10px',
          background: 'rgba(15, 18, 30, 0.82)',
          color: '#f8fafc',
          fontSize: '12px',
          lineHeight: '1.4',
          minWidth: '240px',
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div 
          id="netStatusLabel" 
          data-level={netStatus.level}
          style={{
            fontWeight: 700,
            marginBottom: '4px',
            color: netStatus.level === 'connected' ? '#22c55e' :
                   netStatus.level === 'degraded' ? '#f97316' : 
                   '#ef4444'
          }}
        >
          {netStatus.label || 'INIT'}
        </div>
        <div 
          id="netStatusDetail"
          style={{
            opacity: 0.85,
            marginBottom: '4px'
          }}
        >
          {netStatus.detail || '--'}
        </div>
        <div 
          id="netMetrics"
          style={{ opacity: 0.72 }}
        >
          {netStatus.metrics && Object.entries(netStatus.metrics).map(([k, v]) => (
            <div key={k}>{k}: {v}</div>
          ))}
        </div>
        <div 
          id="poseInfo"
          style={{
            marginTop: '4px',
            fontFamily: 'monospace'
          }}
        >
          {netStatus.pose || 'pos: --'}
        </div>
      </div>

      <button
        id="eStopButton"
        onClick={onEStop}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}
      >
        E-Stop
      </button>
    </>
  );
};
