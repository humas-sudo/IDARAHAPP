import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ListTodo,
  Download,
  Printer,
  Eye
} from 'lucide-react';
import { Meeting, MeetingStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface DataRapatProps {
  currentUser: User;
  activeMahadId: MahadId;
  onNavigateToNotulensi: (meetingId: string) => void;
  onNavigateToRekomendasi: (meetingId: string) => void;
}

export const DataRapat: React.FC<DataRapatProps> = ({
  currentUser,
  activeMahadId,
  onNavigateToNotulensi,
  onNavigateToRekomendasi
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const meetings = db.getMeetings(activeMahadId);
  const canCreate = auth.hasPermission('meetings.manage');

  const [formJudul, setFormJudul] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formWaktuMulai, setFormWaktuMulai] = useState('09:00');
  const [formWaktuSelesai, setFormWaktuSelesai] = useState('11:30');
  const [formTempat, setFormTempat] = useState('Ruang Sidang Ma’had UNIA');
  const [formPimpinan, setFormPimpinan] = useState(
    activeMahadId === 'mahad-banat'
      ? "Nyai Hj. Nurul Hidayah, M.A (Mudir Ma'had Lil Banat)"
      : "K.H. Moh. Khoirul Umam, M.Pd.I (Mudir Ma'had Lil Banin)"
  );
  const [formNotulis, setFormNotulis] = useState(currentUser.name);
  const [formAgenda, setFormAgenda] = useState('');
  const [formPeserta, setFormPeserta] = useState('Mudir, Sekretaris, Seluruh Kepala Biro/Unit');

  const filtered = meetings.filter(m => {
    const matchSearch =
      m.judul_rapat.toLowerCase().includes(search.toLowerCase()) ||
      m.agenda.toLowerCase().includes(search.toLowerCase()) ||
      m.pimpinan_rapat.toLowerCase().includes(search.toLowerCase()) ||
      m.sekretaris_notulis.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul || !formAgenda) {
      alert('Judul rapat dan poin agenda wajib diisi.');
      return;
    }

    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;

    db.createMeeting(
      {
        mahad_id: targetMahad,
        judul_rapat: formJudul,
        tanggal: formTanggal,
        waktu_mulai: formWaktuMulai,
        waktu_selesai: formWaktuSelesai,
        tempat: formTempat,
        pimpinan_rapat: formPimpinan,
        sekretaris_notulis: formNotulis,
        agenda: formAgenda,
        peserta: formPeserta.split(',').map(p => p.trim()).filter(Boolean),
        status: 'Direncanakan',
        has_minute: false
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormJudul('');
    setFormAgenda('');
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Data_Rapat_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(m => ({
        'Judul Rapat': m.judul_rapat,
        Tanggal: m.tanggal,
        Waktu: `${m.waktu_mulai} - ${m.waktu_selesai}`,
        Tempat: m.tempat,
        'Pimpinan Rapat': m.pimpinan_rapat,
        Notulis: m.sekretaris_notulis,
        Status: m.status,
        'Ada Notulensi': m.has_minute ? 'Ya' : 'Belum'
      }))
    );
  };

  const handlePrintDaftarHadir = (m: Meeting) => {
    printDocument({
      title: `DAFTAR HADIR RAPAT KOORDINASI`,
      documentNumber: `RPT-${m.tanggal}-${m.id}`,
      period: `${m.judul_rapat}`,
      mahadName: m.mahad_id === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      date: m.tanggal,
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; padding: 6px; border: 1px solid #cbd5e1;">Hari / Tanggal</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.tanggal}</td>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; padding: 6px; border: 1px solid #cbd5e1;">Waktu</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.waktu_mulai} - ${m.waktu_selesai} WIB</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc; padding: 6px; border: 1px solid #cbd5e1;">Tempat</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.tempat}</td>
            <td style="font-weight: bold; background: #f8fafc; padding: 6px; border: 1px solid #cbd5e1;">Pimpinan Rapat</td>
            <td style="padding: 6px; border: 1px solid #cbd5e1;">${m.pimpinan_rapat}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc; padding: 6px; border: 1px solid #cbd5e1;">Agenda</td>
            <td colspan="3" style="padding: 6px; border: 1px solid #cbd5e1;">${m.agenda}</td>
          </tr>
        </table>

        <h4 style="margin: 15px 0 10px 0; text-align: center;">PRESENSI KEHADIRAN PESERTA RAPAT</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="width: 8%; text-align: center; padding: 8px; border: 1px solid #94a3b8;">No.</th>
              <th style="width: 42%; padding: 8px; border: 1px solid #94a3b8;">Nama Lengkap & Gelar</th>
              <th style="width: 30%; padding: 8px; border: 1px solid #94a3b8;">Jabatan / Unit Kerja</th>
              <th style="width: 20%; text-align: center; padding: 8px; border: 1px solid #94a3b8;">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            ${(m.peserta && m.peserta.length > 0 ? m.peserta : ['Mudir Ma’had', 'Sekretaris', 'Kepala Biro Pengasuhan', 'Kepala Biro Ta’lim', 'Kepala Biro Keuangan', 'Koordinator Asrama', 'Koordinator Disiplin'])
              .map(
                (p, idx) => `
              <tr>
                <td style="text-align: center; height: 35px; border: 1px solid #cbd5e1;">${idx + 1}.</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">${p}</td>
                <td style="padding: 6px; border: 1px solid #cbd5e1;">Utusan Unit Terkait</td>
                <td style="border: 1px solid #cbd5e1;"></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0d5c3a]" />
            Data Rapat Kepesantrenan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen rapat koordinasi, evaluasi berkala, presensi kehadiran, notulensi, dan rekomendasi
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Jadwalkan Rapat
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul rapat, agenda, pimpinan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
        >
          <option value="all">Semua Status Rapat</option>
          <option value="Direncanakan">Direncanakan</option>
          <option value="Berlangsung">Berlangsung</option>
          <option value="Selesai">Selesai</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
      </div>

      {/* Grid of Meetings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Users}
              title="Belum ada data rapat"
              description="Jadwalkan rapat koordinasi melalui tombol di atas untuk mencatat presensi dan notulensi."
            />
          </div>
        ) : (
          filtered.map(meeting => (
            <div
              key={meeting.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {meeting.has_minute ? 'Notulensi Terisi' : 'Belum Ada Notulensi'}
                  </span>
                  <StatusBadge status={meeting.status} size="sm" />
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-1">{meeting.judul_rapat}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  <strong>Agenda:</strong> {meeting.agenda}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meeting.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{meeting.waktu_mulai} - {meeting.waktu_selesai} WIB</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{meeting.tempat}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Pimpinan: <strong>{meeting.pimpinan_rapat}</strong>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePrintDaftarHadir(meeting)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                    title="Cetak Daftar Hadir"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToNotulensi(meeting.id)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Notulensi
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateToRekomendasi(meeting.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg flex items-center gap-1"
                  >
                    <ListTodo className="w-3.5 h-3.5" />
                    Rekomendasi
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Jadwalkan Rapat Kepesantrenan"
        subtitle="Musyawarah pimpinan dan evaluasi berkala Ma’had UNIA"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul / Nama Rapat *</label>
            <input
              type="text"
              required
              placeholder="cth: Rapat Koordinasi Mingguan Evaluasi Disiplin Santri"
              value={formJudul}
              onChange={e => setFormJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan *</label>
            <input
              type="date"
              required
              value={formTanggal}
              onChange={e => setFormTanggal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Mulai</label>
              <input
                type="time"
                value={formWaktuMulai}
                onChange={e => setFormWaktuMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu Selesai</label>
              <input
                type="time"
                value={formWaktuSelesai}
                onChange={e => setFormWaktuSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lokasi / Tempat Rapat *</label>
            <input
              type="text"
              required
              value={formTempat}
              onChange={e => setFormTempat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pimpinan Rapat *</label>
              <input
                type="text"
                required
                value={formPimpinan}
                onChange={e => setFormPimpinan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sekretaris / Notulis *</label>
              <input
                type="text"
                required
                value={formNotulis}
                onChange={e => setFormNotulis(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Agenda Pembahasan *</label>
            <textarea
              rows={3}
              required
              placeholder="Tuliskan pokok agenda pembahasan yang akan dibahas..."
              value={formAgenda}
              onChange={e => setFormAgenda(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Daftar Peserta Undangan (Pisahkan koma)</label>
            <input
              type="text"
              value={formPeserta}
              onChange={e => setFormPeserta(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
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
              Simpan Jadwal Rapat
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
