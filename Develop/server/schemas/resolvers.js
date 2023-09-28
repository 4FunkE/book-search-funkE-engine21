// Import necessary dependencies for implementing the resolvers
const { User } = require('./models'); // Import your User model
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('./auth'); // Import a function to sign tokens

const axios = require('axios');
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

const resolvers = {
    Query: {
      me: async (_, __, context) => {
        // Check if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
  
        try {
          // Fetch the authenticated user's data from the database
          const user = await User.findById(context.user._id);
  
          if (!user) {
            throw new AuthenticationError('User not found');
          }
  
          return user;
        } catch (error) {
          throw new Error(`Error fetching user data: ${error.message}`);
        }
      },
    },
    Mutation: {
      login: async (_, { email, password }) => {
        try {
          // Find the user by their email in the database
          const user = await User.findOne({ email });
  
          if (!user) {
            throw new AuthenticationError('User not found');
          }
  
          // Validate the password
          const isValidPassword = await user.validatePassword(password);
  
          if (!isValidPassword) {
            throw new AuthenticationError('Invalid password');
          }
  
          // Generate an authentication token
          const token = signToken({ _id: user._id, email: user.email });
  
          return { token, user };
        } catch (error) {
          throw new Error(`Error during login: ${error.message}`);
        }
      },
      addUser: async (_, { username, email, password }) => {
        try {
          // Check if the user already exists by email
          const existingUser = await User.findOne({ email });
  
          if (existingUser) {
            throw new AuthenticationError('User already exists');
          }
  
          // Create a new user instance
          const newUser = new User({ username, email, password });
  
          // Save the user to the database
          await newUser.save();
  
          // Generate an authentication token
          const token = signToken({ _id: newUser._id, email: newUser.email });
  
          return { token, user: newUser };
        } catch (error) {
          throw new Error(`Error during user registration: ${error.message}`);
        }
      },
      saveBook: async (_, { newBook }, context) => {
        // Check if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
  
        try {
          // Fetch the authenticated user from the database
          const user = await User.findById(context.user._id);
  
          if (!user) {
            throw new AuthenticationError('User not found');
          }
  
          // Add the new book to the user's savedBooks array
          user.savedBooks.push(newBook);
  
          // Save the updated user data
          await user.save();
  
          return user;
        } catch (error) {
          throw new Error(`Error saving book: ${error.message}`);
        }
      },
  
      removeBook: async (_, { bookId }, context) => {
        // Check if the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('Not authenticated');
        }
  
        try {
          // Fetch the authenticated user from the database
          const user = await User.findById(context.user._id);
  
          if (!user) {
            throw new AuthenticationError('User not found');
          }
  
          // Remove the book with the specified bookId from the user's savedBooks array
          user.savedBooks = user.savedBooks.filter((savedBook) => savedBook.bookId !== bookId);
  
          // Save the updated user data
          await user.save();
  
          return user;
        } catch (error) {
          throw new Error(`Error removing book: ${error.message}`);
        }
      },
    },
  };

module.exports = resolvers;