// Import necessary dependencies for implementing the resolvers
const bcrypt = require('bcrypt');
const { User } = require('./models'); // Import your User model
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('./auth'); // Import a function to sign tokens

const axios = require('axios'); // You may need to install axios

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

const books = []; // data structure to store saved books.
let loggedInUser = null; // Store the logged-in user's information.


const resolvers = {
    Query: {
      searchBooks: async (_, { query }) => {
        try {
          // Request to the Google Books API to search for books
          const response = await axios.get(GOOGLE_BOOKS_API_URL, {
            params: {
              q: query, // The search query passed from the GraphQL query
            },
          });
    
          // Extract relevant data from the response
          const books = response.data.items.map((item) => {
            const bookInfo = item.volumeInfo;
            return {
              title: bookInfo.title,
              author: bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown',
              description: bookInfo.description,
              image: bookInfo.imageLinks ? bookInfo.imageLinks.thumbnail : null,
              link: bookInfo.infoLink,
            };
          });
    
          return books;
        } catch (error) {
          throw new Error(`Error searching for books: ${error.message}`);
        }
      },
      savedBooks: async (_, __, context) => {
        // Check if the user is logged in (authenticated)
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }
    
        try {
          // Fetch the user's saved books from your database
          const user = await User.findById(context.user.id);
    
          if (!user) {
            throw new Error('User not found');
          }
    
          // Return the list of saved books
          return user.savedBooks;
        } catch (error) {
          throw new Error(`Error fetching saved books: ${error.message}`);
        }
      },
    },
    Mutation: {
      createUser: async (_, { username, email, password }) => {
        try {
          // Check if the user already exists by email or username
          const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
          if (existingUser) {
            throw new AuthenticationError('User already exists');
          }
    
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
    
          // Create a new user instance
          const newUser = new User({
            username,
            email,
            password: hashedPassword,
          });
    
          // Save the user to the database
          await newUser.save();
    
          // Generate an authentication token
          const token = signToken({ username: newUser.username, _id: newUser._id });
    
          return { token, user: newUser };
        } catch (error) {
          // Handle any errors here, e.g., log the error and return an appropriate response
          console.error(error);
          throw new Error('An error occurred during user creation');
        }
      },
    },
    loginUser: async (_, { email, password }) => {
      try {
        // Find the user by their email
        const user = await User.findOne({ email });
    
        if (!user) {
          throw new AuthenticationError('User with this email does not exist');
        }
    
        // Compare the provided password with the stored hashed password
        const correctPassword = await bcrypt.compare(password, user.password);
    
        if (!correctPassword) {
          throw new AuthenticationError('Incorrect password');
        }
    
        // Generate an authentication token
        const token = signToken({ email: user.email, _id: user._id });
    
        return { token, user };
      } catch (error) {
        // Handle any errors here, e.g., log the error and return an appropriate response
        console.error(error);
        throw new Error('An error occurred during login');
      }
    },
      logoutUser: (_, __, context) => {
        // Check if the user is logged in (authenticated)
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }

        try {
          context.user = null;
      
          return 'Logout successful';
        } catch (error) {
          throw new Error(`Error during logout: ${error.message}`);
        }
      },
      saveBook: async (_, { bookId }, context) => {
        // Check if the user is logged in (authenticated)
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }
      
        try {
          // Find the user in your database (replace 'User' with your actual model)
          const user = await User.findById(context.user.id);
      
          if (!user) {
            throw new Error('User not found');
          }
      
          // Check if the book is already saved by the user (optional)
          const alreadySaved = user.savedBooks.some((savedBook) => savedBook === bookId);
      
          if (alreadySaved) {
            throw new Error('Book is already saved');
          }
      
          // Add the book to the user's list of saved books
          user.savedBooks.push(bookId);
      
          // Save the user (update their savedBooks array)
          await user.save();
      
          return 'Book saved successfully';
        } catch (error) {
          throw new Error(`Error saving book: ${error.message}`);
        }
      },
      removeBook: async (_, { bookId }, context) => {
        // Check if authenticated
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
        }
      
        try {
          // Find the book by its ID and remove it
          const deletedBook = await Book.findByIdAndRemove(bookId);
      
          if (!deletedBook) {
            throw new Error('Book not found or cannot be deleted');
          }
      
          return deletedBook;
        } catch (error) {
          throw new Error(`Error deleting book: ${error.message}`);
        }
      },
  };

module.exports = resolvers;