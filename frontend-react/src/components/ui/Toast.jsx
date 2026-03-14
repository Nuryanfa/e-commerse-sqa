import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast component for transient notifications.
 * Props:
 * - message: string – text to display
 * - type: 'success' | 'error' | 'info' – determines styling
 * - duration: number (ms) – auto hide after timeout (default 3000)
 * - onClose: function – callback when toast is dismissed
 */
export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      {message}
    </div>
  );
}
