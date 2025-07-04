const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    age: { type: Number, required: true },
    class: { type: String, required: true },
    subjects: [{ type: String }],
    attendance: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  },
  { collection: 'employee_db' } // Explicitly set collection name
);

// Add index for faster filtering
employeeSchema.index({ 'name.first': 1 });

module.exports = mongoose.model('Employee', employeeSchema);
