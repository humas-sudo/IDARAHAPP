import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  Building
} from 'lucide-react';
import { AdministrativeRequest, RequestStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';

interface PermohonanAdministrasiProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const PermohonanAdministrasi: React.FC<PermohonanAdministrasiProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailReq, setDetailReq] = useState<AdministrativeRequest | null>(null);

  const requests = db.getRequests(activeMahadId);
  const units = db.getUnits(activeMahadId === 'all' ? undefined : activeMahadId);
  const canApprove =
    currentUser.role_id === 'super_admin' ||
    currentUser.role_id === 'admin_sekretariat' ||
    currentUser.role_id === 'validator_mudir';

  const [formJenis, setFormJenis] = useState('Permohonan Nomor Surat');
  const [formKeperluan, setFormKeperluan] = useState('');
  const [formCatatan, setFormCatatan] = useState('');

  const filtered = requests.filter((r: AdministrativeRequest) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.keperluan.toLowerCase().includes(search.toLowerCase()) ||
      r.unit_name.toLowerCase().includes(search.toLowerCase()) ||
      r.pemohon_name.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || r.jenis_permohonan === filterType;
    return matchSearch && matchType;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeperluan) {
      alert('Rincian permohonan / keperluan wajib diisi.');
      return;
    }

    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;
    const userUnit = db.getUnitById(currentUser.unit_id);

    db.createRequest(
      {
        mahad_id: targetMahad,
        jenis_permohonan: formJenis,
        unit_id: currentUser.unit_id || 'unit-sekretariat-banin',
        unit_name: userUnit?.name || currentUser.position_title,
        pemohon_name: currentUser.name,
        keperluan: formKeperluan,
        tanggal: new Date().toISOString().split('T')[0],
        penanggung_jawab: userUnit?.head_name || 'Kepala Bagian',
        status: 'Diajukan'
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormKeperluan('');
  };

  const handleUpdateStatus = (reqId: string, newStatus: RequestStatus, catatanRespon: string) => {
    const updated = db.updateRequest(
      reqId,
      {
        status: newStatus,
        catatan_petugas: catatanRespon
      },
      currentUser
    );

    if (detailReq && detailReq.id === reqId && updated) {
      setDetailReq(updated);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-[#0d5c3a]" />
            Permohonan Layanan Administrasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengajuan nomor dinas, penerbitan SK kepengurusan, legalisir dokumen, dan izin kegiatan dari unit
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs self-start"
        >
          <Plus className="w-4 h-4" />
          Ajukan Permohonan
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari ID, keperluan, atau unit pengaju..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
        >
          <option value="all">Semua Jenis Layanan</option>
          <option value="Permohonan Nomor Surat">Permohonan Nomor Surat</option>
          <option value="Penerbitan SK">Penerbitan SK Baru</option>
          <option value="Legalisir">Legalisir Dokumen</option>
          <option value="Surat Keterangan Aktif">Surat Keterangan Aktif</option>
          <option value="Izin Kegiatan">Izin Kegiatan Santri</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Tiket & Tanggal</th>
                <th className="px-4 py-3">Jenis Layanan</th>
                <th className="px-4 py-3">Keperluan / Perihal</th>
                <th className="px-4 py-3">Unit Pemohon</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      icon={FileQuestion}
                      title="Belum ada permohonan layanan"
                      description="Unit kerja dapat mengajukan layanan administrasi seperti permohonan nomor surat atau SK melalui tombol di atas."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((req: AdministrativeRequest) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800">{req.id}</span>
                      <div className="text-[10px] text-slate-400">{req.tanggal}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {req.jenis_permohonan}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-slate-800 line-clamp-2">{req.keperluan}</div>
                      {req.catatan_petugas && (
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Respon: {req.catatan_petugas}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{req.unit_name}</div>
                      <div className="text-[10px] text-slate-400">Oleh: {req.pemohon_name}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setDetailReq(req);
                          setFormCatatan(req.catatan_petugas || '');
                        }}
                        className="px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded"
                      >
                        Periksa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Ajukan Permohonan Layanan Administrasi"
        subtitle="Diteruskan kepada Sekretariat dan Pimpinan Ma’had UNIA"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Layanan Administrasi *</label>
            <select
              value={formJenis}
              onChange={e => setFormJenis(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Permohonan Nomor Surat">Permohonan Nomor Surat Dinas</option>
              <option value="Penerbitan SK">Penerbitan SK Kepengurusan / Keputusan</option>
              <option value="Legalisir">Legalisir Berkas / Ijazah / Sertifikat</option>
              <option value="Surat Keterangan Aktif">Surat Keterangan Aktif Mengajar / Belajar</option>
              <option value="Izin Kegiatan">Pengajuan Izin Kegiatan</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rincian / Keperluan Permohonan *</label>
            <textarea
              rows={4}
              required
              placeholder="Uraikan detail keperluan, tanggal penggunaan, dan tujuan dokumen secara lengkap..."
              value={formKeperluan}
              onChange={e => setFormKeperluan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
            />
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
              Kirim Permohonan
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL & APPROVAL MODAL */}
      <Modal
        isOpen={!!detailReq}
        onClose={() => setDetailReq(null)}
        title="Pemeriksaan Permohonan Administrasi"
        subtitle={detailReq?.id}
        maxWidth="lg"
      >
        {detailReq && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800">{detailReq.jenis_permohonan}</span>
                <StatusBadge status={detailReq.status} />
              </div>
              <div className="mt-2 text-slate-600">
                <span>Unit: {detailReq.unit_name}</span> • <span>Pemohon: {detailReq.pemohon_name}</span> • <span>Tanggal: {detailReq.tanggal}</span>
              </div>
            </div>

            <div>
              <strong className="text-slate-800 block mb-1">Rincian Keperluan:</strong>
              <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                {detailReq.keperluan}
              </p>
            </div>

            {canApprove && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block font-semibold text-slate-800">
                  Catatan Respon Petugas Sekretariat:
                </label>
                <input
                  type="text"
                  placeholder="cth: Nomor surat diberikan: 104/MHD-LBN/UNIA/IX/2026 atau berkas disetujui"
                  value={formCatatan}
                  onChange={e => setFormCatatan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailReq.id, 'Ditolak', formCatatan || 'Permohonan belum memenuhi syarat')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg flex items-center gap-1"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak Permohonan
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailReq.id, 'Diproses', formCatatan || 'Sedang diverifikasi sekretariat')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
                  >
                    Proses
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailReq.id, 'Disetujui', formCatatan || 'Layanan telah diselesaikan')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Setujui & Selesaikan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
