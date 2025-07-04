const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');
const Employee = require('./models/Employee');
const bcrypt = require('bcrypt');

const secret = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = async (req) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, secret);
    const employee = await Employee.findOne({ id: decoded.id }).lean();
    if (!employee) throw new AuthenticationError('Invalid token');

    return { id: employee.id, role: employee.role };
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
};

const login = async (email, password) => {
  // Hardcoded test credentials for admin
  if (email === 'admin@example.com' && password === 'admin123') {
    const token = jwt.sign({ email, role: 'admin' }, secret, {
      expiresIn: '1h',
    });
    return { token, role: 'admin' };
  }

  // Normal login flow
  const employee = await Employee.findOne({ email }).lean();
  if (!employee || !(await bcrypt.compare(password, employee.password))) {
    return { token: null, role: null };
  }
  const token = jwt.sign({ id: employee.id, role: employee.role }, secret, {
    expiresIn: '1h',
  });
  return { token, role: employee.role };
};

module.exports = { authMiddleware, login };
