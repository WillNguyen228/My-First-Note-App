import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    //children is going to be what ever we wrap which will be our entire app
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    //Interacting with authservice 
    const checkUser = async () => {
        setLoading(true);
        const response = await authService.getUser();
    
        if (response?.error) {
          setUser(null);
        } else {
          setUser(response);
        }
    
        setLoading(false);
    };

    // interacting with login function
    const login = async (email, password) => {
        const response = await authService.login(email, password);
    
        if (response?.error) {
          return response;
        }
    
        await checkUser();
        return { success: true };
    };

    const register = async (email, password) => {
        const response = await authService.register(email, password);
    
        if (response?.error) {
          return response;
        }

        return login (email, password); //Auto login after registration
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        await checkUser();
    };

    //Passing all of these down so that we can run them whereever we want
    return (
        <AuthContext.Provider
          value={{
            user,
            login,
            register,
            logout,
            loading,
          }}
        >
          {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

//const { login } = useAuth() we should be able to do this in our components and call the stuff inside value