import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem', margin: '2rem auto', maxWidth: '600px',
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444',
          borderRadius: '12px', color: '#EF4444', fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️</span> Something went wrong
          </h2>
          <p style={{ color: '#FCA5A5' }}>An error occurred while loading this section.</p>
          <details style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', overflow: 'auto' }}>
            <summary style={{ cursor: 'pointer', outline: 'none', fontWeight: 'bold' }}>View Error Details</summary>
            <pre style={{ margin: '1rem 0 0 0', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{ 
              marginTop: '1.5rem', background: '#EF4444', color: '#fff', 
              border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px',
              fontWeight: 'bold', cursor: 'pointer' 
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
