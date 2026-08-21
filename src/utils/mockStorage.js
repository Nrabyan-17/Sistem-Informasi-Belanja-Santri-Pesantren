import { mockSantri } from '../data/mockSantri';
import { mockUsers } from '../data/mockUsers';
import { mockTransactions } from '../data/mockTransactions';
import { mockProducts } from '../data/mockProducts';

// Keys untuk localStorage
const KEYS = {
  SANTRI: 'mock_pesantren_santri',
  USERS: 'mock_pesantren_users',
  STAFF: 'mock_pesantren_staff',
  ADMINS: 'mock_pesantren_admins',
  WALI_USERS: 'mock_pesantren_wali_users',
  TRANSACTIONS: 'mock_pesantren_transactions',
  BNI_UPLOADS: 'mock_pesantren_bni_uploads',
  SALDOS: 'santri_saldos',
  HISTORY_PREFIX: 'santri_history_',
};

// Default initial staff
const initialStaff = [
  { id: 1, nip: 'STF-001', nama: 'Ustadz Ahmad', jabatan: 'Supervisor', noHp: '0812-3456-7890', status: 'aktif', shift: 'Full', email: 'ahmad@pesantren.id' },
  { id: 2, nip: 'STF-002', nama: 'Ustadz Hasan', jabatan: 'Admin', noHp: '0813-4567-8901', status: 'aktif', shift: 'Pagi', email: 'hasan@pesantren.id' },
  { id: 3, nip: 'STF-003', nama: 'Ustadzah Fatimah', jabatan: 'Kasir', noHp: '0821-5678-9012', status: 'aktif', shift: 'Pagi', email: 'fatimah@pesantren.id' },
  { id: 4, nip: 'STF-004', nama: 'Ustadz Yusuf', jabatan: 'Kasir', noHp: '0857-6789-0123', status: 'aktif', shift: 'Siang', email: 'yusuf@pesantren.id' },
  { id: 5, nip: 'STF-005', nama: 'Ustadzah Aisyah', jabatan: 'Kasir', noHp: '0878-7890-1234', status: 'nonaktif', shift: 'Pagi', email: 'aisyah@pesantren.id' },
  { id: 6, nip: 'STF-006', nama: 'Ustadz Rahman', jabatan: 'Manajer', noHp: '0856-8901-2345', status: 'aktif', shift: 'Full', email: 'rahman@pesantren.id' },
];

// Helper read/write JSON
const getItem = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[mockStorage] Gagal parse ${key}:`, e);
    return fallback;
  }
};

const setItem = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn(`[mockStorage] Gagal simpan ${key}:`, e);
  }
};

// Initializer: Pastikan data awal terpasang jika localStorage masih kosong
export const initMockStorage = () => {
  if (!localStorage.getItem(KEYS.SANTRI)) {
    setItem(KEYS.SANTRI, mockSantri);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    setItem(KEYS.USERS, mockUsers);
  }
  if (!localStorage.getItem(KEYS.STAFF)) {
    setItem(KEYS.STAFF, initialStaff);
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    setItem(KEYS.TRANSACTIONS, mockTransactions);
  }
  if (!localStorage.getItem(KEYS.BNI_UPLOADS)) {
    setItem(KEYS.BNI_UPLOADS, []);
  }
};

// --- SANTRI STORAGE ---
export const getSantriList = () => {
  initMockStorage();
  const list = getItem(KEYS.SANTRI, mockSantri);
  const saldos = getItem(KEYS.SALDOS, {});
  return list.map((s) => ({
    ...s,
    saldo: saldos[s.id] !== undefined ? Number(saldos[s.id]) : Number(s.saldo || 0),
  }));
};

export const saveSantriList = (list) => {
  setItem(KEYS.SANTRI, list);
  return list;
};

export const addSantri = (item) => {
  const list = getSantriList();
  const newItem = {
    id: item.id || Date.now(),
    nis: item.nis || `2024${String(list.length + 1).padStart(3, '0')}`,
    nama: item.nama || item.name || 'Santri Baru',
    kelas: item.kelas || 'VII A',
    tglLahir: item.tglLahir || item.tgl_lahir || '01 Jan 2012',
    namaWali: item.namaWali || item.nama_wali || 'Wali Santri',
    noHpWali: item.noHpWali || item.no_hp_wali || '0812-3456-7890',
    vaJajan: item.vaJajan || item.va_jajan || `8808 0990 ${item.nis || '2024001'}`,
    vaTagihan: item.vaTagihan || item.va_tagihan || `8808 0990 9${(item.nis || '2024001').slice(1)}`,
    status: item.status || 'aktif',
    saldo: Number(item.saldo || 0),
    ...item,
  };
  const updated = [newItem, ...list];
  saveSantriList(updated);
  return newItem;
};

export const updateSantri = (id, data) => {
  const list = getSantriList();
  let found = null;
  const updated = list.map((s) => {
    if (String(s.id) === String(id) || String(s.nis) === String(id)) {
      found = { ...s, ...data };
      return found;
    }
    return s;
  });
  saveSantriList(updated);
  return found;
};

export const deleteSantri = (id) => {
  const list = getSantriList();
  const updated = list.filter((s) => String(s.id) !== String(id) && String(s.nis) !== String(id));
  saveSantriList(updated);
  return true;
};

// --- USERS STORAGE ---
export const getUsersList = () => {
  initMockStorage();
  return getItem(KEYS.USERS, mockUsers);
};

export const saveUsersList = (list) => {
  setItem(KEYS.USERS, list);
  return list;
};

export const addUser = (data) => {
  const list = getUsersList();
  const newUser = {
    id: data.id || Date.now(),
    nama: data.nama || data.name || 'Pengguna Baru',
    username: data.username || (data.nama ? data.nama.toLowerCase().replace(/\s+/g, '') : 'userbaru'),
    role: data.role || 'Staff Rumah Koin',
    noHp: data.noHp || data.no_hp || data.phone || '0812-3456-7890',
    email: data.email || '—',
    status: data.status || 'Aktif',
    createdDate: data.createdDate || new Date().toISOString().slice(0, 10),
    loginTerakhir: 'Baru saja',
    nis: data.nis || '—',
    santri: data.santri || '—',
    noVa: data.noVa || '—',
    ...data,
  };
  const updated = [newUser, ...list];
  saveUsersList(updated);
  return newUser;
};

export const updateUser = (id, data) => {
  const list = getUsersList();
  let found = null;
  const updated = list.map((u) => {
    if (String(u.id) === String(id)) {
      found = { ...u, ...data };
      return found;
    }
    return u;
  });
  saveUsersList(updated);
  return found;
};

export const deleteUser = (id) => {
  const list = getUsersList();
  const updated = list.filter((u) => String(u.id) !== String(id));
  saveUsersList(updated);
  return true;
};

// --- STAFF STORAGE ---
export const getStaffList = () => {
  initMockStorage();
  return getItem(KEYS.STAFF, initialStaff);
};

export const saveStaffList = (list) => {
  setItem(KEYS.STAFF, list);
  return list;
};

export const addStaff = (data) => {
  const list = getStaffList();
  const newStaff = {
    id: data.id || Date.now(),
    nip: data.nip || `STF-${String(list.length + 1).padStart(3, '0')}`,
    nama: data.nama || data.name || 'Staff Baru',
    jabatan: data.jabatan || data.role || 'Kasir',
    noHp: data.noHp || data.no_hp || '0812-3456-7890',
    status: data.status || 'aktif',
    shift: data.shift || 'Pagi',
    email: data.email || '—',
    ...data,
  };
  const updated = [newStaff, ...list];
  saveStaffList(updated);
  return newStaff;
};

export const updateStaff = (id, data) => {
  const list = getStaffList();
  let found = null;
  const updated = list.map((s) => {
    if (String(s.id) === String(id)) {
      found = { ...s, ...data };
      return found;
    }
    return s;
  });
  saveStaffList(updated);
  return found;
};

export const deleteStaff = (id) => {
  const list = getStaffList();
  const updated = list.filter((s) => String(s.id) !== String(id));
  saveStaffList(updated);
  return true;
};

// --- TRANSACTIONS STORAGE ---
export const getTransactionsList = () => {
  initMockStorage();
  return getItem(KEYS.TRANSACTIONS, mockTransactions);
};

export const saveTransactionsList = (list) => {
  setItem(KEYS.TRANSACTIONS, list);
  return list;
};

export const addTransaction = (data) => {
  const list = getTransactionsList();
  const newTx = {
    id: data.id || Date.now(),
    tanggal: data.tanggal || new Date().toISOString().slice(0, 10),
    nis: data.nis || data.santri?.nis || '2024001',
    namaSantri: data.namaSantri || data.santri?.nama || 'Ahmad Fauzi',
    kategori: data.kategori || (data.tipe === 'topup' ? 'Top Up' : 'Penarikan Koin'),
    jenis: data.jenis || (data.tipe === 'topup' ? 'Masuk' : 'Keluar'),
    nominal: Number(data.nominal || 0),
    staff: data.staff || data.created_by?.name || 'Ust. Miftahul Huda',
    status: 'sukses',
    created_at: new Date().toISOString(),
    ...data,
  };
  const updated = [newTx, ...list];
  saveTransactionsList(updated);
  return newTx;
};

// Reset Helper
export const resetMockStorageToDefault = () => {
  setItem(KEYS.SANTRI, mockSantri);
  setItem(KEYS.USERS, mockUsers);
  setItem(KEYS.STAFF, initialStaff);
  setItem(KEYS.TRANSACTIONS, mockTransactions);
  setItem(KEYS.BNI_UPLOADS, []);
  localStorage.removeItem(KEYS.SALDOS);
  console.log('[mockStorage] Berhasil me-reset seluruh mock data ke default.');
};

// --- MOCK API DISPATCHER (Menjawab Request ketika API offline) ---
export const handleMockApi = async (endpoint, options = {}, formData = null) => {
  const method = (options.method || 'GET').toUpperCase();
  const path = endpoint.split('?')[0];
  const queryStr = endpoint.includes('?') ? endpoint.split('?')[1] : '';
  const params = new URLSearchParams(queryStr);

  let body = {};
  if (options.body) {
    try { body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body; } catch (_) {}
  } else if (formData && typeof formData.get === 'function') {
    formData.forEach((value, key) => { body[key] = value; });
  }

  console.info(`[Offline Mock API] Intercepting: ${method} ${path}`, { body, query: Object.fromEntries(params) });

  // 1. AUTH
  if (path === '/auth/login' && method === 'POST') {
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 1,
        nama: 'Ustadzah Ina Wahdiah',
        username: body.username || 'admin',
        role: body.username === 'staff' ? 'staff' : (body.username === 'wali' ? 'wali' : 'admin'),
        jabatan: body.username === 'staff' ? 'Kasir Rumah Koin' : (body.username === 'wali' ? 'Wali Santri' : 'Kabid BAK & Manajerial'),
      },
    };
  }
  if (path === '/auth/logout') return { message: 'Berhasil logout' };
  if (path === '/auth/me') {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : { id: 1, username: 'admin', role: 'admin' };
  }
  if (path === '/auth/change-password') {
    return { message: 'Password berhasil diubah' };
  }

  // 2. DASHBOARD
  if (path === '/dashboard') {
    const santriList = getSantriList();
    const txList = getTransactionsList();
    const totalSaldo = santriList.reduce((acc, s) => acc + (Number(s.saldo) || 0), 0);
    const totalTopUp = txList.filter(t => t.jenis === 'Masuk' || t.kategori === 'Top Up').reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);
    const totalPenarikan = txList.filter(t => t.jenis === 'Keluar' || t.kategori === 'Penarikan Koin').reduce((acc, t) => acc + (Number(t.nominal) || 0), 0);

    return {
      total_santri: santriList.length,
      santri_aktif: santriList.filter(s => (s.status || 'aktif') === 'aktif').length,
      total_saldo_mengendap: totalSaldo,
      total_topup: totalTopUp,
      total_penarikan: totalPenarikan,
      ringkasan_hari_ini: {
        total_transaksi: 12,
        total_nominal: 185000,
        santri_transaksi: 10,
        sisa_koin_hari_ini: 315000,
      },
      tren_transaksi: [
        { tanggal: new Date().toISOString().slice(0, 10), masuk: 450000, keluar: 185000 },
      ],
      transaksi_terbaru: txList.slice(0, 10).map(t => ({
        id: t.id,
        santri: { nama: t.namaSantri, nis: t.nis },
        tipe: t.jenis === 'Masuk' ? 'topup' : 'penarikan',
        nominal: t.nominal,
        created_at: t.tanggal ? `${t.tanggal}T08:00:00Z` : new Date().toISOString(),
      })),
    };
  }

  // 3. SANTRIS
  if (path === '/santris' && method === 'GET') {
    const list = getSantriList();
    return { data: list, total: list.length };
  }
  if (path === '/santris/by-nis') {
    const nis = params.get('nis');
    const list = getSantriList();
    const found = list.find(s => String(s.nis) === String(nis));
    if (!found) throw new Error('Santri tidak ditemukan');
    return { data: found };
  }
  if (path.startsWith('/santris/') && method === 'GET') {
    const id = path.split('/')[2];
    const list = getSantriList();
    const found = list.find(s => String(s.id) === String(id) || String(s.nis) === String(id));
    if (!found) throw new Error('Santri tidak ditemukan');
    return { data: found };
  }
  if (path === '/santris' && method === 'POST') {
    const created = addSantri(body);
    return { message: 'Santri berhasil ditambahkan', data: created };
  }
  if (path.startsWith('/santris/') && path.endsWith('/penyesuaian') && method === 'POST') {
    const id = path.split('/')[2];
    const santri = getSantriList().find(s => String(s.id) === String(id));
    if (santri) {
      const currentSaldo = Number(santri.saldo || 0);
      const nominal = Number(body.nominal || 0);
      const newSaldo = body.tipe === 'topup' ? currentSaldo + nominal : Math.max(0, currentSaldo - nominal);
      updateSantri(id, { saldo: newSaldo });
      addTransaction({
        nis: santri.nis,
        namaSantri: santri.nama,
        kategori: body.tipe === 'topup' ? 'Top Up' : 'Penarikan Koin',
        jenis: body.tipe === 'topup' ? 'Masuk' : 'Keluar',
        nominal: nominal,
        staff: 'Admin / Staff',
      });
      return { message: 'Penyesuaian saldo berhasil', saldo: newSaldo };
    }
    return { message: 'OK' };
  }
  if (path.startsWith('/santris/') && (method === 'POST' || method === 'PUT')) {
    const id = path.split('/')[2];
    const updated = updateSantri(id, body);
    return { message: 'Santri berhasil diperbarui', data: updated };
  }
  if (path.startsWith('/santris/') && method === 'DELETE') {
    const id = path.split('/')[2];
    deleteSantri(id);
    return { message: 'Santri berhasil dihapus' };
  }
  if (path === '/santris/import-preview') {
    return { preview: mockSantri.slice(0, 5) };
  }
  if (path === '/santris/import-confirm') {
    const items = body.items || [];
    items.forEach(it => addSantri(it));
    return { message: 'Import santri berhasil', count: items.length };
  }

  // 4. USERS (ADMIN, STAFF, WALI)
  if (path === '/admins' && method === 'GET') {
    const users = getUsersList().filter(u => u.role?.toLowerCase().includes('admin') || u.role?.toLowerCase().includes('kabid'));
    return { data: users, total: users.length };
  }
  if (path === '/admins' && method === 'POST') {
    const created = addUser({ ...body, role: body.role || 'Kabid BAK & Manajerial' });
    return { message: 'Admin berhasil ditambahkan', data: created };
  }
  if (path.startsWith('/admins/') && (method === 'PUT' || method === 'POST')) {
    const id = path.split('/')[2];
    const updated = updateUser(id, body);
    return { message: 'Admin berhasil diperbarui', data: updated };
  }
  if (path.startsWith('/admins/') && method === 'DELETE') {
    const id = path.split('/')[2];
    deleteUser(id);
    return { message: 'Admin berhasil dihapus' };
  }

  if (path === '/staff' && method === 'GET') {
    const staff = getStaffList();
    return { data: staff, total: staff.length };
  }
  if (path.startsWith('/staff/') && (method === 'PUT' || method === 'POST')) {
    const id = path.split('/')[2];
    const updated = updateStaff(id, body);
    return { message: 'Staff berhasil diperbarui', data: updated };
  }
  if (path.startsWith('/staff/') && method === 'DELETE') {
    const id = path.split('/')[2];
    deleteStaff(id);
    return { message: 'Staff berhasil dihapus' };
  }
  if (path === '/staff' && method === 'POST') {
    const created = addStaff(body);
    return { message: 'Staff berhasil ditambahkan', data: created };
  }

  if (path === '/wali-users' && method === 'GET') {
    const waliList = getUsersList().filter(u => u.role?.toLowerCase().includes('wali'));
    return { data: waliList, total: waliList.length };
  }
  if (path === '/wali-users' && method === 'POST') {
    const created = addUser({ ...body, role: body.role || 'Wali Santri / Wali' });
    return { message: 'Wali user berhasil ditambahkan', data: created };
  }
  if (path.startsWith('/wali-users/') && (method === 'PUT' || method === 'POST')) {
    const id = path.split('/')[2];
    const updated = updateUser(id, body);
    return { message: 'Wali user berhasil diperbarui', data: updated };
  }
  if (path.startsWith('/wali-users/') && method === 'DELETE') {
    const id = path.split('/')[2];
    deleteUser(id);
    return { message: 'Wali user berhasil dihapus' };
  }

  // 5. TRANSAKSI & PENARIKAN
  if (path === '/transactions') {
    const txList = getTransactionsList();
    return { data: txList, total: txList.length };
  }
  if (path === '/penarikan' && method === 'POST') {
    const santri = getSantriList().find(s => String(s.id) === String(body.santri_id) || String(s.nis) === String(body.santri_id));
    const nominal = Number(body.nominal || 0);
    if (santri) {
      const currentSaldo = Number(santri.saldo || 0);
      const newSaldo = Math.max(0, currentSaldo - nominal);
      updateSantri(santri.id, { saldo: newSaldo });
      const tx = addTransaction({
        nis: santri.nis,
        namaSantri: santri.nama,
        kategori: 'Penarikan Koin',
        jenis: 'Keluar',
        nominal: nominal,
        staff: body.staff || 'Ust. Miftahul Huda',
      });
      return {
        message: 'Penarikan koin berhasil',
        transaction: {
          id: tx.id,
          created_at: tx.tanggal ? `${tx.tanggal}T08:00:00Z` : new Date().toISOString(),
          santri: { nis: santri.nis, nama: santri.nama },
          tipe: 'penarikan',
          nominal: nominal,
          created_by: { name: tx.staff },
        },
        saldo_akhir: newSaldo,
      };
    }
    return { message: 'Penarikan koin berhasil' };
  }

  // 6. WALI PORTAL
  if (path === '/wali/dashboard') {
    const santriList = getSantriList();
    const selected = santriList[0] || {
      id: 1,
      nama: 'Ahmad Fauzi',
      nis: '2024001',
      kelas: 'VII A',
      saldo: 150000,
      va_jajan: '8808 0990 1234 5678',
    };
    return {
      santri_terpilih: {
        id: selected.id,
        nama: selected.nama,
        nis: selected.nis,
        kelas: selected.kelas,
        saldo: Number(selected.saldo || 0),
        va_jajan: selected.vaJajan || selected.va_jajan || '8808 0990 1234 5678',
      },
      statistik: {
        total_isi: 500000,
        total_tarik: 350000,
      },
    };
  }
  if (path === '/wali/transactions') {
    const txList = getTransactionsList();
    return { data: txList.slice(0, 15), total: txList.length };
  }

  // Fallback generic response
  return { message: 'Mock data OK', data: [] };
};
