const Employee = require('./models/Employee');
const { AuthenticationError } = require('apollo-server');
const { login } = require('./auth');

const resolvers = {
  Query: {
    employees: async (
      _,
      { filter, page = 1, limit = 10, sortBy, sortOrder }
    ) => {
      const query = filter ? { 'name.first': new RegExp(filter, 'i') } : {};
      const sort = sortBy ? { [sortBy]: sortOrder === 'desc' ? -1 : 1 } : {};
      return await Employee.find(query)
        .lean() // Optimize by converting to plain JS objects
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);
    },
    employee: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in');
      return await Employee.findOne({ id }).lean(); // Correctly uses custom id field
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
      return await Employee.findOneAndUpdate(
        { id }, // Query by custom id field
        { $set: input }, // Use $set to update only provided fields
        { new: true, runValidators: true } // Return updated doc and validate
      ).lean();
    },
    deleteEmployee: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin')
        throw new AuthenticationError('Admins only');
      const result = await Employee.findOneAndDelete({ id }); // Use findOneAndDelete with custom id
      return !!result;
    },
    login: async (_, { email, password }) => {
      return await login(email, password);
    },
  },
};

module.exports = resolvers;
