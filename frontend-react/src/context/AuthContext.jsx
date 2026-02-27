import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.user_id, role: payload.role });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    const newToken = res.data.token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const payload = JSON.parse(atob(newToken.split('.')[1]));
    setUser({ id: payload.user_id, role: payload.role });
    return payload.role;
  };

  const register = async (nama, email, password, role = 'pembeli') => {
    await api.post('/users/register', { nama, email, password, role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
