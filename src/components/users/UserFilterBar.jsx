import React from 'react';

// Filter Bar Pengguna: Search Input, Role Dropdown, Status Dropdown, dan Tombol + Tambah Pengguna
const UserFilterBar = ({
  search = '',
  onSearchChange,
  role = 'Semua Role',
  onRoleChange,
  status = 'Semua Status',
  onStatusChange,
  onAddUser,
}) => {
  return (
    <div className="user-filter-card">
      <div className="user-filter-wrapper">
        {/* Search Input */}
        <div className="user-search-field">
          <input
            type="text"
            placeholder="Cari nama, username, atau NIS..."
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="user-search-input"
          />
        </div>

        {/* Role Dropdown */}
        <div className="user-select-field">
          <select
            value={role}
            onChange={(e) => onRoleChange?.(e.target.value)}
            className="user-filter-select"
          >
            <option value="Semua Role">Semua Role</option>
            <option value="Kabid BAK & Manajerial">Kabid BAK &amp; Manajerial</option>
            <option value="Staff Rumah Koin">Staff Rumah Koin</option>
            <option value="Wali Santri / Wali">Wali Santri / Wali</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="user-select-field">
          <select
            value={status}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="user-filter-select"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
        </div>

        {/* Tombol + Tambah Pengguna */}
        <button
          type="button"
          onClick={onAddUser}
          className="btn-add-user"
        >
          <span className="text-lg leading-none mr-1.5">+</span>
          Tambah Pengguna
        </button>
      </div>
    </div>
  );
};

export default UserFilterBar;
