import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize state from local storage on load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from local storage');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // API call to unified login endpoint
      const response = await api.post('/login', credentials);
      const { token, user: userData, gym } = response.data;
      
      const combinedUser = {
        ...userData,
        gymName: gym?.gymName || 'صالة فليكسورا الرياضية'
      };

      setToken(token);
      setUser(combinedUser);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(combinedUser));
      
      toast.success(`مرحباً بك ${combinedUser.name}!`);
      return true;
    } catch (error) {
      // The interceptor handles the generic toast error
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
