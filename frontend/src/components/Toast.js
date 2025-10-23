import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    console.log('🔔 Toast renderizado:', { message, type });
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, message, type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`goia-toast goia-toast-${type}`}>
      <div className="goia-toast-icon">{getIcon()}</div>
      <div className="goia-toast-message">{message}</div>
      <button className="goia-toast-close" onClick={onClose}>×</button>
    </div>
  );
};

export default Toast;

