import React from 'react';
import { Edit3, Trash2, Mail, Phone, BookOpen, UserX } from 'lucide-react';

export default function StudentTable({
  students,
  isLoading,
  onEdit,
  onDelete,
  searchTerm,
  onResetSearch,
}) {
  if (isLoading) {
    return (
      <div className="card table-card">
        <div className="loading-container">
          <div className="spinner"></div>
          <p className="loading-text">Fetching students from MongoDB Atlas...</p>
        </div>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="card table-card">
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <UserX size={36} />
          </div>
          <h3 className="empty-title">
            {searchTerm ? 'No matching student records found' : 'No students registered yet'}
          </h3>
          <p className="empty-description">
            {searchTerm
              ? `No student matched your search query "${searchTerm}". Try searching by another student ID, name, or department.`
              : 'Add your first student using the form above to populate your MongoDB Atlas database.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={onResetSearch}
              className="btn btn-secondary btn-sm mt-3"
            >
              Clear Search Filter
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card table-card">
      <div className="table-responsive">
        <table className="student-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Contact Info</th>
              <th>Department</th>
              <th>Semester</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id || student.studentId} className="table-row">
                <td className="cell-id">
                  <span className="id-badge">{student.studentId}</span>
                </td>
                <td className="cell-name">
                  <div className="student-name">{student.name}</div>
                  <div className="student-subtext text-muted">
                    Added {new Date(student.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </td>
                <td className="cell-contact">
                  <div className="contact-item">
                    <Mail size={13} className="text-muted" />
                    <a href={`mailto:${student.email}`} className="contact-link">
                      {student.email}
                    </a>
                  </div>
                  <div className="contact-item">
                    <Phone size={13} className="text-muted" />
                    <span>{student.contact}</span>
                  </div>
                </td>
                <td className="cell-department">
                  <span className="department-tag">
                    <BookOpen size={12} />
                    {student.department}
                  </span>
                </td>
                <td className="cell-semester">
                  <span className="semester-pill">Sem {student.semester}</span>
                </td>
                <td className="cell-actions text-right">
                  <div className="action-buttons">
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className="btn btn-icon btn-outline btn-sm"
                      title="Edit student"
                      aria-label={`Edit ${student.name}`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(student)}
                      className="btn btn-icon btn-danger-outline btn-sm"
                      title="Delete student"
                      aria-label={`Delete ${student.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
