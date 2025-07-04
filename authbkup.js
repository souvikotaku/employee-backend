const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authMiddleware = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

// Mock login function for POC (replace with user model in production)
const login = async (email, password) => {
  if (email === 'admin@example.com' && password === 'admin123') {
    return jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  } else if (email === 'employee@example.com' && password === 'emp123') {
    return jwt.sign({ email, role: 'employee' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }
  throw new Error('Invalid credentials');
};

module.exports = { authMiddleware, login };
