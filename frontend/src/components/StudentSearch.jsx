import React, { useState } from 'react';
import { Search, X, Users } from 'lucide-react';

export default function StudentSearch({ onSearch, onClear, currentSearch, totalCount }) {
  const [term, setTerm] = useState(currentSearch || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (term.trim() !== currentSearch) {
      onSearch(term.trim());
    }
  };

  const handleClear = () => {
    setTerm('');
    onClear();
  };

  return (
    <div className="search-section">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by Student ID (e.g. STU101), Name, Department, or Email..."
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {term && (
            <button
              type="button"
              onClick={handleClear}
              className="search-clear-btn"
              title="Clear search input"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button type="submit" className="btn btn-primary">
          <Search size={16} />
          Search
        </button>
      </form>

      <div className="search-meta">
        <div className="count-badge">
          <Users size={15} />
          <span>
            {currentSearch ? (
              <>Found <strong>{totalCount}</strong> matching record{totalCount === 1 ? '' : 's'}</>
            ) : (
              <>Total Students: <strong>{totalCount}</strong></>
            )}
          </span>
        </div>

        {currentSearch && (
          <button type="button" onClick={handleClear} className="btn btn-ghost btn-sm">
            Reset to All Students
          </button>
        )}
      </div>
    </div>
  );
}
