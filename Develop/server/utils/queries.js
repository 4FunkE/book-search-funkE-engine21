import { gql } from '@apollo/client';

// Define GraphQL queries and mutations
export const SEARCH_BOOKS = gql`
  query SearchBooks($query: String!) {
    searchBooks(query: $query) {
      id
      title
      author
      description
      image
      link
    }
  }
`;

export const GET_SAVED_BOOKS = gql`
  query GetSavedBooks {
    savedBooks {
      id
      title
      author
      description
      image
      link
    }
  }
`;