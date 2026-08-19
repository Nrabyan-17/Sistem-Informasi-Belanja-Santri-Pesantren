import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const login = (credentials = {}) => {
    let role = credentials.role || 'admin';
    let nama = credentials.nama;

    if (!nama) {
      if (role === 'admin') nama = 'Ustadzah Ina Wahdiah';
      else if (role === 'staff') nama = 'Ust. Miftahul Huda';
      else if (role === 'wali') nama = 'Bpk. Mahmud Fauzi';
      else nama = 'Pengguna Sistem';
    }

    const newUser = {
      noHp: credentials.noHp || '081234567890',
      role,
      nama,
      loginAt: new Date().toISOString(),
    };

    setUser(newUser);
    try {
      localStorage.setItem('auth_user', JSON.stringify(newUser));
    } catch (e) {
      console.error('Gagal menyimpan sesi login:', e);
    }
    return newUser;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('auth_user');
    } catch (e) {
      console.error('Gagal menghapus sesi login:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

const ROLE_LABEL = {
  admin: 'Administrator',
  staff: 'Staff Rumah Koin',
  wali: 'Wali Santri',
};

export const buildUserBadge = (user) =>
  user
    ? {
        name: user.nama || user.name || '—',
        role: user.jabatan || ROLE_LABEL[user.role] || '—',
      }
    : null;
