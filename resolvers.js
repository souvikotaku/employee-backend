const Employee = require('./models/Employee');
const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Add this line

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
        .limit(limit);
    },
    employee: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      return await Employee.findOne({ id }).lean();
    },
    employeeByEmail: async (_, { email }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      return await Employee.findOne({ email }).lean();
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
      // if (!user || user.role !== 'admin')
      //   throw new AuthenticationError('Admins only');
      // Only hash password if provided in input

      const updateData = { ...input };

      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      } else {
        // Remove password from updateData if not provided to avoid validation
        delete updateData.password;
      }
      return await Employee.findOneAndUpdate(
        { id },
        { $set: updateData },
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
