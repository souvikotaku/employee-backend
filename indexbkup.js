const { ApolloServer, cors } = require('apollo-server');
const mongoose = require('mongoose');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { authMiddleware } = require('./auth');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log('MongoDB connected to employee_db database and collection')
  )
  .catch((err) => console.error('MongoDB connection error:', err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ user: authMiddleware(req) }),
  cors: true, // Enable CORS
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server running at ${url}`);
});
