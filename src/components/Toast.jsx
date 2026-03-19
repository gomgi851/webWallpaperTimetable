import React, { useEffect } from 'react';
import '../styles/Toast.css';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    // 3초 후 자동으로 닫기
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        {type === 'error' && <span className="toast-icon">⚠</span>}
        {type === 'success' && <span className="toast-icon">✓</span>}
        {type === 'warning' && <span className="toast-icon">!</span>}
        {type === 'info' && <span className="toast-icon">ℹ</span>}
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
