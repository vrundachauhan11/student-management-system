import React, { useState, useEffect, useCallback } from 'react';
import studentApi from './services/api';
import Navbar from './components/Navbar';
import StatusBanner from './components/StatusBanner';
import StudentForm from './components/StudentForm';
import StudentSearch from './components/StudentSearch';
import StudentTable from './components/StudentTable';
import DeleteModal from './components/DeleteModal';

export default function App() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [banner, setBanner] = useState(null); // { message, type: 'success' | 'error' }
  const [health, setHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Show banner with auto-dismiss
  const showBanner = (message, type = 'success') => {
    setBanner({ message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearBanner = () => {
    setBanner(null);
  };

  // Check backend server & database status
  const checkHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const data = await studentApi.checkHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ isOffline: true });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Fetch students from backend
  const fetchStudents = useCallback(async (searchQuery = '') => {
    setIsLoading(true);
    try {
      const res = await studentApi.getAllStudents(searchQuery);
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      showBanner(err.message, 'error');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchStudents();
  }, [checkHealth, fetchStudents]);

  // Handle Create or Update submission
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingStudent) {
        // Update existing student
        const targetId = editingStudent._id || editingStudent.studentId;
        const res = await studentApi.updateStudent(targetId, formData);
        showBanner(
          res.message || `Student '${formData.name}' updated successfully!`,
          'success'
        );
        setEditingStudent(null);
      } else {
        // Create new student
        const res = await studentApi.createStudent(formData);
        showBanner(
          res.message || `Student '${formData.name}' added successfully!`,
          'success'
        );
      }
      // Re-fetch students and update health
      await fetchStudents(searchTerm);
      checkHealth();
    } catch (err) {
      showBanner(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Search
  const handleSearch = (term) => {
    setSearchTerm(term);
    fetchStudents(term);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    fetchStudents('');
  };

  // Edit action
  const handleEdit = (student) => {
    setEditingStudent(student);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  // Delete flow
  const handleDeletePrompt = (student) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async (student) => {
    setIsDeleting(true);
    try {
      const targetId = student._id || student.studentId;
      const res = await studentApi.deleteStudent(targetId);
      showBanner(
        res.message || `Student '${student.name}' was successfully deleted.`,
        'success'
      );
      setStudentToDelete(null);
      if (editingStudent && (editingStudent._id === targetId || editingStudent.studentId === targetId)) {
        setEditingStudent(null);
      }
      await fetchStudents(searchTerm);
    } catch (err) {
      showBanner(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Top Navigation & Status */}
      <Navbar
        health={health}
        onRefreshHealth={() => {
          checkHealth();
          fetchStudents(searchTerm);
        }}
        isCheckingHealth={isCheckingHealth}
      />

      <main className="main-content">
        <div className="content-container">
          {/* Notification Banner */}
          {banner && (
            <StatusBanner
              message={banner.message}
              type={banner.type}
              onClose={clearBanner}
            />
          )}

          {/* Database Notice if disconnected */}
          {health && !health.isOffline && health.database && !health.database.connected && (
            <div className="alert-box alert-warning">
              <strong>Database Configuration Notice:</strong> The backend is online, but MongoDB Atlas is not yet connected.
              Please ensure your <code>MONGODB_URI</code> environment variable is set with your Atlas credentials and network access is set to <code>0.0.0.0/0</code>.
            </div>
          )}

          {/* Main Form (Add or Edit) */}
          <section className="dashboard-section">
            <StudentForm
              onSubmit={handleFormSubmit}
              editingStudent={editingStudent}
              onCancelEdit={handleCancelEdit}
              isSubmitting={isSubmitting}
            />
          </section>

          {/* Directory Section: Search + Table */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Student Records Directory</h2>
              <p className="section-subtitle">
                Persisted in MongoDB Atlas collection <code>students</code> within database <code>studentDB</code>
              </p>
            </div>

            <StudentSearch
              onSearch={handleSearch}
              onClear={handleClearSearch}
              currentSearch={searchTerm}
              totalCount={students.length}
            />

            <StudentTable
              students={students}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
              searchTerm={searchTerm}
              onResetSearch={handleClearSearch}
            />
          </section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <DeleteModal
          student={studentToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => setStudentToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>
            Project 1: Student Information Management System · Deployment of a Three-Tier Cloud Architecture
          </p>
          <div className="footer-tags">
            <span className="footer-tag">Frontend: React on Netlify</span>
            <span className="footer-tag">Backend: Express on Render</span>
            <span className="footer-tag">Database: MongoDB Atlas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
