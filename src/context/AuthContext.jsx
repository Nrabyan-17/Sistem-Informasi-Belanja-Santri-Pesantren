import { createContext, useContext, useState } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user.role;
    } catch (e) {
      setError(e.message || 'Login gagal.');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Label jabatan default per role untuk badge sidebar.
const ROLE_LABEL = {
  admin: 'Administrator',
  staff: 'Staff Rumah Koin',
  wali: 'Wali Santri',
};

// Badge sidebar: nama + jabatan user login (fallback ke label role).
export const buildUserBadge = (user) =>
  user
    ? {
        name: user.nama || user.name || '—',
        role: user.jabatan || ROLE_LABEL[user.role] || '—',
      }
    : null;
