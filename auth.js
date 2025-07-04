const jwt = require('jsonwebtoken');
const Employee = require('./models/Employee');

const authMiddleware = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

const login = async (email, password) => {
  console.log('Attempting login with email:', email, 'password:', password);

  // Check for hardcoded admin credentials
  if (email === 'admin@example.com' && password === 'admin123') {
    console.log('Hardcoded admin credentials matched');
    return jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  } else {
    // Fallback to database authentication for other users
    console.log('Checking database for email:', email);
    const employee = await Employee.findOne({ email });
    if (!employee) {
      console.log('No employee found with email:', email);
      throw new Error('Invalid credentials');
    }
    const isValid = await employee.comparePassword(password);
    if (!isValid) {
      console.log('Password mismatch for email:', email);
      throw new Error('Invalid credentials');
    }
    console.log('Database authentication successful for email:', email);
    return jwt.sign(
      { email: employee.email, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }
};

module.exports = { authMiddleware, login };
