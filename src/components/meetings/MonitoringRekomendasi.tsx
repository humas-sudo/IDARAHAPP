import React, { useState } from 'react';
import {
  TrendingUp,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlusCircle,
  Download,
  Printer,
  ChevronRight,
  Send
} from 'lucide-react';
import {
  MeetingRecommendation,
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

interface MonitoringRekomendasiProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const MonitoringRekomendasi: React.FC<MonitoringRekomendasiProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [followUpRec, setFollowUpRec] = useState<MeetingRecommendation | null>(null);

  // Update follow-up modal state
  const [progressVal, setProgressVal] = useState(50);
  const [statusVal, setStatusVal] = useState<RecommendationStatus>('Sedang Ditindaklanjuti');
  const [notesVal, setNotesVal] = useState('');

  const recommendations = db.getRecommendations(activeMahadId);
  const units = db.getUnits(activeMahadId === 'all' ? undefined : activeMahadId);

  // Filter recommendations based on user role
  const roleFilteredRecs = recommendations.filter(r => {
    if (currentUser.role_id === 'unit_reporter') {
      return r.target_unit_id === currentUser.unit_id;
    }
    return true;
  });

  const filtered = roleFilteredRecs.filter(r => {
    const matchSearch =
      r.nomor_rekomendasi.toLowerCase().includes(search.toLowerCase()) ||
      r.isi_rekomendasi.toLowerCase().includes(search.toLowerCase()) ||
      r.target_unit_name.toLowerCase().includes(search.toLowerCase());

    const matchUnit = filterUnit === 'all' || r.target_unit_id === filterUnit;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;

    return matchSearch && matchUnit && matchStatus;
  });

  const total = roleFilteredRecs.length;
  const selesai = roleFilteredRecs.filter(r => r.status === 'Selesai' || r.status === 'Ditutup').length;
  const onProgress = roleFilteredRecs.filter(r => r.status === 'Sedang Ditindaklanjuti' || r.status === 'Diterima').length;
  const baru = roleFilteredRecs.filter(r => r.status === 'Baru').length;
  const terlambat = roleFilteredRecs.filter(r => {
    if (r.status === 'Selesai' || r.status === 'Ditutup') return false;
    return new Date(r.deadline).getTime() < new Date().getTime();
  }).length;

  const handleOpenFollowUp = (r: MeetingRecommendation) => {
    setFollowUpRec(r);
    setProgressVal(r.progress_percent || 0);
    setStatusVal(r.status);
    const lastFU = db.getFollowUps(r.id)[0];
    setNotesVal(lastFU?.uraian_tindakan || r.catatan || '');
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpRec || !notesVal) {
      alert('Tuliskan rincian tindak lanjut unit.');
      return;
    }

    db.submitFollowUp(
      {
        recommendation_id: followUpRec.id,
        unit_id: followUpRec.target_unit_id,
        status_update: progressVal === 100 ? 'Selesai' : statusVal,
        uraian_tindakan: notesVal,
        hasil: `Pelaksanaan tindak lanjut mencapai progres ${progressVal}%.`,
        kendala: '',
        rencana_berikutnya: progressVal === 100 ? 'Selesai sepenuhnya.' : 'Melanjutkan tindak lanjut sesuai target.',
        tanggal_pelaksanaan: new Date().toISOString().split('T')[0],
        progress_percent: Number(progressVal),
        submitted_by: currentUser.name
      },
      currentUser
    );

    setFollowUpRec(null);
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Monitoring_Rekomendasi_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(r => ({
        'No. Rekomendasi': r.nomor_rekomendasi,
        Rapat: r.meeting_title,
        'Unit Pelaksana': r.target_unit_name,
        'Isi Rekomendasi': r.isi_rekomendasi,
        Prioritas: r.prioritas,
        Deadline: r.deadline,
        'Progress (%)': r.progress_percent,
        Status: r.status,
        'Tindak Lanjut': db.getFollowUps(r.id)[0]?.uraian_tindakan || r.catatan || '-'
      }))
    );
  };

  const handlePrint = () => {
    printDocument({
      title: 'MATRIKS MONITORING REKOMENDASI RAPAT KEPESANTRENAN',
      mahadName: activeMahadId === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      period: `Per Tanggal ${new Date().toLocaleDateString('id-ID')}`,
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 6px; border: 1px solid #333;">No. Rekomendasi</th>
              <th style="padding: 6px; border: 1px solid #333;">Unit Kerja</th>
              <th style="padding: 6px; border: 1px solid #333;">Isi Rekomendasi</th>
              <th style="padding: 6px; border: 1px solid #333;">Deadline</th>
              <th style="padding: 6px; border: 1px solid #333;">Progres</th>
              <th style="padding: 6px; border: 1px solid #333;">Status & Tindak Lanjut</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                r => `
              <tr>
                <td style="padding: 6px; border: 1px solid #333; font-family: monospace;">${r.nomor_rekomendasi}</td>
                <td style="padding: 6px; border: 1px solid #333;">${r.target_unit_name}</td>
                <td style="padding: 6px; border: 1px solid #333;">${r.isi_rekomendasi}</td>
                <td style="padding: 6px; border: 1px solid #333;">${r.deadline}</td>
                <td style="padding: 6px; border: 1px solid #333; text-align: center;">${r.progress_percent}%</td>
                <td style="padding: 6px; border: 1px solid #333;">
                  <strong>${r.status}</strong><br>
                  <small>${db.getFollowUps(r.id)[0]?.uraian_tindakan || r.catatan || '-'}</small>
                </td>
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
            <TrendingUp className="w-6 h-6 text-[#0d5c3a]" />
            Matriks Monitoring & Tindak Lanjut Rekomendasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan akuntabilitas unit kerja, persentase progres tindak lanjut, dan peringatan batas waktu
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Matriks
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Rekomendasi</span>
          <div className="text-2xl font-bold text-slate-800 mt-1">{total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Baru Diterbitkan</span>
          <div className="text-2xl font-bold text-slate-600 mt-1">{baru}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Sedang Berjalan</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{onProgress}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Telah Selesai</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{selesai}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-xs text-slate-500 font-medium">Melewati Batas Waktu</span>
          <div className="text-2xl font-bold text-rose-600 mt-1 flex items-center justify-between">
            <span>{terlambat}</span>
            {terlambat > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                Atensi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari rekomendasi, unit, tindak lanjut..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {currentUser.role_id !== 'unit_reporter' && (
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 max-w-[180px] truncate"
            >
              <option value="all">Semua Unit Pelaksana</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Diterima">Diterima</option>
            <option value="Sedang Ditindaklanjuti">Sedang Ditindaklanjuti</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Detailed Monitoring Matrix Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Tidak ada rekomendasi yang sesuai"
            description="Tidak ditemukan rekomendasi rapat aktif berdasarkan kriteria filter."
          />
        ) : (
          filtered.map(rec => (
            <div
              key={rec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all p-5"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {rec.nomor_rekomendasi}
                    </span>
                    <PriorityBadge priority={rec.prioritas} />
                    <StatusBadge status={rec.status} size="sm" />
                    <span className="text-xs text-slate-400">Rujukan: {rec.meeting_title}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{rec.isi_rekomendasi}</h3>

                  <div className="text-xs text-slate-600 flex items-center gap-4 flex-wrap pt-1">
                    <span>
                      Unit PJ: <strong>{rec.target_unit_name}</strong>
                    </span>
                    <span>•</span>
                    <DeadlineIndicator deadline={rec.deadline} status={rec.status} />
                  </div>

                  {/* Follow up history display */}
                  {db.getFollowUps(rec.id).length > 0 ? (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800 block mb-1">Catatan Tindak Lanjut Terakhir Unit:</span>
                      <p className="text-slate-700 leading-relaxed">{db.getFollowUps(rec.id)[0].uraian_tindakan}</p>
                    </div>
                  ) : rec.catatan ? (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <span className="font-bold text-slate-800 block mb-1">Catatan Sekretariat / Mudir:</span>
                      <p className="text-slate-700 leading-relaxed">{rec.catatan}</p>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-slate-400 italic">
                      Belum ada catatan tindak lanjut yang dimasukkan unit.
                    </div>
                  )}
                </div>

                {/* Right side: Progress Bar & Follow Up Action Button */}
                <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-5 pt-3 lg:pt-0 flex flex-col justify-between shrink-0">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Progres Pelaksanaan</span>
                      <span className="font-bold text-slate-800 text-sm">{rec.progress_percent}%</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          rec.progress_percent === 100
                            ? 'bg-emerald-600'
                            : rec.progress_percent >= 50
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${rec.progress_percent}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenFollowUp(rec)}
                    className="mt-4 w-full py-2 px-3 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Input Progres Tindak Lanjut
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPDATE FOLLOW UP MODAL */}
      <Modal
        isOpen={!!followUpRec}
        onClose={() => setFollowUpRec(null)}
        title="Input Progres Tindak Lanjut Rekomendasi"
        subtitle={followUpRec?.nomor_rekomendasi}
        maxWidth="lg"
      >
        {followUpRec && (
          <form onSubmit={handleFollowUpSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">Rekomendasi untuk: {followUpRec.target_unit_name}</span>
              <p className="font-bold text-slate-800">{followUpRec.isi_rekomendasi}</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Persentase Ketercapaian Target (%)</label>
                <span className="font-bold text-base text-[#0d5c3a]">{progressVal}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressVal}
                onChange={e => setProgressVal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0d5c3a]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Belum)</span>
                <span>50% (Sebagian)</span>
                <span>100% (Tuntas Selesai)</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Tindak Lanjut</label>
              <select
                value={statusVal}
                onChange={e => setStatusVal(e.target.value as RecommendationStatus)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Diterima">Diterima Unit</option>
                <option value="Sedang Ditindaklanjuti">Sedang Ditindaklanjuti</option>
                <option value="Selesai">Selesai 100%</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Uraian Tindak Lanjut yang Dilaksanakan *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan langkah nyata, SOP yang dibuat, pembinaan yang dilaksanakan, atau hasil yang telah dicapai..."
                value={notesVal}
                onChange={e => setNotesVal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setFollowUpRec(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg shadow-xs"
              >
                Simpan & Perbarui Progres
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
