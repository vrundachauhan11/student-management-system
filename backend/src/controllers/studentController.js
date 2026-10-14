const mongoose = require('mongoose');
const Student = require('../models/Student');

// Helper to check DB readiness
const checkDbConnection = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      error: 'Database is currently not connected. Please verify that MONGODB_URI is configured and network access is permitted in MongoDB Atlas.',
    });
    return false;
  }
  return true;
};

// Helper to find a student by either MongoDB _id or human-readable studentId
const buildIdentifierQuery = (id) => {
  const trimmed = id.trim();
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return {
      $or: [
        { _id: trimmed },
        { studentId: trimmed.toUpperCase() },
      ],
    };
  }
  return { studentId: trimmed.toUpperCase() };
};

/**
 * @route   GET /api/students
 * @desc    Get all students (or filter by query e.g. ?search= or ?studentId=)
 * @access  Public
 */
const getAllStudents = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const { search, studentId, department } = req.query;
    let query = {};

    if (studentId) {
      query.studentId = studentId.trim().toUpperCase();
    } else if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { studentId: searchRegex },
          { name: searchRegex },
          { department: searchRegex },
          { email: searchRegex },
        ],
      };
    }

    if (department && !query.department) {
      query.department = department.trim();
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by studentId or _id
 * @access  Public
 */
const getStudentById = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const { id } = req.params;
    if (!id || !id.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid student identifier',
      });
    }

    const query = buildIdentifierQuery(id);
    const student = await Student.findOne(query);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: `Student not found with identifier '${id}'`,
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/students
 * @desc    Create a new student record
 * @access  Public
 */
const createStudent = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const { studentId, name, email, department, semester, contact } = req.body;

    // Check required fields presence
    if (!studentId || !name || !email || !department || semester === undefined || !contact) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields. Please provide studentId, name, email, department, semester, and contact.',
      });
    }

    // Check if studentId already exists
    const existingStudent = await Student.findOne({
      studentId: studentId.trim().toUpperCase(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        error: `A student with student ID '${studentId.trim().toUpperCase()}' already exists.`,
      });
    }

    // Create student
    const newStudent = await Student.create({
      studentId: studentId.trim(),
      name: name.trim(),
      email: email.trim(),
      department: department.trim(),
      semester: Number(semester),
      contact: contact.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student record created successfully',
      data: newStudent,
    });
  } catch (error) {
    // Handle duplicate key error from Mongo index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: `A student with student ID '${req.body.studentId}' already exists.`,
      });
    }
    next(error);
  }
};

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student by studentId or _id
 * @access  Public
 */
const updateStudent = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const { id } = req.params;
    const { studentId, name, email, department, semester, contact } = req.body;

    const query = buildIdentifierQuery(id);
    const existingStudent = await Student.findOne(query);

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        error: `Cannot update. Student not found with identifier '${id}'`,
      });
    }

    // If changing studentId, ensure new studentId isn't already taken by another record
    if (studentId && studentId.trim().toUpperCase() !== existingStudent.studentId) {
      const idConflict = await Student.findOne({
        studentId: studentId.trim().toUpperCase(),
        _id: { $ne: existingStudent._id },
      });

      if (idConflict) {
        return res.status(409).json({
          success: false,
          error: `Cannot change studentId to '${studentId}'. That ID is already assigned to another student.`,
        });
      }
      existingStudent.studentId = studentId.trim();
    }

    if (name !== undefined) existingStudent.name = name.trim();
    if (email !== undefined) existingStudent.email = email.trim();
    if (department !== undefined) existingStudent.department = department.trim();
    if (semester !== undefined) existingStudent.semester = Number(semester);
    if (contact !== undefined) existingStudent.contact = contact.trim();

    const updatedStudent = await existingStudent.save();

    res.status(200).json({
      success: true,
      message: 'Student details updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate student ID conflict occurred during update.',
      });
    }
    next(error);
  }
};

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student by studentId or _id
 * @access  Public
 */
const deleteStudent = async (req, res, next) => {
  try {
    if (!checkDbConnection(res)) return;

    const { id } = req.params;
    const query = buildIdentifierQuery(id);

    const deletedStudent = await Student.findOneAndDelete(query);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        error: `Cannot delete. Student not found with identifier '${id}'`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Student '${deletedStudent.name}' (${deletedStudent.studentId}) deleted successfully`,
      data: {
        id: deletedStudent._id,
        studentId: deletedStudent.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
