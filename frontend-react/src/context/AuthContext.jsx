import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      // Base64URL decode
      let base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      setUser({ id: payload.user_id, role: payload.role, nama: payload.nama || '' });
    } catch (e) {
      console.error("Auth token parse error:", e);
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const newToken = res.data.data.token;
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    // Base64URL decode
    let base64 = newToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    setUser({ id: payload.user_id, role: payload.role, nama: payload.nama || '' });
    return payload.role;
  };

  const register = async (nama, email, password, role = 'pembeli') => {
    await api.post('/auth/register', { nama, email, password, role });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}
