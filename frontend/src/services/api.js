const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Custom request wrapper with error parsing and network failure protection
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    let data;
    try {
      data = await response.json();
    } catch {
      data = { success: response.ok, message: response.statusText };
    }

    if (!response.ok) {
      const errorMessage =
        data.error ||
        data.message ||
        (Array.isArray(data.details) ? data.details.join(', ') : 'An unexpected error occurred');
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const networkError = new Error(
        'Unable to connect to the backend API. Please ensure the backend server is running and accessible.'
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw err;
  }
}

export const studentApi = {
  // Check backend health & DB connection status
  checkHealth: () => request('health'),

  // Get all students with optional search query
  getAllStudents: (searchTerm = '') => {
    const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
    return request(`students${query}`);
  },

  // Get single student by ID
  getStudentById: (id) => request(`students/${encodeURIComponent(id)}`),

  // Create new student record
  createStudent: (studentData) =>
    request('students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),

  // Update existing student
  updateStudent: (id, studentData) =>
    request(`students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    }),

  // Delete student
  deleteStudent: (id) =>
    request(`students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};

export default studentApi;
