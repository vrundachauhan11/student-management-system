import React from 'react';
import { GraduationCap, Server, Database, RefreshCw } from 'lucide-react';

export default function Navbar({ health, onRefreshHealth, isCheckingHealth }) {
  const getStatusBadge = () => {
    if (!health) {
      return (
        <span className="badge badge-neutral">
          <Server size={14} className="animate-pulse" />
          Connecting to backend...
        </span>
      );
    }

    if (health.isOffline) {
      return (
        <span className="badge badge-error" title="Backend service is unreachable">
          <Server size={14} />
          Backend Offline
        </span>
      );
    }

    if (health.database && health.database.connected) {
      return (
        <span className="badge badge-success" title="Backend and MongoDB Atlas connected">
          <Database size={14} />
          Atlas Connected ({health.database.databaseName})
        </span>
      );
    }

    return (
      <span className="badge badge-warning" title="Backend online, but MongoDB Atlas disconnected">
        <Database size={14} />
        DB Disconnected
      </span>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="brand-title">Student Information Management System</h1>
            <p className="brand-subtitle">
              Three-Tier Cloud Architecture · Netlify + Render + MongoDB Atlas
            </p>
          </div>
        </div>

        <div className="navbar-actions">
          {getStatusBadge()}
          <button
            type="button"
            onClick={onRefreshHealth}
            disabled={isCheckingHealth}
            className="btn btn-outline btn-icon"
            title="Refresh backend status"
          >
            <RefreshCw size={16} className={isCheckingHealth ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  );
}
