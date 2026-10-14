import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteModal({ student, onConfirm, onCancel, isDeleting }) {
  if (!student) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-icon-badge danger">
            <AlertTriangle size={24} />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="modal-close-btn"
            disabled={isDeleting}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h3 className="modal-title">Delete Student Record?</h3>
          <p className="modal-description">
            Are you sure you want to permanently delete the record for{' '}
            <strong>{student.name}</strong> (Student ID:{' '}
            <code className="code-badge">{student.studentId}</code>)? This action will delete the
            document from the MongoDB Atlas collection <code>students</code> and cannot be undone.
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(student)}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : 'Yes, Delete Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
