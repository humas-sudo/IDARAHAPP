import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Search,
  Download,
  Printer,
  TrendingUp,
  Eye,
  AlertCircle
} from 'lucide-react';
import {
  MeetingRecommendation,
  RecommendationPriority,
  RecommendationStatus,
  MahadId,
  User
} from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge, PriorityBadge, DeadlineIndicator } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface RekomendasiRapatProps {
  currentUser: User;
  activeMahadId: MahadId;
  initialMeetingId?: string;
  onNavigateToMonitoring: () => void;
}

export const RekomendasiRapat: React.FC<RekomendasiRapatProps> = ({
  currentUser,
  activeMahadId,
  initialMeetingId,
  onNavigateToMonitoring
}) => {
  const [search, setSearch] = useState('');
  const [filterMeeting, setFilterMeeting] = useState<string>(initialMeetingId || 'all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailRec, setDetailRec] = useState<MeetingRecommendation | null>(null);

  const recommendations = db.getRecommendations(activeMahadId);
  const meetings = db.getMeetings(activeMahadId);
  const units = db.getUnits(activeMahadId === 'all' ? undefined : activeMahadId);
  const canCreate = auth.hasPermission('meeting_recommendations.create');

  // Recommendation form states
  const [formMeetingId, setFormMeetingId] = useState(initialMeetingId || meetings[0]?.id || '');
  const [formIsi, setFormIsi] = useState('');
  const [formTargetUnit, setFormTargetUnit] = useState(units[0]?.id || '');
  const [formPrioritas, setFormPrioritas] = useState<RecommendationPriority>('Tinggi');
  const [formDeadline, setFormDeadline] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [formCatatan, setFormCatatan] = useState('');

  const filtered = recommendations.filter(r => {
    const matchSearch =
      r.nomor_rekomendasi.toLowerCase().includes(search.toLowerCase()) ||
      r.isi_rekomendasi.toLowerCase().includes(search.toLowerCase()) ||
      r.target_unit_name.toLowerCase().includes(search.toLowerCase()) ||
      r.meeting_title.toLowerCase().includes(search.toLowerCase());

    const matchMeeting = filterMeeting === 'all' || r.meeting_id === filterMeeting;
    const matchPriority = filterPriority === 'all' || r.prioritas === filterPriority;

    return matchSearch && matchMeeting && matchPriority;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIsi || !formTargetUnit || !formMeetingId) {
      alert('Mohon lengkapi rapat rujukan, isi rekomendasi, dan unit pelaksana.');
      return;
    }

    const meetingObj = meetings.find(m => m.id === formMeetingId);
    const unitObj = units.find(u => u.id === formTargetUnit);
    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;

    const count = recommendations.length + 1;
    const nomor = `REK-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

    db.createRecommendation(
      {
        mahad_id: targetMahad,
        meeting_id: formMeetingId,
        minute_id: 'min-' + formMeetingId,
        meeting_title: meetingObj?.judul_rapat || 'Rapat Koordinasi',
        nomor_rekomendasi: nomor,
        isi_rekomendasi: formIsi,
        target_unit_id: formTargetUnit,
        target_unit_name: unitObj?.name || 'Unit Terkait',
        penanggung_jawab: unitObj?.head_name || 'Kepala Unit',
        prioritas: formPrioritas,
        tanggal: new Date().toISOString().split('T')[0],
        deadline: formDeadline,
        status: 'Baru',
        catatan: formCatatan,
        progress_percent: 0,
        created_by: currentUser.name
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormIsi('');
    setFormCatatan('');
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Rekomendasi_Rapat_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(r => ({
        'No. Rekomendasi': r.nomor_rekomendasi,
        Rapat: r.meeting_title,
        'Isi Rekomendasi': r.isi_rekomendasi,
        'Unit Pelaksana': r.target_unit_name,
        Prioritas: r.prioritas,
        Deadline: r.deadline,
        Progress: `${r.progress_percent}%`,
        Status: r.status
      }))
    );
  };

  const handlePrint = () => {
    printDocument({
      title: 'DAFTAR REKOMENDASI RAPAT KEPESANTRENAN',
      mahadName: activeMahadId === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      period: `Per Tanggal ${new Date().toLocaleDateString('id-ID')}`,
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 6px; border: 1px solid #333;">No. Rekomendasi</th>
              <th style="padding: 6px; border: 1px solid #333;">Rujukan Rapat</th>
              <th style="padding: 6px; border: 1px solid #333;">Isi Rekomendasi</th>
              <th style="padding: 6px; border: 1px solid #333;">Unit Pelaksana</th>
              <th style="padding: 6px; border: 1px solid #333;">Deadline</th>
              <th style="padding: 6px; border: 1px solid #333;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                r => `
              <tr>
                <td style="padding: 6px; border: 1px solid #333; font-family: monospace;">${r.nomor_rekomendasi}</td>
                <td style="padding: 6px; border: 1px solid #333;">${r.meeting_title}</td>
                <td style="padding: 6px; border: 1px solid #333;"><strong>${r.isi_rekomendasi}</strong></td>
                <td style="padding: 6px; border: 1px solid #333;">${r.target_unit_name}</td>
                <td style="padding: 6px; border: 1px solid #333;">${r.deadline}</td>
                <td style="padding: 6px; border: 1px solid #333;">${r.status} (${r.progress_percent}%)</td>
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
            <ListTodo className="w-6 h-6 text-[#0d5c3a]" />
            Rekomendasi Rapat Kepesantrenan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerbitan rekomendasi rapat, penugasan unit kerja, penetapan target deadline, dan pemantauan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onNavigateToMonitoring}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0d5c3a] bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 shadow-xs"
          >
            <TrendingUp className="w-4 h-4" />
            Matriks Monitoring Unit
          </button>

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
              Buat Rekomendasi
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
            placeholder="Cari nomor, isi rekomendasi, unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterMeeting}
            onChange={e => setFilterMeeting(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 max-w-[200px] truncate"
          >
            <option value="all">Semua Rapat Rujukan</option>
            {meetings.map(m => (
              <option key={m.id} value={m.id}>
                {m.judul_rapat}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">Semua Prioritas</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Rekomendasi</th>
                <th className="px-4 py-3">Rapat Rujukan</th>
                <th className="px-4 py-3">Isi Rekomendasi</th>
                <th className="px-4 py-3">Unit Pelaksana</th>
                <th className="px-4 py-3">Prioritas & Deadline</th>
                <th className="px-4 py-3">Progress & Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <EmptyState
                      icon={ListTodo}
                      title="Belum ada rekomendasi rapat"
                      description="Tambahkan rekomendasi rapat baru untuk ditugaskan dan dimonitor tindak lanjutnya oleh unit kerja."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {rec.nomor_rekomendasi}
                    </td>
                    <td className="px-4 py-3 max-w-[180px] truncate text-slate-600">
                      {rec.meeting_title}
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-slate-800 line-clamp-2">{rec.isi_rekomendasi}</div>
                      {db.getFollowUps(rec.id)[0] && (
                        <div className="text-[10px] text-emerald-700 mt-0.5 truncate">
                          Tindak lanjut: {db.getFollowUps(rec.id)[0].uraian_tindakan}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {rec.target_unit_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="mb-1">
                        <PriorityBadge priority={rec.prioritas} />
                      </div>
                      <DeadlineIndicator deadline={rec.deadline} status={rec.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-[#0d5c3a] h-1.5 rounded-full"
                            style={{ width: `${rec.progress_percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700">{rec.progress_percent}%</span>
                      </div>
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDetailRec(rec)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Lihat Detail Rekomendasi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE REKOMENDASI MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Terbitkan Rekomendasi Rapat"
        subtitle="Penugasan tindak lanjut kepada unit kerja kepesantrenan"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rapat Rujukan *</label>
            <select
              required
              value={formMeetingId}
              onChange={e => setFormMeetingId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              {meetings.map(m => (
                <option key={m.id} value={m.id}>
                  {m.judul_rapat} ({m.tanggal})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Unit Kerja Pelaksana *</label>
            <select
              required
              value={formTargetUnit}
              onChange={e => setFormTargetUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} (Kepala: {u.head_name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rumusan Isi Rekomendasi *</label>
            <textarea
              rows={4}
              required
              placeholder="Tuliskan butir rekomendasi, target luaran yang diharapkan, dan instruksi jelas..."
              value={formIsi}
              onChange={e => setFormIsi(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prioritas</label>
              <select
                value={formPrioritas}
                onChange={e => setFormPrioritas(e.target.value as RecommendationPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batas Waktu (Deadline) *</label>
              <input
                type="date"
                required
                value={formDeadline}
                onChange={e => setFormDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan Sekretariat</label>
            <input
              type="text"
              placeholder="cth: Laporannya wajib disertakan pada rapat evaluasi mingguan depan"
              value={formCatatan}
              onChange={e => setFormCatatan(e.target.value)}
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
              Terbitkan Rekomendasi
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailRec}
        onClose={() => setDetailRec(null)}
        title="Rincian Rekomendasi Rapat"
        subtitle={detailRec?.nomor_rekomendasi}
        maxWidth="md"
      >
        {detailRec && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono text-slate-500 block">{detailRec.nomor_rekomendasi}</span>
              <h4 className="text-sm font-bold text-slate-900 mt-1">{detailRec.isi_rekomendasi}</h4>
            </div>

            <p><strong className="text-slate-800">Rapat:</strong> {detailRec.meeting_title}</p>
            <p><strong className="text-slate-800">Unit Pelaksana:</strong> {detailRec.target_unit_name}</p>
            <p><strong className="text-slate-800">Batas Waktu:</strong> {detailRec.deadline}</p>
            <p><strong className="text-slate-800">Progress Saat Ini:</strong> {detailRec.progress_percent}%</p>

            {db.getFollowUps(detailRec.id)[0] && (
              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200">
                <strong className="text-emerald-900 block mb-1">Tindak Lanjut Unit Terakhir:</strong>
                <p className="text-emerald-800">{db.getFollowUps(detailRec.id)[0].uraian_tindakan}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
