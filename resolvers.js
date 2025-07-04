const Employee = require('./models/Employee');
const { AuthenticationError } = require('apollo-server');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { login: loginHandler } = require('./auth'); // ✅ Import the login handler

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

    // ✅ Updated login to use the one from auth.js
    login: async (_, { email, password }) => {
      return await loginHandler(email, password);
    },
  },
};

module.exports = resolvers;
