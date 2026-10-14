import React, { useState, useEffect } from 'react';
import { UserPlus, Save, X, AlertCircle } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics & Communication',
  'Data Science & AI',
  'Business Administration',
];

const INITIAL_STATE = {
  studentId: '',
  name: '',
  email: '',
  department: '',
  semester: '1',
  contact: '',
};

export default function StudentForm({
  onSubmit,
  editingStudent,
  onCancelEdit,
  isSubmitting,
}) {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        studentId: editingStudent.studentId || '',
        name: editingStudent.name || '',
        email: editingStudent.email || '',
        department: editingStudent.department || '',
        semester: String(editingStudent.semester || '1'),
        contact: editingStudent.contact || '',
      });
      setValidationErrors({});
    } else {
      setFormData(INITIAL_STATE);
      setValidationErrors({});
    }
  }, [editingStudent]);

  const validate = () => {
    const errors = {};

    if (!formData.studentId.trim()) {
      errors.studentId = 'Student ID is required';
    } else if (!/^[A-Za-z0-9\-_]{2,20}$/.test(formData.studentId.trim())) {
      errors.studentId = '2-20 alphanumeric characters only (e.g. STU-101)';
    }

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }

    const semNum = Number(formData.semester);
    if (!formData.semester || isNaN(semNum) || semNum < 1 || semNum > 12) {
      errors.semester = 'Semester must be between 1 and 12';
    }

    if (!formData.contact.trim()) {
      errors.contact = 'Contact number is required';
    } else if (!/^[+0-9\s\-()]{7,20}$/.test(formData.contact.trim())) {
      errors.contact = 'Valid contact number required (at least 7 digits)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific validation error on change
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      studentId: formData.studentId.trim().toUpperCase(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim(),
      semester: Number(formData.semester),
      contact: formData.contact.trim(),
    });
  };

  const handleReset = () => {
    setFormData(INITIAL_STATE);
    setValidationErrors({});
    if (editingStudent && onCancelEdit) {
      onCancelEdit();
    }
  };

  const isEditing = Boolean(editingStudent);

  return (
    <div className="card form-card">
      <div className="card-header">
        <div className="card-title-group">
          {isEditing ? (
            <Save size={20} className="text-primary" />
          ) : (
            <UserPlus size={20} className="text-primary" />
          )}
          <h2 className="card-title">
            {isEditing ? `Edit Student: ${editingStudent.studentId}` : 'Add New Student'}
          </h2>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-ghost btn-sm"
            title="Cancel editing"
          >
            <X size={16} /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="student-form" noValidate>
        <div className="form-grid">
          {/* Student ID */}
          <div className="form-group">
            <label htmlFor="studentId" className="form-label">
              Student ID <span className="text-required">*</span>
            </label>
            <input
              id="studentId"
              name="studentId"
              type="text"
              placeholder="e.g. STU-2026-001"
              value={formData.studentId}
              onChange={handleChange}
              className={`form-input ${validationErrors.studentId ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
            {validationErrors.studentId && (
              <span className="field-error">
                <AlertCircle size={13} /> {validationErrors.studentId}
              </span>
            )}
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="text-required">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Alexander Smith"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
            {validationErrors.name && (
              <span className="field-error">
                <AlertCircle size={13} /> {validationErrors.name}
              </span>
            )}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="text-required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. alexander@university.edu"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
            {validationErrors.email && (
              <span className="field-error">
                <AlertCircle size={13} /> {validationErrors.email}
              </span>
            )}
          </div>

          {/* Department */}
          <div className="form-group">
            <label htmlFor="department" className="form-label">
              Department <span className="text-required">*</span>
            </label>
            <input
              id="department"
              name="department"
              type="text"
              list="department-options"
              placeholder="Select or enter department"
              value={formData.department}
              onChange={handleChange}
              className={`form-input ${validationErrors.department ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
            <datalist id="department-options">
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept} />
              ))}
            </datalist>
            {validationErrors.department && (
              <span className="field-error">
                <AlertCircle size={13} /> {validationErrors.department}
              </span>
            )}
          </div>

          {/* Semester */}
          <div className="form-group">
            <label htmlFor="semester" className="form-label">
              Semester <span className="text-required">*</span>
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className={`form-select ${validationErrors.semester ? 'input-error' : ''}`}
              disabled={isSubmitting}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                <option key={num} value={num}>
                  Semester {num}
                </option>
              ))}
            </select>
            {validationErrors.semester && (
              <span className="field-error">
                <AlertCircle size={13} /> {validationErrors.semester}
              </span>
            )}
          </div>

          {/* Contact Number */}
          <div className="form-group">
            <label htmlFor="contact" className="form-label">
              Contact Number <span className="text-required">*</span>
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              placeholder="e.g. +1 (555) 234-5678"
              value={formData.contact}
              onChange={handleChange}
              className={`form-input ${validationErrors.contact ? 'input-error' : ''}`}
              disabled={isSubmitting}
            />
            {validationErrors.contact && (
              <span className="field-error">
                <AlertCircle size={13} /> {validationErrors.contact}
              </span>
            )}
          </div>
        </div>

        <div className="form-actions">
          {isEditing && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isEditing ? (
              <>
                <Save size={16} />
                {isSubmitting ? 'Updating Student...' : 'Save Changes'}
              </>
            ) : (
              <>
                <UserPlus size={16} />
                {isSubmitting ? 'Adding Student...' : 'Add Student'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
