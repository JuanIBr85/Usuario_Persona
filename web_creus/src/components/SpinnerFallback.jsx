import React from 'react';

const SpinnerFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100px',
  }}>
    <div style={{
      width: '30px',
      height: '30px',
      border: '4px solid rgba(0,0,0,0.1)',
      borderTop: '4px solid #3b82f6', // azul tailwind, podes cambiar color
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

export default SpinnerFallback;