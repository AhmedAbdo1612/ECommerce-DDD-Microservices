import React, { useState, useEffect } from 'react';

const DebugPanel = () => {
  const [logs, setLogs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('Checking...');

  useEffect(() => {
    const handleDebugEvent = (e) => {
      setLogs((prev) => [e.detail, ...prev].slice(0, 50));
    };

    window.addEventListener('api-debug', handleDebugEvent);
    
    // Check initial gateway status
    import('../api/services').then(({ api }) => {
      api.health.checkGateway()
        .then(() => setGatewayStatus('Online'))
        .catch(() => setGatewayStatus('Offline / Unreachable'));
    });

    return () => window.removeEventListener('api-debug', handleDebugEvent);
  }, []);

  if (!visible) {
    return (
      <button 
        onClick={() => setVisible(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', 
          background: '#0F172A', color: '#10B981', border: '1px solid #10B981',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', zIndex: 9999,
          fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        API Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '450px', height: '300px',
      background: '#0F172A', color: '#F8FAFC', border: '1px solid #334155',
      borderRadius: '12px', display: 'flex', flexDirection: 'column', zIndex: 9999,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', overflow: 'hidden',
      fontFamily: 'monospace', fontSize: '0.85rem'
    }}>
      <div style={{
        padding: '12px', background: '#1E293B', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <strong style={{ color: '#38BDF8' }}>API Network Monitor</strong>
          <span style={{ 
            fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px',
            background: gatewayStatus === 'Online' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: gatewayStatus === 'Online' ? '#10B981' : '#EF4444'
          }}>
            Gateway: {gatewayStatus}
          </span>
        </div>
        <button 
          onClick={() => setVisible(false)}
          style={{ background: 'transparent', color: '#94A3B8', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
        >
          ✕
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {logs.map((log, i) => {
          const isError = log.type === 'error' || (log.status && log.status >= 400);
          const isReq = log.type === 'request';
          
          return (
            <div key={i} style={{
              background: isError ? 'rgba(239, 68, 68, 0.1)' : isReq ? 'rgba(56, 189, 248, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              borderLeft: `4px solid ${isError ? '#EF4444' : isReq ? '#38BDF8' : '#10B981'}`,
              padding: '6px 10px', borderRadius: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '4px', fontSize: '0.75rem' }}>
                <span>{log.timestamp.toLocaleTimeString()}</span>
                <span style={{ fontWeight: 'bold', color: isError ? '#FCA5A5' : '#E2E8F0' }}>{log.type.toUpperCase()}</span>
              </div>
              <div style={{ wordBreak: 'break-all' }}>
                <strong style={{ color: '#E2E8F0' }}>{log.method?.toUpperCase()}</strong> {log.url}
              </div>
              {!isReq && (
                <div style={{ marginTop: '4px', color: isError ? '#EF4444' : '#10B981' }}>
                  {log.status ? `Status: ${log.status}` : ''} {log.error ? `- ${log.error}` : ''}
                </div>
              )}
            </div>
          );
        })}
        {logs.length === 0 && <div style={{ color: '#64748B', textAlign: 'center', marginTop: '2rem' }}>No network activity yet.</div>}
      </div>
    </div>
  );
};

export default DebugPanel;
