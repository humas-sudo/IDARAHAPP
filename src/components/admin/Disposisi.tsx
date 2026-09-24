import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle,
  Clock,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Disposition, DispositionStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge, PriorityBadge, DeadlineIndicator } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface DisposisiProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const Disposisi: React.FC<DisposisiProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [detailDisp, setDetailDisp] = useState<Disposition | null>(null);
  const [followUpDisp, setFollowUpDisp] = useState<Disposition | null>(null);
  const [followUpText, setFollowUpText] = useState('');

  const dispositions = db.getDispositions(activeMahadId);
  const units = db.getUnits(activeMahadId === 'all' ? undefined : activeMahadId);

  // If user is unit reporter, only show their unit's dispositions by default unless super_admin
  const visibleDispositions = dispositions.filter(d => {
    if (currentUser.role_id === 'unit_reporter') {
      return d.target_unit_id === currentUser.unit_id;
    }
    return true;
  });

  const filtered = visibleDispositions.filter(d => {
    const matchSearch =
      d.letter_nomor.toLowerCase().includes(search.toLowerCase()) ||
      d.letter_perihal.toLowerCase().includes(search.toLowerCase()) ||
      d.instruksi.toLowerCase().includes(search.toLowerCase()) ||
      d.target_unit_name.toLowerCase().includes(search.toLowerCase());

    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    const matchUnit = filterUnit === 'all' || d.target_unit_id === filterUnit;

    return matchSearch && matchStatus && matchUnit;
  });

  const handleUpdateStatus = (dispId: string, newStatus: DispositionStatus) => {
    db.updateDisposition(dispId, { status: newStatus }, currentUser);
    if (detailDisp && detailDisp.id === dispId) {
      setDetailDisp({ ...detailDisp, status: newStatus });
    }
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpDisp || !followUpText) return;

    db.updateDisposition(
      followUpDisp.id,
      {
        catatan_tindak_lanjut: followUpText,
        status: 'Diproses'
      },
      currentUser
    );

    setFollowUpDisp(null);
    setFollowUpText('');
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Disposisi_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(d => ({
        'No. Surat': d.letter_nomor,
        Perihal: d.letter_perihal,
        'Pemberi Disposisi': d.pemberi_disposisi,
        'Unit Tujuan': d.target_unit_name,
        Instruksi: d.instruksi,
        Prioritas: d.prioritas,
        Deadline: d.deadline,
        Status: d.status,
        'Tindak Lanjut': d.catatan_tindak_lanjut || '-'
      }))
    );
  };

  const handlePrint = (d: Disposition) => {
    printDocument({
      title: 'LEMBAR DISPOSISI DINAS MA’HAD',
      documentNumber: d.letter_nomor,
      mahadName: d.mahad_id === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      date: d.tanggal_disposisi,
      signatoryName: d.pemberi_disposisi,
      signatoryTitle: "Pemberi Disposisi",
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 30%; font-weight: bold; background: #f8fafc;">Surat Rujukan</td>
            <td>${d.letter_nomor}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Perihal</td>
            <td style="font-weight: bold;">${d.letter_perihal}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Pemberi Disposisi</td>
            <td>${d.pemberi_disposisi}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Diteruskan Kepada</td>
            <td style="font-weight: bold; color: #0d5c3a;">${d.target_unit_name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Prioritas & Batas Waktu</td>
            <td>${d.prioritas} (Batas Waktu: ${d.deadline})</td>
          </tr>
        </table>

        <div style="border: 2px solid #0d5c3a; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #0d5c3a;">INSTRUKSI / PETUNJUK TINDAK LANJUT:</h4>
          <p style="font-size: 11pt; line-height: 1.6; white-space: pre-line;">${d.instruksi}</p>
        </div>

        <div style="border: 1px solid #94a3b8; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #334155;">CATATAN TINDAK LANJUT DARI UNIT KERJA:</h4>
          <p style="font-size: 11pt; line-height: 1.6; white-space: pre-line;">${d.catatan_tindak_lanjut || 'Belum ada catatan tindak lanjut yang dimasukkan.'}</p>
        </div>
      `
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-[#0d5c3a]" />
            Disposisi Surat Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penerusan instruksi pimpinan ma'had, pelacakan tindak lanjut unit, dan pemantauan deadline
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs self-start"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari surat, instruksi, unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="Baru">Baru</option>
            <option value="Diterima">Diterima Unit</option>
            <option value="Diproses">Sedang Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>

          {currentUser.role_id !== 'unit_reporter' && (
            <select
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 max-w-[180px] truncate"
            >
              <option value="all">Semua Unit</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Surat Rujukan</th>
                <th className="px-4 py-3">Unit Penerima</th>
                <th className="px-4 py-3">Instruksi Disposisi</th>
                <th className="px-4 py-3">Prioritas & Batas Waktu</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      icon={Workflow}
                      title="Belum ada data disposisi"
                      description="Disposisi dapat diterbitkan melalui modul Surat Masuk dengan menekan tombol Disposisi."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(disp => (
                  <tr key={disp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-mono font-bold text-slate-800 line-clamp-1">{disp.letter_nomor}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{disp.letter_perihal}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {disp.target_unit_name}
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <p className="text-slate-800 line-clamp-2">{disp.instruksi}</p>
                      {disp.catatan_tindak_lanjut && (
                        <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Tindak lanjut: {disp.catatan_tindak_lanjut}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="mb-1">
                        <PriorityBadge priority={disp.prioritas} />
                      </div>
                      <DeadlineIndicator deadline={disp.deadline} status={disp.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={disp.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => setDetailDisp(disp)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Lihat Detail Disposisi"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Action for Unit or Admin to input follow up */}
                      <button
                        type="button"
                        onClick={() => {
                          setFollowUpDisp(disp);
                          setFollowUpText(disp.catatan_tindak_lanjut || '');
                        }}
                        className="p-1.5 text-[#0d5c3a] hover:text-[#09472c] hover:bg-emerald-50 rounded-md"
                        title="Input Catatan Tindak Lanjut"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrint(disp)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Cetak Lembar Disposisi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailDisp}
        onClose={() => setDetailDisp(null)}
        title="Detail Disposisi Surat"
        subtitle={detailDisp?.letter_nomor}
        maxWidth="lg"
      >
        {detailDisp && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono text-slate-500 block mb-1">{detailDisp.letter_nomor}</span>
              <h4 className="text-sm font-bold text-slate-800">{detailDisp.letter_perihal}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Pemberi Disposisi</span>
                <span className="font-semibold text-slate-800">{detailDisp.pemberi_disposisi}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Unit Tujuan</span>
                <span className="font-semibold text-[#0d5c3a]">{detailDisp.target_unit_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Disposisi</span>
                <span className="font-medium text-slate-700">{detailDisp.tanggal_disposisi}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Batas Waktu</span>
                <span className="font-medium text-slate-700">{detailDisp.deadline}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Instruksi Pimpinan:</span>
              <p className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 text-slate-800 leading-relaxed">
                {detailDisp.instruksi}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">Catatan Tindak Lanjut Unit:</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                {detailDisp.catatan_tindak_lanjut || 'Belum ada catatan tindak lanjut.'}
              </p>
            </div>

            {/* Quick Status Control */}
            <div className="p-3 bg-slate-100 rounded-lg flex items-center justify-between">
              <span className="font-medium text-slate-700">Perbarui Status Disposisi:</span>
              <div className="flex gap-2">
                {detailDisp.status === 'Baru' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailDisp.id, 'Diterima')}
                    className="px-2.5 py-1 bg-blue-600 text-white rounded font-medium text-xs hover:bg-blue-700"
                  >
                    Terima Disposisi
                  </button>
                )}
                {detailDisp.status === 'Diterima' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailDisp.id, 'Diproses')}
                    className="px-2.5 py-1 bg-purple-600 text-white rounded font-medium text-xs hover:bg-purple-700"
                  >
                    Proses Tindak Lanjut
                  </button>
                )}
                {detailDisp.status !== 'Selesai' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(detailDisp.id, 'Selesai')}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded font-medium text-xs hover:bg-emerald-700"
                  >
                    Tandai Selesai
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handlePrint(detailDisp)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Lembar Disposisi
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* INPUT TINDAK LANJUT MODAL */}
      <Modal
        isOpen={!!followUpDisp}
        onClose={() => setFollowUpDisp(null)}
        title="Input Catatan Tindak Lanjut"
        subtitle={`Disposisi: ${followUpDisp?.letter_nomor}`}
        maxWidth="md"
      >
        {followUpDisp && (
          <form onSubmit={handleFollowUpSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-800">{followUpDisp.letter_perihal}</p>
              <p className="text-slate-500 mt-1">Instruksi: {followUpDisp.instruksi}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Laporan / Tindak Lanjut dari Unit *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Tuliskan tindakan yang telah atau sedang diambil oleh unit kerja..."
                value={followUpText}
                onChange={e => setFollowUpText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setFollowUpDisp(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg"
              >
                Simpan Tindak Lanjut
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
