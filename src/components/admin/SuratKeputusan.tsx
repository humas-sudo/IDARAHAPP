import React, { useState } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Download,
  Printer,
  Eye,
  Paperclip,
  CheckCircle
} from 'lucide-react';
import { Decision, DecisionStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface SuratKeputusanProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const SuratKeputusan: React.FC<SuratKeputusanProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailSK, setDetailSK] = useState<Decision | null>(null);

  const decisions = db.getDecisions(activeMahadId);
  const canCreate = auth.hasPermission('decisions.create');

  const mahadCode = activeMahadId === 'mahad-banat' ? 'LBT' : 'LBN';
  const autoSKNumber = `SK-${String(decisions.length + 1).padStart(3, '0')}/MHD-${mahadCode}/UNIA/${new Date().getFullYear()}`;

  const [formNomor, setFormNomor] = useState(autoSKNumber);
  const [formJudul, setFormJudul] = useState('');
  const [formTentang, setFormTentang] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formPenandatangan, setFormPenandatangan] = useState(
    activeMahadId === 'mahad-banat'
      ? "Nyai Hj. Nurul Hidayah, M.A (Mudir Ma'had Lil Banat)"
      : "K.H. Moh. Khoirul Umam, M.Pd.I (Mudir Ma'had Lil Banin)"
  );
  const [formDasarHukum, setFormDasarHukum] = useState(
    '1. Statuta Universitas Al-Amien Prenduan Bab V tentang Tata Kelola Keasramaan;\n2. Piagam Pendirian Pondok Pesantren Al-Amien Prenduan;\n3. Musyawarah Majelis Pimpinan Ma’had UNIA.'
  );
  const [formCatatan, setFormCatatan] = useState(
    'PERTAMA: Menetapkan nama-nama terlampir pada jabatan yang bersangkutan.\nKEDUA: Melaksanakan amanah dengan penuh integritas dan keikhlasan.\nKETIGA: Keputusan ini berlaku sejak tanggal ditetapkan.'
  );
  const [formFileName, setFormFileName] = useState('');

  const filteredDecisions = decisions.filter(d => {
    const matchSearch =
      d.nomor_sk.toLowerCase().includes(search.toLowerCase()) ||
      d.judul.toLowerCase().includes(search.toLowerCase()) ||
      d.tentang.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomor || !formTentang || !formJudul) {
      alert('Lengkapi nomor SK, judul lengkap, dan pokok perihal (tentang).');
      return;
    }

    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;

    db.createDecision(
      {
        mahad_id: targetMahad,
        nomor_sk: formNomor,
        judul: formJudul,
        tentang: formTentang,
        tanggal: formTanggal,
        pejabat_penandatangan: formPenandatangan,
        dasar_hukum: formDasarHukum,
        lampiran_count: 1,
        file_name: formFileName || undefined,
        status: 'Disahkan',
        catatan: formCatatan,
        created_by: currentUser.name
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormJudul('');
    setFormTentang('');
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Surat_Keputusan_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filteredDecisions.map(d => ({
        'Nomor SK': d.nomor_sk,
        Judul: d.judul,
        Tentang: d.tentang,
        Tanggal: d.tanggal,
        Penandatangan: d.pejabat_penandatangan,
        Status: d.status
      }))
    );
  };

  const handlePrint = (sk: Decision) => {
    printDocument({
      title: 'SURAT KEPUTUSAN PIMPINAN MA’HAD',
      documentNumber: sk.nomor_sk,
      mahadName: sk.mahad_id === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      date: sk.tanggal,
      signatoryName: sk.pejabat_penandatangan,
      signatoryTitle: "Mudir Ma'had",
      contentHtml: `
        <div style="text-align: center; margin-bottom: 25px;">
          <h4 style="margin: 0; font-size: 13pt;">SURAT KEPUTUSAN</h4>
          <h3 style="margin: 5px 0; font-size: 12pt; text-transform: uppercase;">${sk.judul}</h3>
          <p style="margin-top: 15px; font-weight: bold;">TENTANG<br>${sk.tentang.toUpperCase()}</p>
          <p style="margin-top: 15px; font-weight: bold;">BISMILLAHIRRAHMANIRRAHIM<br>MUDIR MA'HAD UNIVERSITAS AL-AMIEN PRENDUAN,</p>
        </div>

        <table style="width: 100%; border: none; margin-bottom: 15px;">
          <tr style="border: none;">
            <td style="width: 18%; vertical-align: top; font-weight: bold; border: none;">Dasar Hukum</td>
            <td style="width: 3%; vertical-align: top; border: none;">:</td>
            <td style="vertical-align: top; border: none; white-space: pre-line;">${sk.dasar_hukum}</td>
          </tr>
        </table>

        <div style="text-align: center; margin: 20px 0; font-weight: bold;">
          MEMUTUSKAN:
        </div>

        <div style="white-space: pre-line; margin-left: 20px; line-height: 1.6; margin-bottom: 30px;">
          ${sk.catatan || 'Menetapkan keputusan sebagaimana tercantum dalam lampiran ini.'}
        </div>
      `
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-[#0d5c3a]" />
            Surat Keputusan (SK) Ma'had
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumen penetapan resmi, konsiderans hukum, diktum keputusan, dan pengarsipan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Terbitkan SK Baru
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
            placeholder="Cari nomor SK, judul, tentang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
        >
          <option value="all">Semua Status</option>
          <option value="Disahkan">Disahkan</option>
          <option value="Draft">Draft</option>
          <option value="Diperiksa">Diperiksa</option>
          <option value="Diarsipkan">Diarsipkan</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Nomor SK</th>
                <th className="px-4 py-3">Tentang / Perihal</th>
                <th className="px-4 py-3">Tanggal Penetapan</th>
                <th className="px-4 py-3">Penandatangan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDecisions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      icon={FileCheck2}
                      title="Belum ada arsip SK"
                      description="Belum ada surat keputusan pimpinan ma'had yang dicatat."
                    />
                  </td>
                </tr>
              ) : (
                filteredDecisions.map(sk => (
                  <tr key={sk.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {sk.nomor_sk}
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-semibold text-slate-800">{sk.tentang}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{sk.judul}</div>
                      {sk.file_name && (
                        <div className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                          <Paperclip className="w-3 h-3" />
                          {sk.file_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      <div>{sk.tanggal}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-[180px] truncate">{sk.pejabat_penandatangan}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={sk.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => setDetailSK(sk)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Lihat Konsiderans & Diktum"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePrint(sk)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Cetak Naskah SK Resmi"
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

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Terbitkan Surat Keputusan (SK)"
        subtitle="Format konsiderans resmi standar pimpinan Ma’had UNIA"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor SK *</label>
              <input
                type="text"
                required
                value={formNomor}
                onChange={e => setFormNomor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pejabat Penandatangan *</label>
              <input
                type="text"
                required
                value={formPenandatangan}
                onChange={e => setFormPenandatangan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul Lengkap SK *</label>
            <input
              type="text"
              required
              placeholder="cth: Keputusan Mudir Ma'had tentang Penetapan Pembina Asrama Mahasantri"
              value={formJudul}
              onChange={e => setFormJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tentang / Perihal Penetapan *</label>
            <input
              type="text"
              required
              placeholder="cth: Penetapan Pembina Asrama Mahasantri Semester Gasal 2026/2027"
              value={formTentang}
              onChange={e => setFormTentang(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tanggal Penetapan *</label>
            <input
              type="date"
              required
              value={formTanggal}
              onChange={e => setFormTanggal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Konsiderans / Dasar Hukum</label>
            <textarea
              rows={3}
              value={formDasarHukum}
              onChange={e => setFormDasarHukum(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Diktum / Isi Ketetapan *</label>
            <textarea
              rows={4}
              required
              value={formCatatan}
              onChange={e => setFormCatatan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Berkas PDF Resmi (Opsional)</label>
            <input
              type="text"
              placeholder="cth: SK_Pembina_Asrama_Gasal_2026.pdf"
              value={formFileName}
              onChange={e => setFormFileName(e.target.value)}
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
              Tetapkan & Sahkan SK
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailSK}
        onClose={() => setDetailSK(null)}
        title="Naskah Keputusan (SK)"
        subtitle={detailSK?.nomor_sk}
        maxWidth="xl"
      >
        {detailSK && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-mono text-slate-500 block mb-1">{detailSK.nomor_sk}</span>
              <h4 className="text-sm font-bold text-slate-900">{detailSK.judul}</h4>
              <p className="text-slate-600 mt-1">Tentang: <strong>{detailSK.tentang}</strong></p>
              <p className="text-slate-500 text-[11px] mt-0.5">Ditetapkan oleh: {detailSK.pejabat_penandatangan} ({detailSK.tanggal})</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">DASAR HUKUM / KONSIDERANS:</span>
              <p className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700 whitespace-pre-line text-[11px]">
                {detailSK.dasar_hukum}
              </p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-1">MEMUTUSKAN / DIKTUM:</span>
              <p className="p-3 bg-emerald-50/50 rounded border border-emerald-200 text-slate-800 whitespace-pre-line leading-relaxed text-[11px]">
                {detailSK.catatan || 'Ketetapan telah disahkan dan diarsipkan.'}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handlePrint(detailSK)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Format Lengkap Naskah SK
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
