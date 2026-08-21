const BASE_URL = import.meta.env.VITE_API_URL || 'https://nata-api.islab.web.id/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

async function apiFetch(endpoint, options = {}) {
  const isBlob = options._blob;
  const opts = { ...options };
  delete opts._blob;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
    ...opts,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan.' }));
    throw new Error(err.message || 'Request gagal.');
  }

  if (isBlob) return res.blob();
  return res.json();
}

async function apiFetchForm(endpoint, formData, method = 'POST') {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan.' }));
    throw new Error(err.message || 'Request gagal.');
  }

  return res.json();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const authApi = {
  login: (data) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
  me: () => apiFetch('/auth/me'),
  changePassword: (data) => apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify(data) }),
};

export const dashboardApi = {
  get: (params = {}) => apiFetch('/dashboard?' + new URLSearchParams(params)),
};

export const santriApi = {
  list: (params = {}) => apiFetch('/santris?' + new URLSearchParams(params)),
  byNis: (nis) => apiFetch(`/santris/by-nis?nis=${nis}`),
  show: (id) => apiFetch(`/santris/${id}`),
  mutasi: (id) => apiFetch(`/santris/${id}/mutasi`),
  store: (formData) => apiFetchForm('/santris', formData, 'POST'),
  update: (id, formData) => apiFetchForm(`/santris/${id}`, formData, 'POST'),
  destroy: (id) => apiFetch(`/santris/${id}`, { method: 'DELETE' }),
  import: (formData) => apiFetchForm('/santris/import', formData, 'POST'),
  importPreview: (formData) => apiFetchForm('/santris/import-preview', formData, 'POST'),
  importConfirm: (items) => apiFetch('/santris/import-confirm', { method: 'POST', body: JSON.stringify({ items }) }),
  penyesuaian: (id, data) => apiFetch(`/santris/${id}/penyesuaian`, { method: 'POST', body: JSON.stringify(data) }),
};

export const staffApi = {
  list: (params = {}) => apiFetch('/staff?' + new URLSearchParams(params)),
  store: (data) => apiFetch('/staff', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  destroy: (id) => apiFetch(`/staff/${id}`, { method: 'DELETE' }),
};

export const adminApi = {
  list: (params = {}) => apiFetch('/admins?' + new URLSearchParams(params)),
  store: (data) => apiFetch('/admins', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  destroy: (id) => apiFetch(`/admins/${id}`, { method: 'DELETE' }),
};

export const waliUserApi = {
  list: (params = {}) => apiFetch('/wali-users?' + new URLSearchParams(params)),
  store: (data) => apiFetch('/wali-users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/wali-users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  destroy: (id) => apiFetch(`/wali-users/${id}`, { method: 'DELETE' }),
  linkSantri: (userId, santriId) => apiFetch(`/wali-users/${userId}/santri/${santriId}`, { method: 'POST' }),
  unlinkSantri: (userId, santriId) => apiFetch(`/wali-users/${userId}/santri/${santriId}`, { method: 'DELETE' }),
};

export const penarikanApi = {
  store: (data) => apiFetch('/penarikan', { method: 'POST', body: JSON.stringify(data) }),
};

export const bniApi = {
  list: () => apiFetch('/bni-uploads'),
  store: (formData) => apiFetchForm('/bni-uploads', formData, 'POST'),
  show: (id) => apiFetch(`/bni-uploads/${id}`),
  apply: (id, itemIds = null) => apiFetch(`/bni-uploads/${id}/apply`, {
    method: 'POST',
    body: itemIds ? JSON.stringify({ item_ids: itemIds }) : JSON.stringify({})
  }),
  updateItem: (uploadId, itemId, data) => apiFetch(`/bni-uploads/${uploadId}/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteItem: (uploadId, itemId) => apiFetch(`/bni-uploads/${uploadId}/items/${itemId}`, {
    method: 'DELETE',
  }),
};

export const transactionApi = {
  list: (params = {}) => apiFetch('/transactions?' + new URLSearchParams(params)),
  show: (id) => apiFetch(`/transactions/${id}`),
  export: async (params = {}) => {
    const blob = await apiFetch('/transactions/export?' + new URLSearchParams(params), { _blob: true });
    downloadBlob(blob, `transaksi-${new Date().toISOString().slice(0, 10)}.xlsx`);
  },
};

export const reportApi = {
  financial: (bulan) => apiFetch(`/reports/financial?bulan=${bulan}`),
  summary: () => apiFetch('/reports/financial/summary'),
  export: async (bulan) => {
    const blob = await apiFetch(`/reports/financial/export?bulan=${bulan}`, { _blob: true });
    downloadBlob(blob, `laporan-${bulan}.xlsx`);
  },
};

export const waliApi = {
  dashboard: (santriId) => apiFetch('/wali/dashboard' + (santriId ? `?santri_id=${santriId}` : '')),
  transactions: (params = {}) => apiFetch('/wali/transactions?' + new URLSearchParams(params)),
  export: async (params = {}) => {
    const blob = await apiFetch('/wali/transactions/export?' + new URLSearchParams(params), { _blob: true });
    downloadBlob(blob, 'riwayat-transaksi.xlsx');
  },
};
