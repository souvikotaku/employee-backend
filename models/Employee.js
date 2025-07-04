const mongoose = require('mongoose');

const nameSchema = new mongoose.Schema({
  first: { type: String, required: true },
  last: { type: String, required: true },
});

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: nameSchema, required: true },
  age: { type: Number, required: true },
  class: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  attendance: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'employee'] },
  password: { type: String, required: true },
});

module.exports = mongoose.model('Employee', employeeSchema);
