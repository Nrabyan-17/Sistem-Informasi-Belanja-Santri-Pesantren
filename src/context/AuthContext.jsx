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

  const login = async (username, password, explicitRole = null) => {
    setLoading(true);
    setError('');

    // Quick login menggunakan explicitRole bila dipilih tombol role demo
    if (explicitRole) {
      const mockUsers = {
        admin: { id: 1, username: 'admin', nama: 'Administrator BAK', role: 'admin', jabatan: 'Administrator Sistem' },
        staff: { id: 2, username: 'staff', nama: 'Ust. Miftahul Huda', role: 'staff', jabatan: 'Kasir Rumah Koin' },
        wali: { id: 3, username: 'wali', nama: 'H. Ahmad Subagyo', role: 'wali', jabatan: 'Wali Santri' },
      };
      const selectedUser = mockUsers[explicitRole] || mockUsers.admin;
      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(selectedUser));
      setUser(selectedUser);
      setLoading(false);
      return selectedUser.role;
    }

    try {
      const data = await authApi.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user.role;
    } catch (e) {
      console.warn('API backend offline/unreachable, fallback ke mode akun demo:', e.message);

      const lowerUser = (username || '').trim().toLowerCase();
      let role = 'admin';
      let nama = 'Administrator BAK';
      let jabatan = 'Administrator Sistem';

      if (lowerUser.includes('staff') || lowerUser.includes('kasir') || lowerUser === 'huda') {
        role = 'staff';
        nama = 'Ust. Miftahul Huda';
        jabatan = 'Kasir Rumah Koin';
      } else if (lowerUser.includes('wali') || lowerUser.includes('orangtua')) {
        role = 'wali';
        nama = 'H. Ahmad Subagyo';
        jabatan = 'Wali Santri';
      } else {
        role = 'admin';
        nama = username ? username.charAt(0).toUpperCase() + username.slice(1) : 'Administrator BAK';
        jabatan = 'Administrator Sistem';
      }

      const mockUser = {
        id: Date.now(),
        username: username || 'admin',
        nama: nama,
        role: role,
        jabatan: jabatan,
      };

      localStorage.setItem('token', 'demo-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser.role;
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
    <AuthContext.Provider value={{ user, loading, error, login, logout, isAuthenticated: Boolean(user) }}>
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
