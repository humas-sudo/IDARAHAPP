import React, { useState } from 'react';
import {
  FileCheck,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle,
  Eye,
  Calendar,
  Building,
  AlertCircle,
  Send,
  CheckSquare
} from 'lucide-react';
import { WeeklyReport, WeeklyReportStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface LaporanUnitProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const LaporanUnit: React.FC<LaporanUnitProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailReport, setDetailReport] = useState<WeeklyReport | null>(null);

  const reports = db.getWeeklyReports(activeMahadId);
  const units = db.getUnits(activeMahadId === 'all' ? undefined : activeMahadId);
  const canSubmit = auth.hasPermission('weekly_reports.submit') || currentUser.role_id === 'unit_reporter';
  const canValidate =
    auth.hasPermission('weekly_reports.validate') ||
    currentUser.role_id === 'validator_mudir' ||
    currentUser.role_id === 'super_admin';

  // Form states
  const [formMinggu, setFormMinggu] = useState(1);
  const [formBulan, setFormBulan] = useState('September');
  const [formTahun, setFormTahun] = useState(2026);
  const [formTglMulai, setFormTglMulai] = useState('2026-09-14');
  const [formTglSelesai, setFormTglSelesai] = useState('2026-09-20');
  const [formTargetUnit, setFormTargetUnit] = useState(currentUser.unit_id || units[0]?.id || '');
  const [formRingkasan, setFormRingkasan] = useState('');
  const [formKegiatanSelesai, setFormKegiatanSelesai] = useState('');
  const [formKegiatanBelum, setFormKegiatanBelum] = useState('');
  const [formKendala, setFormKendala] = useState('');
  const [formTindakLanjut, setFormTindakLanjut] = useState('');
  const [formRencana, setFormRencana] = useState('');

  const filtered = reports.filter(r => {
    const matchSearch =
      r.reporting_unit_name.toLowerCase().includes(search.toLowerCase()) ||
      r.ringkasan_kegiatan.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRingkasan) {
      alert('Ringkasan kegiatan mingguan wajib diisi.');
      return;
    }

    const unitObj = units.find(u => u.id === formTargetUnit) || db.getUnitById(formTargetUnit);
    const targetMahad = activeMahadId === 'all' ? (unitObj?.mahad_id || 'mahad-banin') : activeMahadId;

    const newRep = db.createWeeklyReport(
      {
        mahad_id: targetMahad,
        reporting_unit_id: formTargetUnit,
        reporting_unit_name: unitObj?.name || 'Biro / Unit',
        period_id: 'prd-current',
        minggu_ke: Number(formMinggu),
        bulan: formBulan,
        tahun: Number(formTahun),
        tanggal_mulai: formTglMulai,
        tanggal_selesai: formTglSelesai,
        penanggung_jawab: currentUser.name,
        ringkasan_kegiatan: formRingkasan,
        kegiatan_selesai: formKegiatanSelesai.split('\n').map(s => s.trim()).filter(Boolean),
        kegiatan_belum_selesai: formKegiatanBelum.split('\n').map(s => s.trim()).filter(Boolean),
        kendala: formKendala,
        tindak_lanjut: formTindakLanjut,
        rencana_minggu_depan: formRencana.split('\n').map(s => s.trim()).filter(Boolean),
        rekomendasi_ids: [],
        status: 'Draft'
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormRingkasan('');
    setFormKegiatanSelesai('');
    setFormKegiatanBelum('');
    setFormKendala('');
    setFormRencana('');
    setDetailReport(newRep);
  };

  const handleSubmitToMudir = (reportId: string) => {
    if (confirm('Ajukan laporan mingguan ini kepada Mudir Ma’had untuk divalidasi?')) {
      const updated = db.submitWeeklyReport(reportId, currentUser);
      if (updated && detailReport?.id === reportId) {
        setDetailReport(updated);
      }
    }
  };

  const handleValidateReport = (reportId: string, action: 'approve' | 'revision' | 'reject') => {
    const notes = prompt(
      action === 'approve'
        ? 'Catatan validasi / apresiasi Mudir (opsional):'
        : 'Alasan pengembalian / catatan revisi:'
    );
    if (notes === null) return;

    const updated = db.validateWeeklyReport(reportId, action, notes || '', currentUser);
    if (updated && detailReport?.id === reportId) {
      setDetailReport(updated);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Laporan_Mingguan_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(r => ({
        ID: r.id,
        Unit: r.reporting_unit_name,
        Periode: `Minggu ke-${r.minggu_ke} (${r.bulan} ${r.tahun})`,
        'Tanggal Mulai': r.tanggal_mulai,
        'Tanggal Selesai': r.tanggal_selesai,
        'Penanggung Jawab': r.penanggung_jawab,
        Ringkasan: r.ringkasan_kegiatan,
        Status: r.status,
        'Catatan Mudir': r.catatan_mudir || '-'
      }))
    );
  };

  const handlePrint = (r: WeeklyReport) => {
    printDocument({
      title: `LAPORAN PERTANGGUNGJAWABAN MINGGUAN UNIT`,
      documentNumber: `LAP-M${r.minggu_ke}/${r.reporting_unit_id.toUpperCase()}/${r.tahun}`,
      mahadName: r.mahad_id === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      date: r.tanggal_selesai,
      signatoryName: r.penanggung_jawab,
      signatoryTitle: `Kepala ${r.reporting_unit_name}`,
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Unit Pelapor</td>
            <td style="font-weight: bold; font-size: 11pt; border: 1px solid #ddd; padding: 6px;">${r.reporting_unit_name}</td>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Periode Pelaporan</td>
            <td style="border: 1px solid #ddd; padding: 6px;">Minggu ke-${r.minggu_ke}, ${r.bulan} ${r.tahun}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Rentang Tanggal</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${r.tanggal_mulai} s.d. ${r.tanggal_selesai}</td>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Status Verifikasi</td>
            <td style="border: 1px solid #ddd; padding: 6px;"><strong>${r.status}</strong></td>
          </tr>
        </table>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px;">I. Ringkasan Eksekutif Kegiatan</h3>
          <p style="line-height: 1.6; text-align: justify;">${r.ringkasan_kegiatan}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px;">II. Capaian Kegiatan yang Telah Selesai</h3>
          <ul>
            ${r.kegiatan_selesai.map(k => `<li style="line-height: 1.6;">${k}</li>`).join('') || '<li>Tidak ada kegiatan terselesaikan secara penuh.</li>'}
          </ul>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px;">III. Kendala & Tindak Lanjut</h3>
          <p><strong>Kendala Dihadapi:</strong> ${r.kendala || 'Tidak ada kendala berarti.'}</p>
          <p><strong>Tindak Lanjut Unit:</strong> ${r.tindak_lanjut || '-'}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px;">IV. Rencana Kerja Minggu Berikutnya</h3>
          <ul>
            ${r.rencana_minggu_depan.map(rc => `<li style="line-height: 1.6;">${rc}</li>`).join('') || '<li>-</li>'}
          </ul>
        </div>

        ${
          r.catatan_mudir
            ? `
          <div style="margin-top: 25px; padding: 15px; border: 2px dashed #0d5c3a; background: #f0fdf4;">
            <h4 style="margin: 0 0 5px 0; color: #0d5c3a;">Catatan & Arahan Mudir Ma'had:</h4>
            <p style="margin: 0; font-style: italic;">"${r.catatan_mudir}"</p>
          </div>
        `
            : ''
        }
      `
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-[#0d5c3a]" />
            Laporan Akuntabilitas Mingguan Unit
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelaporan progres kerja berkala seluruh biro, bagian kepengasuhan, dan unit keasramaan kepada Mudir
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Data
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Buat Laporan Mingguan
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari unit atau ringkasan kegiatan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-slate-500 shrink-0">Status Laporan:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full md:w-48 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Menunggu Validasi">Menunggu Validasi</option>
            <option value="Disetujui">Disetujui Mudir</option>
            <option value="Perlu Revisi">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Grid of Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={FileCheck}
              title="Tidak ada laporan mingguan"
              description="Belum ada laporan akuntabilitas yang cocok dengan kriteria pencarian Anda."
            />
          </div>
        ) : (
          filtered.map(r => (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    Minggu ke-{r.minggu_ke} • {r.bulan} {r.tahun}
                  </span>
                  <StatusBadge status={r.status} size="sm" />
                </div>

                <h3 className="text-sm font-bold text-slate-800 mb-1 leading-snug">
                  {r.reporting_unit_name}
                </h3>
                <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{r.tanggal_mulai} s.d. {r.tanggal_selesai}</span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {r.ringkasan_kegiatan}
                </p>

                {r.catatan_mudir && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs mb-3">
                    <span className="font-bold text-emerald-900 block mb-0.5">Catatan Mudir:</span>
                    <p className="text-emerald-800 line-clamp-2 italic">"{r.catatan_mudir}"</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailReport(r)}
                  className="text-xs font-semibold text-slate-700 hover:text-[#0d5c3a] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Detail
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handlePrint(r)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Cetak Laporan"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {r.status === 'Draft' && (
                    <button
                      type="button"
                      onClick={() => handleSubmitToMudir(r.id)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-md shadow-xs flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Ajukan
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
        title="Buat Laporan Mingguan Unit"
        subtitle="Pertanggungjawaban kegiatan, capaian target, dan evaluasi operasional"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Pelapor *</label>
              <select
                value={formTargetUnit}
                onChange={e => setFormTargetUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minggu Ke-</label>
              <select
                value={formMinggu}
                onChange={e => setFormMinggu(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                {[1, 2, 3, 4, 5].map(m => (
                  <option key={m} value={m}>
                    Minggu ke-{m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bulan & Tahun</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formBulan}
                  onChange={e => setFormBulan(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-slate-300"
                />
                <input
                  type="number"
                  value={formTahun}
                  onChange={e => setFormTahun(Number(e.target.value))}
                  className="w-20 px-2 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Periode</label>
              <input
                type="date"
                value={formTglMulai}
                onChange={e => setFormTglMulai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai Periode</label>
              <input
                type="date"
                value={formTglSelesai}
                onChange={e => setFormTglSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ringkasan Eksekutif Kegiatan *</label>
            <textarea
              rows={3}
              required
              value={formRingkasan}
              onChange={e => setFormRingkasan(e.target.value)}
              placeholder="Jelaskan gambaran umum operasional dan kegiatan unit pekan ini..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Capaian Kegiatan yang Telah Selesai (Satu per baris)</label>
            <textarea
              rows={3}
              value={formKegiatanSelesai}
              onChange={e => setFormKegiatanSelesai(e.target.value)}
              placeholder="cth:&#10;Kajian mingguan kitab Fathul Qorib berjalan lancar&#10;Piket asrama terlaksana 100%"
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kendala / Hambatan</label>
              <textarea
                rows={3}
                value={formKendala}
                onChange={e => setFormKendala(e.target.value)}
                placeholder="Permasalahan yang dihadapi santri / staf..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rencana Kerja Pekan Depan (Satu per baris)</label>
              <textarea
                rows={3}
                value={formRencana}
                onChange={e => setFormRencana(e.target.value)}
                placeholder="cth:&#10;Ujian tasmi' juz 30&#10;Pemeriksaan kesehatan santri"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
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
              Simpan Laporan (Draft)
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL WITH VALIDATION WORKFLOW */}
      <Modal
        isOpen={!!detailReport}
        onClose={() => setDetailReport(null)}
        title="Detail Laporan Mingguan"
        subtitle={detailReport ? `${detailReport.reporting_unit_name} • Minggu ke-${detailReport.minggu_ke}` : ''}
        maxWidth="2xl"
      >
        {detailReport && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-800">{detailReport.reporting_unit_name}</div>
                <div className="text-[11px] text-slate-500">
                  {detailReport.tanggal_mulai} s.d. {detailReport.tanggal_selesai} • Penanggung Jawab: {detailReport.penanggung_jawab}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={detailReport.status} />
                <button
                  type="button"
                  onClick={() => handlePrint(detailReport)}
                  className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md"
                  title="Cetak Laporan"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-800 block mb-1">I. Ringkasan Kegiatan:</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  {detailReport.ringkasan_kegiatan}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">II. Kegiatan yang Diselesaikan:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                  {detailReport.kegiatan_selesai.map((k, i) => (
                    <li key={i}>{k}</li>
                  ))}
                  {detailReport.kegiatan_selesai.length === 0 && <li className="italic text-slate-400">Tidak ada.</li>}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">III. Kendala Dihadapi:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200 min-h-[60px]">
                    {detailReport.kendala || '-'}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-1">IV. Rencana Minggu Depan:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-200 min-h-[60px]">
                    {detailReport.rencana_minggu_depan.map((rc, i) => (
                      <li key={i}>{rc}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {detailReport.catatan_mudir && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="font-bold text-emerald-900 block mb-1">Arahan & Catatan Mudir:</span>
                  <p className="text-emerald-800 italic">"{detailReport.catatan_mudir}"</p>
                  <div className="text-[10px] text-emerald-600 mt-1">Divalidasi pada: {detailReport.validated_at}</div>
                </div>
              )}

              {/* ACTION BAR BASED ON ROLE */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {detailReport.status === 'Draft' && (
                  <button
                    type="button"
                    onClick={() => handleSubmitToMudir(detailReport.id)}
                    className="px-4 py-2 bg-[#0d5c3a] text-white font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    Ajukan ke Mudir
                  </button>
                )}

                {canValidate && detailReport.status === 'Menunggu Validasi' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleValidateReport(detailReport.id, 'revision')}
                      className="px-3 py-1.5 text-rose-700 hover:bg-rose-50 border border-rose-300 font-semibold rounded-lg"
                    >
                      Minta Revisi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleValidateReport(detailReport.id, 'approve')}
                      className="px-4 py-1.5 bg-[#0d5c3a] hover:bg-[#09472c] text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <CheckSquare className="w-4 h-4" />
                      Setujui Laporan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
