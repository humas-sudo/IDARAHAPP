import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Key,
  Shield,
  History,
  Lock,
  CheckCircle2,
  XCircle,
  Building
} from 'lucide-react';
import { User, RoleId, MahadId } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';

interface UserManagementProps {
  currentUser: User;
  activeMahadId: MahadId;
  initialTab?: 'users' | 'roles' | 'audit' | 'organisasi';
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentUser,
  activeMahadId,
  initialTab = 'users'
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit' | 'organisasi'>(initialTab);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const users = db.getUsers();
  const roles = db.getRoles();
  const auditLogs = db.getAuditLogs();
  const units = db.getUnits();

  // User form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRoleId, setFormRoleId] = useState<RoleId>('admin_sekretariat');
  const [formScope, setFormScope] = useState<'mahad-banin' | 'mahad-banat' | 'all'>('mahad-banin');
  const [formTitle, setFormTitle] = useState('');
  const [formUnitId, setFormUnitId] = useState('');

  const filteredUsers = users.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.position_title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) {
      alert('Nama dan email wajib diisi.');
      return;
    }

    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: formName,
      email: formEmail,
      role_id: formRoleId,
      mahad_id: formScope,
      position_id: 'pos-' + Date.now(),
      position_title: formTitle || 'Staf Administrasi',
      unit_id: formUnitId || 'unit-sekretariat-banin',
      is_active: true
    };

    db.createUser(newUser, currentUser);
    setIsCreateOpen(false);
    setFormName('');
    setFormEmail('');
    setFormTitle('');
  };

  const handleToggleUserStatus = (u: User) => {
    if (u.id === currentUser.id) {
      alert('Anda tidak dapat menonaktifkan akun sendiri.');
      return;
    }

    db.updateUser(u.id, { is_active: !u.is_active }, currentUser);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0d5c3a]" />
            Manajemen Pengguna & Keamanan Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan akun staf, hak akses (RBAC/PBAC), lingkup Ma'had Lil Banin/Lil Banat, dan riwayat audit
          </p>
        </div>

        {activeTab === 'users' && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs self-start"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna Baru
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-[#0d5c3a] text-[#0d5c3a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          Daftar Akun Pengguna ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'border-[#0d5c3a] text-[#0d5c3a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Matriks Peran & Izin Akses (RBAC)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-[#0d5c3a] text-[#0d5c3a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          Log Audit Jejak Aktivitas ({auditLogs.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('organisasi')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'organisasi'
              ? 'border-[#0d5c3a] text-[#0d5c3a]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          Struktur Unit & Organisasi ({units.length})
        </button>
      </div>

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, email, jabatan..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Nama & Jabatan</th>
                  <th className="px-4 py-3">Email Pengguna</th>
                  <th className="px-4 py-3">Peran (Role)</th>
                  <th className="px-4 py-3">Lingkup Akses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.position_title}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full text-[11px]">
                        {roles.find(r => r.id === u.role_id)?.name || u.role_id}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.mahad_id === 'all'
                            ? 'bg-purple-100 text-purple-800'
                            : u.mahad_id === 'mahad-banat'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.mahad_id === 'all'
                          ? 'Lintas Ma’had (Semua)'
                          : u.mahad_id === 'mahad-banat'
                          ? 'Ma’had Banat Saja'
                          : 'Ma’had Banin Saja'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          u.is_active ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {u.is_active ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Nonaktif
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold ${
                            u.is_active
                              ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map(r => (
            <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-sm">{r.name}</h3>
                <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                  {r.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">{r.description}</p>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Daftar Hak Akses ({r.permissions.length}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {r.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="font-mono text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Riwayat Aktivitas & Perubahan Data (Audit Trail)</h3>
            <span className="text-xs text-slate-400">Total {auditLogs.length} rekaman jejak</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto text-xs">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">Belum ada rekaman jejak audit.</div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{log.user_name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400">Target: {log.entity} ({log.entity_id})</span>
                    </div>
                    <p className="text-slate-600 mt-1">{log.description}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORGANISASI & UNIT KERJA */}
      {activeTab === 'organisasi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ma'had Banin */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    Ma'had Lil Banin (Putra)
                  </h3>
                  <p className="text-[11px] text-slate-500">Unit kerja kepesantrenan santri putra UNIA</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                  {units.filter(u => u.mahad_id === 'mahad-banin').length} Unit
                </span>
              </div>

              <div className="space-y-2">
                {units
                  .filter(u => u.mahad_id === 'mahad-banin')
                  .map(unit => (
                    <div
                      key={unit.id}
                      className="p-3 rounded-lg border border-slate-100 hover:border-emerald-200 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{unit.name}</span>
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {unit.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{unit.description}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Pimpinan: <strong className="text-slate-700">{unit.head_name}</strong> ({unit.head_position})</span>
                        <span className={`px-1.5 py-0.5 rounded ${unit.is_reporting_unit ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          {unit.is_reporting_unit ? 'Unit Wajib Lapor' : 'Administrasi'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Ma'had Banat */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Ma'had Lil Banat (Putri)
                  </h3>
                  <p className="text-[11px] text-slate-500">Unit kerja kepesantrenan santriwati putri UNIA</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-bold">
                  {units.filter(u => u.mahad_id === 'mahad-banat').length} Unit
                </span>
              </div>

              <div className="space-y-2">
                {units
                  .filter(u => u.mahad_id === 'mahad-banat')
                  .map(unit => (
                    <div
                      key={unit.id}
                      className="p-3 rounded-lg border border-slate-100 hover:border-rose-200 bg-slate-50/50 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{unit.name}</span>
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                          {unit.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">{unit.description}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Pimpinan: <strong className="text-slate-700">{unit.head_name}</strong> ({unit.head_position})</span>
                        <span className={`px-1.5 py-0.5 rounded ${unit.is_reporting_unit ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          {unit.is_reporting_unit ? 'Unit Wajib Lapor' : 'Administrasi'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tambah Akun Pengguna Baru"
        subtitle="Registrasi kredensial staf dan penetapan hak akses"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
              <input
                type="text"
                required
                placeholder="cth: Ust. Ahmad Fauzi, S.Pd."
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Email Resmi *</label>
              <input
                type="email"
                required
                placeholder="cth: fauzi@unia.ac.id"
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peran Akses (Role)</label>
              <select
                value={formRoleId}
                onChange={e => setFormRoleId(e.target.value as RoleId)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lingkup Akses Ma'had</label>
              <select
                value={formScope}
                onChange={e => setFormScope(e.target.value as 'mahad-banin' | 'mahad-banat' | 'all')}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="mahad-banin">Ma’had Putra (Lil Banin) Saja</option>
                <option value="mahad-banat">Ma’had Putri (Lil Banat) Saja</option>
                <option value="all">Semua Ma’had (Akses Pimpinan/Super Admin)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Jabatan / Posisi</label>
              <input
                type="text"
                placeholder="cth: Staf Administrasi & Tata Usaha"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Kerja Terkait (Opsional)</label>
              <select
                value={formUnitId}
                onChange={e => setFormUnitId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Pilih Unit Kerja --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg shadow-xs"
            >
              Daftarkan Pengguna
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
