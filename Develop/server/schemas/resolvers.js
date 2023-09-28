// Import necessary dependencies for implementing the resolvers
const bcrypt = require('bcrypt');
const { User } = require('./models'); // Import your User model
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('./auth'); // Import a function to sign tokens

const books = []; // data structure to store saved books.
let loggedInUser = null; // Store the logged-in user's information.


const resolvers = {
    Query: {
      searchBooks: (_, { query }) => {
        // Implement a function to search for books based on the query and return the search results.
        // You can use external APIs like the Google Books API to fetch book data.
      },
      savedBooks: () => {
        // Implement a function to retrieve the saved books for the logged-in user.
        // Return the list of saved books.
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
      logoutUser: () => {
        // Implement a function to log out the user.
        // Set the loggedInUser variable to null to indicate that the user is logged out.
      },
      saveBook: (_, { bookId }) => {
        // Implement a function to save a book to the user's account.
        // Add the book to the user's list of saved books.
      },
      removeBook: async (_, { bookId }) => {
        // check if authenticated
        if (!context.user) {
          throw new AuthenticationError('Not logged in');
      }

      try {
          // find by id
          const deletedWorkout = await Workout.findByIdAndRemove(args.id);

          if (!deletedWorkout) {
              throw new Error('Workout not found or cannot be deleted');
          }

          return deletedWorkout;
      } catch (error) {
          throw new Error('Error deleting workout: ${error.message');
      }
    },
  };

module.exports = resolvers;