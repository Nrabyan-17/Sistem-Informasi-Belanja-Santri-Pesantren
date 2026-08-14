import React, { useState } from 'react';

// Tabel Daftar Pengguna Sistem
const UserTable = ({
  data = [],
  totalCount = 7,
  activeCount = 6,
  nonactiveCount = 1,
  onEdit,
  onDelete,
}) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((d) => d.id));
    }
  };

  const toggleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="user-table-card">
      <div className="user-table-header">
        <h3 className="user-table-title">Daftar Pengguna Sistem</h3>
        <p className="user-table-subtitle">{data.length} pengguna ditampilkan</p>
      </div>

      <div className="user-table-wrapper overflow-x-auto">
        <table className="user-table w-full">
          <thead>
            <tr>
              <th className="w-10 text-center">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleSelectAll}
                  className="user-checkbox"
                />
              </th>
              <th className="text-left">PENGGUNA</th>
              <th className="text-left">ROLE</th>
              <th className="text-left">STATUS</th>
              <th className="text-left">LOGIN TERAKHIR</th>
              <th className="text-left">SANTRI / NIS</th>
              <th className="text-center">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-400 font-medium">
                  Tidak ada pengguna yang sesuai filter.
                </td>
              </tr>
            ) : (
              data.map((user) => {
                const isChecked = selectedIds.includes(user.id);
                return (
                  <tr key={user.id} className="user-table-row">
                    <td className="text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectRow(user.id)}
                        className="user-checkbox"
                      />
                    </td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {user.nama}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          @{user.username}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'Kabid BAK & Manajerial'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : user.role === 'Staff Rumah Koin'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          user.status === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        <span className="mr-1">{user.status === 'Aktif' ? '●' : '○'}</span>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                      {user.loginTerakhir}
                    </td>
                    <td className="text-slate-400 font-mono text-sm">
                      {user.nis}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => onEdit?.(user)}
                          className="btn-edit-user cursor-pointer"
                        >
                          Edit
                        </button>
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete?.(user)}
                            className="btn-delete-user cursor-pointer"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="user-table-footer">
        <span className="text-xs font-semibold text-slate-400">
          {data.length} dari {totalCount} pengguna &middot; {activeCount} aktif &middot; {nonactiveCount} nonaktif
        </span>
      </div>
    </div>
  );
};

export default UserTable;
