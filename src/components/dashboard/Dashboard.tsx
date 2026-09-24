import React from 'react';
import {
  Mail,
  Send,
  FileCheck2,
  Workflow,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Users,
  ChevronRight,
  Building,
  CheckSquare
} from 'lucide-react';
import { User, MahadId } from '../../types';
import { db } from '../../services/db';
import { StatusBadge, PriorityBadge, DeadlineIndicator } from '../common/Badges';

interface DashboardProps {
  currentUser: User;
  activeMahadId: MahadId;
  onNavigate: (module: string, subId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  activeMahadId,
  onNavigate
}) => {
  const lettersIn = db.getLettersIn(activeMahadId);
  const lettersOut = db.getLettersOut(activeMahadId);
  const decisions = db.getDecisions(activeMahadId);
  const dispositions = db.getDispositions(activeMahadId);
  const agendas = db.getAgendas(activeMahadId);
  const meetings = db.getMeetings(activeMahadId);
  const recommendations = db.getRecommendations(activeMahadId);
  const weeklyReports = db.getWeeklyReports(activeMahadId);
  const reportingUnits = db.getReportingUnits(activeMahadId);

  const activeDispositions = dispositions.filter(
    d => d.status === 'Baru' || d.status === 'Diproses' || d.status === 'Diterima'
  );

  const activeRecs = recommendations.filter(
    r => r.status === 'Baru' || r.status === 'Sedang Ditindaklanjuti' || r.status === 'Diterima'
  );

  const overdueRecs = recommendations.filter(r => {
    if (r.status === 'Selesai' || r.status === 'Ditutup') return false;
    return new Date(r.deadline).getTime() < new Date().getTime();
  });

  const pendingWeeklyReports = weeklyReports.filter(r => r.status === 'Menunggu Validasi');
  const approvedWeeklyReports = weeklyReports.filter(r => r.status === 'Disetujui');
  const revisionWeeklyReports = weeklyReports.filter(r => r.status === 'Perlu Revisi');

  const mahadTitle =
    activeMahadId === 'all'
      ? 'Lintas Ma’had (Lil Banin & Lil Banat)'
      : activeMahadId === 'mahad-banin'
      ? "Ma'had Putra (Lil Banin)"
      : "Ma'had Putri (Lil Banat)";

  // RENDER BASED ON ROLE
  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#0d5c3a] to-[#124b31] rounded-2xl p-6 text-white shadow-sm border border-[#09472c] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-200 bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-700/50">
                Sistem Terpadu UNIA
              </span>
              <span className="text-xs text-emerald-100 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" />
                {mahadTitle}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Ahlan wa Sahlan, {currentUser.name}
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-2xl font-light">
              {currentUser.position_title} — Panel Administrasi, Pengarsipan, Rapat & Pelaporan Terpadu Universitas Al-Amien Prenduan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 px-3 py-2 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Status Peran</span>
              <span className="text-xs font-bold capitalize text-white">{currentUser.role_id.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. DASHBOARD KHUSUS MUDIR */}
      {currentUser.role_id === 'validator_mudir' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#0d5c3a]" />
              Ringkasan Kendali Mudir Ma’had
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('validasi_laporan')}
              className="text-xs font-medium text-[#0d5c3a] hover:underline flex items-center gap-1"
            >
              Lihat Meja Validasi Laporan →
            </button>
          </div>

          {/* Mudir Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Laporan Menunggu Validasi</span>
              <div className="text-2xl font-bold text-amber-600 mt-1 flex items-baseline justify-between">
                <span>{pendingWeeklyReports.length}</span>
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Butuh Aksi</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Laporan Perlu Revisi</span>
              <div className="text-2xl font-bold text-orange-600 mt-1 flex items-baseline justify-between">
                <span>{revisionWeeklyReports.length}</span>
                <span className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">Revisi</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Laporan Telah Disetujui</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1 flex items-baseline justify-between">
                <span>{approvedWeeklyReports.length}</span>
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Selesai</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Rekomendasi Rapat Aktif</span>
              <div className="text-2xl font-bold text-blue-600 mt-1 flex items-baseline justify-between">
                <span>{activeRecs.length}</span>
                {overdueRecs.length > 0 && (
                  <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                    {overdueRecs.length} Terlambat
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mudir Pending Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Laporan Mingguan Masuk Menunggu Validasi</h3>
                <p className="text-xs text-slate-500">Daftar laporan dari reporting unit yang siap ditinjau dan divalidasi Mudir</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('validasi_laporan')}
                className="px-3 py-1.5 rounded-lg bg-[#0d5c3a] text-white text-xs font-medium hover:bg-[#09472c] transition-colors"
              >
                Proses Validasi
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingWeeklyReports.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Semua laporan mingguan telah divalidasi. Tidak ada antrean.
                </div>
              ) : (
                pendingWeeklyReports.map(rep => (
                  <div key={rep.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{rep.reporting_unit_name}</span>
                        <span className="text-xs text-slate-500">
                          (Minggu ke-{rep.minggu_ke} - {rep.bulan} {rep.tahun})
                        </span>
                        <StatusBadge status={rep.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 max-w-xl">
                        {rep.ringkasan_kegiatan}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>Diajukan: {rep.submitted_at ? new Date(rep.submitted_at).toLocaleDateString('id-ID') : '-'}</span>
                        <span>•</span>
                        <span>PJ: {rep.penanggung_jawab}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('validasi_laporan')}
                      className="px-3 py-1 text-xs font-medium text-[#0d5c3a] border border-[#0d5c3a]/30 rounded-lg hover:bg-[#0d5c3a]/5"
                    >
                      Periksa & Validasi
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD KHUSUS UNIT REPORTER */}
      {currentUser.role_id === 'unit_reporter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Unit Kerja Anda</span>
              <h3 className="text-base font-bold text-slate-800 mt-1">
                {db.getUnitById(currentUser.unit_id)?.name || 'Unit Kerja'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kode: {db.getUnitById(currentUser.unit_id)?.code}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Rekomendasi Rapat Ditujukan ke Unit</span>
              <div className="text-2xl font-bold text-[#0d5c3a] mt-1 flex items-baseline justify-between">
                <span>
                  {recommendations.filter(r => r.target_unit_id === currentUser.unit_id).length}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('monitoring_rekomendasi')}
                  className="text-xs text-[#0d5c3a] hover:underline"
                >
                  Tindak Lanjut →
                </button>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Laporan Mingguan Unit Anda</span>
              <div className="text-2xl font-bold text-blue-600 mt-1 flex items-baseline justify-between">
                <span>
                  {weeklyReports.filter(r => r.reporting_unit_id === currentUser.unit_id).length}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('laporan_mingguan')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Buat Laporan →
                </button>
              </div>
            </div>
          </div>

          {/* Unit's active recommendations to follow up */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Rekomendasi Rapat yang Perlu Ditindaklanjuti Unit</h3>
                <p className="text-xs text-slate-500">Unit wajib memberikan tindak lanjut dan melaporkannya dalam laporan mingguan</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('monitoring_rekomendasi')}
                className="text-xs font-semibold text-[#0d5c3a] hover:underline"
              >
                Lihat Seluruh Rekomendasi
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recommendations.filter(r => r.target_unit_id === currentUser.unit_id).length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  Tidak ada rekomendasi rapat aktif untuk unit Anda.
                </div>
              ) : (
                recommendations
                  .filter(r => r.target_unit_id === currentUser.unit_id)
                  .map(rec => (
                    <div key={rec.id} className="p-4 hover:bg-slate-50 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-slate-700">{rec.nomor_rekomendasi}</span>
                          <PriorityBadge priority={rec.prioritas} />
                          <StatusBadge status={rec.status} size="sm" />
                        </div>
                        <p className="text-xs text-slate-800 font-medium line-clamp-2 max-w-xl">
                          {rec.isi_rekomendasi}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Dari: {rec.meeting_title}</span>
                          <span>•</span>
                          <DeadlineIndicator deadline={rec.deadline} status={rec.status} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onNavigate('monitoring_rekomendasi')}
                        className="px-3 py-1.5 rounded-lg bg-[#0d5c3a] text-white text-xs font-medium hover:bg-[#09472c] shrink-0"
                      >
                        Beri Tindak Lanjut
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. DASHBOARD UTAMA (ADMIN, SEKRETARIAT & AUDITOR/VIEWER) */}
      {(currentUser.role_id === 'super_admin' ||
        currentUser.role_id === 'admin_sekretariat' ||
        currentUser.role_id === 'viewer') && (
        <div className="space-y-6">
          {/* Main Stat Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div
              onClick={() => onNavigate('surat_masuk')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Surat Masuk</span>
                <Mail className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{lettersIn.length}</div>
              <span className="text-[10px] text-slate-400">Tercatat di sistem</span>
            </div>

            <div
              onClick={() => onNavigate('surat_keluar')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Surat Keluar</span>
                <Send className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{lettersOut.length}</div>
              <span className="text-[10px] text-slate-400">Diterbitkan</span>
            </div>

            <div
              onClick={() => onNavigate('sk')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Surat SK</span>
                <FileCheck2 className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{decisions.length}</div>
              <span className="text-[10px] text-slate-400">Keputusan resmi</span>
            </div>

            <div
              onClick={() => onNavigate('disposisi')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Disposisi</span>
                <Workflow className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{activeDispositions.length}</div>
              <span className="text-[10px] text-purple-600 font-medium">Sedang berjalan</span>
            </div>

            <div
              onClick={() => onNavigate('rekomendasi')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Rekomendasi</span>
                <TrendingUp className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{activeRecs.length}</div>
              <span className="text-[10px] text-rose-600 font-medium">
                {overdueRecs.length > 0 ? `${overdueRecs.length} Terlambat` : 'Aktif dipantau'}
              </span>
            </div>

            <div
              onClick={() => onNavigate('laporan_mingguan')}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium text-slate-500">Lap. Mingguan</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{weeklyReports.length}</div>
              <span className="text-[10px] text-amber-600 font-medium">
                {pendingWeeklyReports.length} Tunggu Validasi
              </span>
            </div>
          </div>

          {/* Split Content: Agenda Terdekat & Rekomendasi Terakhir */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agenda Terdekat */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0d5c3a]" />
                  <h3 className="text-sm font-bold text-slate-800">Agenda Sekretariat Terdekat</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('agenda')}
                  className="text-xs text-[#0d5c3a] hover:underline font-medium"
                >
                  Lihat Kalender →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {agendas.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">Belum ada agenda terjadwal</div>
                ) : (
                  agendas.slice(0, 4).map(ag => (
                    <div key={ag.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{ag.judul}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-medium text-slate-600">
                          {ag.jenis}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ag.deskripsi}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Clock className="w-3.5 h-3.5" />
                          {ag.tanggal} ({ag.waktu_mulai} - {ag.waktu_selesai} WIB)
                        </span>
                        <span>•</span>
                        <span>{ag.tempat}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Monitoring Rekomendasi Rapat Terkini */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0d5c3a]" />
                  <h3 className="text-sm font-bold text-slate-800">Status Rekomendasi Rapat</h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('monitoring_rekomendasi')}
                  className="text-xs text-[#0d5c3a] hover:underline font-medium"
                >
                  Matriks Monitoring →
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {recommendations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">Belum ada data rekomendasi</div>
                ) : (
                  recommendations.slice(0, 4).map(rec => (
                    <div key={rec.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-700">{rec.nomor_rekomendasi}</span>
                          <StatusBadge status={rec.status} size="sm" />
                        </div>
                        <PriorityBadge priority={rec.prioritas} />
                      </div>
                      <p className="text-xs text-slate-800 mt-1 line-clamp-1 font-medium">{rec.isi_rekomendasi}</p>
                      <div className="flex items-center justify-between mt-2 text-[11px]">
                        <span className="text-slate-500 font-medium">Unit: {rec.target_unit_name}</span>
                        <DeadlineIndicator deadline={rec.deadline} status={rec.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Rapat & Surat Terakhir */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Surat Masuk Terbaru */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Surat Masuk Terbaru</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('surat_masuk')}
                  className="text-xs text-[#0d5c3a] hover:underline font-medium"
                >
                  Kelola Surat Masuk →
                </button>
              </div>
              <div className="space-y-3">
                {lettersIn.slice(0, 3).map(letIn => (
                  <div key={letIn.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-slate-700">{letIn.nomor_surat}</span>
                      <PriorityBadge priority={letIn.sifat} />
                    </div>
                    <p className="text-xs text-slate-800 font-medium line-clamp-1">{letIn.perihal}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Pengirim: {letIn.pengirim}</span>
                      <span>{letIn.tanggal_surat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rapat & Notulensi Terakhir */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Rapat & Notulensi</h3>
                <button
                  type="button"
                  onClick={() => onNavigate('rapat')}
                  className="text-xs text-[#0d5c3a] hover:underline font-medium"
                >
                  Lihat Semua Rapat →
                </button>
              </div>
              <div className="space-y-3">
                {meetings.slice(0, 3).map(m => (
                  <div key={m.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-800 line-clamp-1">{m.judul_rapat}</span>
                      <StatusBadge status={m.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{m.agenda}</p>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Pimpinan: {m.pimpinan_rapat}</span>
                      <span>{m.tanggal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
