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

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation SignupUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`;

export const SAVE_BOOK = gql`
  mutation SaveBook($bookId: ID!) {
    saveBook(bookId: $bookId) {
      id
      title
      author
      description
      image
      link
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation RemoveBook($bookId: ID!) {
    removeBook(bookId: $bookId) {
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

export const LOGOUT_USER = gql`
  mutation LogoutUser {
    logoutUser
  }
`;