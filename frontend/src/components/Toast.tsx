import { useEffect } from 'react';
import { IconCheck } from './SocialIcons';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      {type === 'success' && (
        <span className="toast-icon toast-icon-success">
          <IconCheck size={16} />
        </span>
      )}
      <span className="toast-message">{message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}
