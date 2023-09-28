const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    genre: String
  }

  type Query {
    searchBooks(query: String!): [Book]
  }
`;

module.exports = typeDefs;