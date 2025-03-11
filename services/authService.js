import { account } from './appwrite';
import { ID } from 'react-native-appwrite'; //Bring in ID from the SDK

const authService = {
    //Registering a user
    async register(email, password) {
        try {
          const response = await account.create(ID.unique(), email, password);
          return response;
        } catch (error) {
          return {
            error: error.message || 'Registration failed. Please try again',
          };
        }
    },

    //Logging in 
    async login(email, password) {
        try {
            const response = await account.createEmailPasswordSession(
              email,
              password
            );
            return response;
          } catch (error) {
            return {
              error: error.message || 'Login failed. Please check your credentials',
            };
        }
    },

    // Getting the logged in user
    async getUser() {
        try {
          return await account.get();
        } catch (error) {
          return null;
        }
    },

    //Loggoing out user
    async logout() {
        try {
          await account.deleteSession('current');
        } catch (error) {
          return {
            error: error.message || 'Logout failed. Please try again',
          };
        }
    },
};

export default authService;