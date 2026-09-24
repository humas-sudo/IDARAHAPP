import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Clock,
  MapPin,
  Users,
  Download,
  Printer,
  Eye,
  CheckCircle
} from 'lucide-react';
import { Agenda, AgendaType, AgendaStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface AgendaSekretariatProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const AgendaSekretariat: React.FC<AgendaSekretariatProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailAgenda, setDetailAgenda] = useState<Agenda | null>(null);

  const agendas = db.getAgendas(activeMahadId);
  const canCreate = auth.hasPermission('agendas.manage');

  const [formJudul, setFormJudul] = useState('');
  const [formJenis, setFormJenis] = useState<AgendaType>('Rapat');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formWaktuMulai, setFormWaktuMulai] = useState('08:00');
  const [formWaktuSelesai, setFormWaktuSelesai] = useState('11:00');
  const [formTempat, setFormTempat] = useState('Ruang Rapat Utama Sekretariat Ma’had');
  const [formPenanggungJawab, setFormPenanggungJawab] = useState('Sekretariat Ma’had');
  const [formPeserta, setFormPeserta] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  const filtered = agendas.filter(a => {
    const matchSearch =
      a.judul.toLowerCase().includes(search.toLowerCase()) ||
      a.tempat.toLowerCase().includes(search.toLowerCase()) ||
      a.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || a.jenis === filterType;
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul || !formTempat) {
      alert('Judul dan tempat wajib diisi.');
      return;
    }

    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;

    db.createAgenda(
      {
        mahad_id: targetMahad,
        judul: formJudul,
        jenis: formJenis,
        tanggal: formTanggal,
        waktu_mulai: formWaktuMulai,
        waktu_selesai: formWaktuSelesai,
        tempat: formTempat,
        penanggung_jawab: formPenanggungJawab,
        peserta: formPeserta,
        deskripsi: formDeskripsi,
        reminder_days: 1,
        status: 'Direncanakan',
        created_by: currentUser.id
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormJudul('');
    setFormDeskripsi('');
    setFormPeserta('');
  };

  const handleUpdateStatus = (agendaId: string, newStatus: AgendaStatus) => {
    db.updateAgenda(agendaId, { status: newStatus }, currentUser);
    if (detailAgenda && detailAgenda.id === agendaId) {
      setDetailAgenda({ ...detailAgenda, status: newStatus });
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Agenda_Sekretariat_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(a => ({
        Judul: a.judul,
        Jenis: a.jenis,
        Tanggal: a.tanggal,
        Waktu: `${a.waktu_mulai} - ${a.waktu_selesai}`,
        Tempat: a.tempat,
        'Penanggung Jawab': a.penanggung_jawab,
        Peserta: a.peserta,
        Status: a.status
      }))
    );
  };

  const handlePrint = () => {
    printDocument({
      title: 'JADWAL AGENDA & KEGIATAN KEPESANTRENAN',
      mahadName: activeMahadId === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      period: `Per Tanggal ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 8px; border: 1px solid #333;">Tanggal & Waktu</th>
              <th style="padding: 8px; border: 1px solid #333;">Nama Agenda / Acara</th>
              <th style="padding: 8px; border: 1px solid #333;">Tempat</th>
              <th style="padding: 8px; border: 1px solid #333;">Peserta</th>
              <th style="padding: 8px; border: 1px solid #333;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                a => `
              <tr>
                <td style="padding: 8px; border: 1px solid #333; white-space: nowrap;">
                  ${a.tanggal}<br><small>${a.waktu_mulai} - ${a.waktu_selesai} WIB</small>
                </td>
                <td style="padding: 8px; border: 1px solid #333;">
                  <strong>${a.judul}</strong><br>
                  <small style="color: #666;">${a.deskripsi || ''}</small>
                </td>
                <td style="padding: 8px; border: 1px solid #333;">${a.tempat}</td>
                <td style="padding: 8px; border: 1px solid #333;">${a.peserta || '-'}</td>
                <td style="padding: 8px; border: 1px solid #333;">${a.status}</td>
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
            <CalendarDays className="w-6 h-6 text-[#0d5c3a]" />
            Agenda & Kegiatan Sekretariat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jadwal kegiatan resmi, rapat pimpinan, audiensi, dan kalender kegiatan Ma'had UNIA
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
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Jadwal
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Jadwalkan Agenda
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari agenda, lokasi, keterangan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          >
            <option value="all">Semua Jenis Agenda</option>
            <option value="Rapat">Rapat</option>
            <option value="Pertemuan">Pertemuan</option>
            <option value="Kegiatan">Kegiatan</option>
            <option value="Deadline">Deadline</option>
            <option value="Penerimaan Tamu">Penerimaan Tamu</option>
            <option value="Agenda Surat">Agenda Surat</option>
            <option value="Agenda Administrasi">Agenda Administrasi</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          >
            <option value="all">Semua Status</option>
            <option value="Direncanakan">Direncanakan</option>
            <option value="Berlangsung">Berlangsung</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditunda">Ditunda</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={CalendarDays}
              title="Belum ada agenda"
              description="Belum ada agenda atau kegiatan pimpinan yang terdaftar."
            />
          </div>
        ) : (
          filtered.map(ag => (
            <div
              key={ag.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#0d5c3a] border border-emerald-200">
                    {ag.jenis}
                  </span>
                  <StatusBadge status={ag.status} size="sm" />
                </div>

                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2">{ag.judul}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{ag.deskripsi}</p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{ag.tanggal}</span>
                  <span className="text-slate-400">({ag.waktu_mulai} - {ag.waktu_selesai} WIB)</span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{ag.tempat}</span>
                </div>

                {ag.peserta && (
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px] text-slate-500">{ag.peserta}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDetailAgenda(ag)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    Detail
                  </button>
                  {ag.status === 'Direncanakan' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(ag.id, 'Selesai')}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg"
                    >
                      Tandai Selesai
                    </button>
                  )}
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
        title="Jadwalkan Agenda Baru"
        subtitle="Tambahkan agenda pimpinan atau kegiatan ma'had"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama / Judul Agenda *</label>
            <input
              type="text"
              required
              value={formJudul}
              onChange={e => setFormJudul(e.target.value)}
              placeholder="cth: Rapat Pleno Koordinasi Awal Semester"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Agenda</label>
              <select
                value={formJenis}
                onChange={e => setFormJenis(e.target.value as AgendaType)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Rapat">Rapat</option>
                <option value="Pertemuan">Pertemuan</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Deadline">Deadline</option>
                <option value="Penerimaan Tamu">Penerimaan Tamu</option>
                <option value="Agenda Surat">Agenda Surat</option>
                <option value="Agenda Administrasi">Agenda Administrasi</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={formTanggal}
                onChange={e => setFormTanggal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
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
            <label className="block font-semibold text-slate-700 mb-1">Lokasi / Tempat *</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab / Penyelenggara</label>
              <input
                type="text"
                value={formPenanggungJawab}
                onChange={e => setFormPenanggungJawab(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Peserta Target / Tamu</label>
              <input
                type="text"
                placeholder="cth: Seluruh Kepala Biro & Pembina"
                value={formPeserta}
                onChange={e => setFormPeserta(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Catatan Tambahan</label>
            <textarea
              rows={3}
              placeholder="Catatan rincian keperluan agenda..."
              value={formDeskripsi}
              onChange={e => setFormDeskripsi(e.target.value)}
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
              Simpan Jadwal Agenda
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailAgenda}
        onClose={() => setDetailAgenda(null)}
        title="Rincian Jadwal Agenda"
        subtitle={detailAgenda?.judul}
        maxWidth="md"
      >
        {detailAgenda && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800">{detailAgenda.jenis}</span>
              <StatusBadge status={detailAgenda.status} />
            </div>

            <div className="space-y-2 text-slate-700">
              <p><strong className="text-slate-900">Tanggal:</strong> {detailAgenda.tanggal}</p>
              <p><strong className="text-slate-900">Waktu:</strong> {detailAgenda.waktu_mulai} - {detailAgenda.waktu_selesai} WIB</p>
              <p><strong className="text-slate-900">Tempat:</strong> {detailAgenda.tempat}</p>
              <p><strong className="text-slate-900">Peserta:</strong> {detailAgenda.peserta || '-'}</p>
              <p><strong className="text-slate-900">Penanggung Jawab:</strong> {detailAgenda.penanggung_jawab}</p>
            </div>

            {detailAgenda.deskripsi && (
              <div>
                <span className="font-bold text-slate-900 block mb-1">Deskripsi:</span>
                <p className="p-3 bg-slate-50 rounded border border-slate-200 text-slate-800 whitespace-pre-line">
                  {detailAgenda.deskripsi}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
