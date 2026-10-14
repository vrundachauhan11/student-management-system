const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z0-9\-_]{2,20}$/, 'Student ID must be 2-20 alphanumeric characters (hyphens and underscores allowed)'],
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 12'],
      max: [12, 'Semester must be between 1 and 12'],
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [
        /^[+0-9\s\-()]{7,20}$/,
        'Contact number must be between 7 and 20 valid phone characters',
      ],
    },
  },
  {
    timestamps: true,
    collection: 'students', // Explicitly targeting 'students' collection in studentDB
  }
);

// Virtual or helper for client serialization
studentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
