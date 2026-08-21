import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

const AuthContext = createContext(null);

// Daftar akun valid untuk autentikasi sistem
const VALID_ACCOUNTS = [
  {
    usernames: ['admin', 'ina', 'kabid'],
    passwords: ['password', '123456', 'admin'],
    user: {
      id: 1,
      username: 'admin',
      nama: 'Ustadzah Ina Wahdiah',
      role: 'admin',
      jabatan: 'Kabid BAK & Manajerial',
    },
  },
  {
    usernames: ['staff', 'huda', 'kasir', 'faris'],
    passwords: ['password', '123456', 'staff'],
    user: {
      id: 2,
      username: 'staff',
      nama: 'Ust. Miftahul Huda',
      role: 'staff',
      jabatan: 'Kasir Rumah Koin',
    },
  },
  {
    usernames: ['wali', 'mahmud', '2024001', '2024002', '2024003', '2024004', '2024005'],
    passwords: ['password', '123456', 'wali'],
    user: {
      id: 4,
      username: 'wali',
      nama: 'Bpk. Mahmud Fauzi',
      role: 'wali',
      jabatan: 'Wali Santri',
    },
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token.startsWith('demo-token-')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true);
    setError('');

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    try {
      // 1. Coba login ke API backend
      const data = await authApi.login({ username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user.role;
    } catch (e) {
      // 2. Jika API offline / tidak terjangkau, validasi kredensial lokal
      const matchedAccount = VALID_ACCOUNTS.find((acc) =>
        acc.usernames.includes(cleanUsername) && acc.passwords.includes(cleanPassword)
      );

      if (matchedAccount) {
        const loggedUser = matchedAccount.user;
        const localToken = 'auth-token-' + Date.now();
        localStorage.setItem('token', localToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        return loggedUser.role;
      }

      // 3. Jika username atau password tidak cocok, tolak login
      const err = new Error('Username atau password salah.');
      setError(err.message);
      throw err;
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
