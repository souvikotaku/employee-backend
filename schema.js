const { gql } = require('apollo-server');

const typeDefs = gql`
  type Employee {
    id: ID!
    name: Name!
    age: Int!
    class: String!
    subjects: [String!]!
    attendance: String!
    email: String!
    phone: String!
    password: String!
    role: String!
  }

  type Name {
    first: String!
    last: String!
  }

  input EmployeeInput {
    name: NameInput!
    age: Int!
    class: String
    subjects: [String!]
    attendance: String
    email: String
    phone: String
    password: String
    role: String
  }

  input NameInput {
    first: String!
    last: String!
  }

  type Query {
    employees(
      filter: String
      page: Int
      limit: Int
      sortBy: String
      sortOrder: String
    ): [Employee!]!
    employee(id: ID!): Employee
    employeeByEmail(email: String!): Employee
  }

  type Mutation {
    addEmployee(input: EmployeeInput!): Employee!
    updateEmployee(id: ID!, input: EmployeeInput!): Employee!
    deleteEmployee(id: ID!): Boolean!
    login(email: String!, password: String!): String!
  }
`;

module.exports = typeDefs;
