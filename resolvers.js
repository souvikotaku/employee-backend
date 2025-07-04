const Employee = require('./models/Employee');
const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const resolvers = {
  Query: {
    employees: async (
      _,
      { filter, page = 1, limit = 10, sortBy, sortOrder }
    ) => {
      const query = filter ? { 'name.first': new RegExp(filter, 'i') } : {};
      const sort = sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : {};
      return await Employee.find(query)
        .lean()
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-password'); // Exclude password for all employees by default
    },
    employee: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      const employee = await Employee.findOne({ id }).lean();
      if (user.role !== 'admin') {
        employee.password = undefined; // Remove password for non-admins
      }
      return employee;
    },
    employeeByEmail: async (_, { email }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      const query = Employee.findOne({ email });
      if (user.role === 'admin') {
        query.select('+password'); // Include password for admins
      }
      const employee = await query.lean();
      if (user.role !== 'admin') {
        employee.password = undefined; // Ensure non-admins don't get password
      }
      return employee;
    },
  },
  Mutation: {
    addEmployee: async (_, { input }, { user }) => {
      if (!user || user.role !== 'admin')
        throw new AuthenticationError('Admins only');
      const employee = new Employee({ ...input, id: Date.now().toString() });
      return await employee.save();
    },
    updateEmployee: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'admin')
        throw new AuthenticationError('Admins only');
      if (input.password) {
        input.password = await bcrypt.hash(input.password, 10);
      }
      return await Employee.findOneAndUpdate(
        { id },
        { $set: input },
        { new: true, runValidators: true }
      ).lean();
    },
    deleteEmployee: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin')
        throw new AuthenticationError('Admins only');
      const result = await Employee.findOneAndDelete({ id });
      return !!result;
    },
    login: async (_, { email, password }) => {
      const employee = await Employee.findOne({ email });
      if (!employee) {
        throw new AuthenticationError('Invalid credentials');
      }
      const isValid = await employee.comparePassword(password);
      if (!isValid) {
        throw new AuthenticationError('Invalid credentials');
      }
      return jwt.sign(
        { email: employee.email, role: employee.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
    },
  },
};

module.exports = resolvers;
