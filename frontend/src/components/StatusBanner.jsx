import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function StatusBanner({ message, type, onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`status-banner ${isSuccess ? 'banner-success' : 'banner-error'}`}>
      <div className="banner-content">
        {isSuccess ? (
          <CheckCircle2 size={20} className="banner-icon text-success" />
        ) : (
          <AlertTriangle size={20} className="banner-icon text-error" />
        )}
        <span className="banner-text">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="banner-close-btn"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
