const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true }, // Added password field
    role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  },
  { collection: 'employee_db' } // Explicitly set collection name
);

// Hash password before saving
employeeSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
employeeSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Add index for faster filtering
employeeSchema.index({ 'name.first': 1 });

module.exports = mongoose.model('Employee', employeeSchema);
