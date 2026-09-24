import React, { useState } from 'react';
import {
  Mail,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Workflow,
  Eye,
  Trash2,
  Paperclip
} from 'lucide-react';
import { LetterIn, LetterPriority, LetterInStatus, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface SuratMasukProps {
  currentUser: User;
  activeMahadId: MahadId;
  onNavigateToDisposisi?: (letterId: string) => void;
}

export const SuratMasuk: React.FC<SuratMasukProps> = ({
  currentUser,
  activeMahadId,
  onNavigateToDisposisi
}) => {
  const [search, setSearch] = useState('');
  const [filterSifat, setFilterSifat] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailLetter, setDetailLetter] = useState<LetterIn | null>(null);
  const [disposisiLetter, setDisposisiLetter] = useState<LetterIn | null>(null);

  // Form states for new Letter
  const [formNomor, setFormNomor] = useState('');
  const [formAgenda, setFormAgenda] = useState(`AG-${activeMahadId === 'mahad-banat' ? 'LBT' : 'LBN'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [formPengirim, setFormPengirim] = useState('');
  const [formPerihal, setFormPerihal] = useState('');
  const [formTujuan, setFormTujuan] = useState(activeMahadId === 'mahad-banat' ? "Mudir Ma'had Lil Banat" : "Mudir Ma'had Lil Banin");
  const [formTanggalSurat, setFormTanggalSurat] = useState(new Date().toISOString().split('T')[0]);
  const [formTanggalDiterima, setFormTanggalDiterima] = useState(new Date().toISOString().split('T')[0]);
  const [formSifat, setFormSifat] = useState<LetterPriority>('Biasa');
  const [formKlasifikasi, setFormKlasifikasi] = useState('01/UMUM');
  const [formRingkasan, setFormRingkasan] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formFileName, setFormFileName] = useState('');

  // Disposisi modal state
  const [dispTargetUnit, setDispTargetUnit] = useState('');
  const [dispInstruksi, setDispInstruksi] = useState('');
  const [dispPrioritas, setDispPrioritas] = useState<LetterPriority>('Penting');
  const [dispDeadline, setDispDeadline] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  const letters = db.getLettersIn(activeMahadId);
  const units = db.getUnits(activeMahadId === 'all' ? undefined : activeMahadId);
  const canCreate = auth.hasPermission('letters.in.create');

  const filteredLetters = letters.filter(l => {
    const matchSearch =
      l.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
      l.pengirim.toLowerCase().includes(search.toLowerCase()) ||
      l.perihal.toLowerCase().includes(search.toLowerCase()) ||
      l.nomor_agenda.toLowerCase().includes(search.toLowerCase());

    const matchSifat = filterSifat === 'all' || l.sifat === filterSifat;
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;

    return matchSearch && matchSifat && matchStatus;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomor || !formPengirim || !formPerihal) {
      alert('Mohon lengkapi nomor surat, pengirim, dan perihal.');
      return;
    }

    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;

    db.createLetterIn(
      {
        mahad_id: targetMahad,
        nomor_surat: formNomor,
        nomor_agenda: formAgenda,
        tanggal_surat: formTanggalSurat,
        tanggal_diterima: formTanggalDiterima,
        pengirim: formPengirim,
        perihal: formPerihal,
        tujuan: formTujuan,
        sifat: formSifat,
        klasifikasi: formKlasifikasi,
        ringkasan: formRingkasan,
        lampiran_count: formFileName ? 1 : 0,
        file_name: formFileName || undefined,
        status: 'Diterima',
        catatan: formCatatan,
        petugas_penerima: currentUser.name,
        created_by: currentUser.id
      },
      currentUser
    );

    setIsCreateOpen(false);
    // Reset form
    setFormNomor('');
    setFormPengirim('');
    setFormPerihal('');
    setFormRingkasan('');
    setFormCatatan('');
    setFormFileName('');
  };

  const handleDisposisiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposisiLetter || !dispTargetUnit || !dispInstruksi) {
      alert('Pilih unit tujuan dan instruksi disposisi.');
      return;
    }

    const targetUnitObj = units.find(u => u.id === dispTargetUnit);

    db.createDisposition(
      {
        mahad_id: disposisiLetter.mahad_id,
        letter_in_id: disposisiLetter.id,
        letter_nomor: disposisiLetter.nomor_surat,
        letter_perihal: disposisiLetter.perihal,
        pemberi_disposisi: currentUser.name,
        target_unit_id: dispTargetUnit,
        target_unit_name: targetUnitObj?.name || 'Unit Terkait',
        instruksi: dispInstruksi,
        prioritas: dispPrioritas,
        deadline: dispDeadline,
        status: 'Baru',
        tanggal_disposisi: new Date().toISOString().split('T')[0]
      },
      currentUser
    );

    setDisposisiLetter(null);
    setDispInstruksi('');
    setDispTargetUnit('');
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Surat_Masuk_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filteredLetters.map(l => ({
        'No. Agenda': l.nomor_agenda,
        'No. Surat': l.nomor_surat,
        'Tanggal Surat': l.tanggal_surat,
        'Tanggal Diterima': l.tanggal_diterima,
        Pengirim: l.pengirim,
        Perihal: l.perihal,
        Sifat: l.sifat,
        Status: l.status,
        Penerima: l.petugas_penerima
      }))
    );
  };

  const handlePrint = (letter: LetterIn) => {
    printDocument({
      title: 'LEMBAR PENCATATAN SURAT MASUK & DISPOSISI',
      documentNumber: letter.nomor_surat,
      mahadName: letter.mahad_id === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      date: letter.tanggal_diterima,
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 25%; font-weight: bold; background: #f8fafc;">Nomor Agenda</td>
            <td style="width: 25%;">${letter.nomor_agenda}</td>
            <td style="width: 25%; font-weight: bold; background: #f8fafc;">Sifat Surat</td>
            <td style="width: 25%;">${letter.sifat}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Nomor Surat Asli</td>
            <td>${letter.nomor_surat}</td>
            <td style="font-weight: bold; background: #f8fafc;">Tanggal Diterima</td>
            <td>${letter.tanggal_diterima}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Pengirim</td>
            <td colspan="3">${letter.pengirim}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Perihal</td>
            <td colspan="3" style="font-weight: bold;">${letter.perihal}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Ringkasan Isi</td>
            <td colspan="3">${letter.ringkasan || '-'}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc;">Petugas Penerima</td>
            <td colspan="3">${letter.petugas_penerima} (Sekretariat Ma'had)</td>
          </tr>
        </table>

        <div style="border: 2px dashed #0d5c3a; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #0d5c3a; font-size: 12pt; text-decoration: underline;">
            KOLOM INSTRUKSI DISPOSISI MUDIR MA'HAD:
          </h4>
          <div style="min-height: 120px; font-size: 11pt; color: #333;">
            <p style="margin: 0 0 8px 0;">[  ] Tindak lanjuti segera</p>
            <p style="margin: 0 0 8px 0;">[  ] Siapkan draf balasan / surat tugas</p>
            <p style="margin: 0 0 8px 0;">[  ] Koordinasikan dalam rapat mingguan</p>
            <p style="margin: 0 0 8px 0;">[  ] Arsipkan</p>
            <p style="margin: 15px 0 0 0; font-style: italic; color: #666;">Catatan Khusus: __________________________________________________________________</p>
          </div>
        </div>
      `
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#0d5c3a]" />
            Administrasi Surat Masuk
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan, penomoran agenda, penerusan disposisi, dan pengarsipan surat masuk Ma’had
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Excel/CSV
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Catat Surat Masuk
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor, pengirim, atau perihal..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 focus:border-[#0d5c3a]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterSifat}
            onChange={e => setFilterSifat(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          >
            <option value="all">Semua Sifat</option>
            <option value="Biasa">Biasa</option>
            <option value="Penting">Penting</option>
            <option value="Segera">Segera</option>
            <option value="Rahasia">Rahasia</option>
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          >
            <option value="all">Semua Status</option>
            <option value="Diterima">Diterima</option>
            <option value="Didisposisi">Didisposisi</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
            <option value="Diarsipkan">Diarsipkan</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Agenda & Surat</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Pengirim</th>
                <th className="px-4 py-3">Perihal & Ringkasan</th>
                <th className="px-4 py-3">Sifat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <EmptyState
                      icon={Mail}
                      title="Belum ada surat masuk"
                      description="Belum ada arsip surat masuk yang sesuai filter. Catat surat masuk baru melalui tombol di atas."
                    />
                  </td>
                </tr>
              ) : (
                filteredLetters.map(letter => (
                  <tr key={letter.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-800">{letter.nomor_agenda}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{letter.nomor_surat}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{letter.tanggal_diterima}</div>
                      <div className="text-[10px] text-slate-400">Surat: {letter.tanggal_surat}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">
                      {letter.pengirim}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-slate-800 line-clamp-1">{letter.perihal}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{letter.ringkasan}</div>
                      {letter.file_name && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 font-medium">
                          <Paperclip className="w-3 h-3" />
                          {letter.file_name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={letter.sifat} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={letter.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                      <button
                        type="button"
                        onClick={() => setDetailLetter(letter)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                        title="Lihat Detail Surat"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDisposisiLetter(letter);
                          setDispTargetUnit(units[0]?.id || '');
                        }}
                        className="p-1.5 text-[#0d5c3a] hover:text-[#09472c] hover:bg-emerald-50 rounded-md transition-colors"
                        title="Buat Disposisi Surat Ini"
                      >
                        <Workflow className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrint(letter)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
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

      {/* MODAL CATAT SURAT MASUK */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Catat Surat Masuk Baru"
        subtitle="Formulir resmi registrasi agenda surat masuk ke Ma’had"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Asli *</label>
              <input
                type="text"
                required
                placeholder="cth: 042/REK/UNIA/IX/2026"
                value={formNomor}
                onChange={e => setFormNomor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 focus:border-[#0d5c3a]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Agenda Internal *</label>
              <input
                type="text"
                required
                value={formAgenda}
                onChange={e => setFormAgenda(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Surat *</label>
              <input
                type="date"
                required
                value={formTanggalSurat}
                onChange={e => setFormTanggalSurat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Diterima *</label>
              <input
                type="date"
                required
                value={formTanggalDiterima}
                onChange={e => setFormTanggalDiterima(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instansi / Nama Pengirim *</label>
              <input
                type="text"
                required
                placeholder="cth: Rektorat UNIA / Kemenag"
                value={formPengirim}
                onChange={e => setFormPengirim(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tujuan / Penerima *</label>
              <input
                type="text"
                required
                value={formTujuan}
                onChange={e => setFormTujuan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Perihal Surat *</label>
            <input
              type="text"
              required
              placeholder="cth: Undangan Rapat Kerja Koordinasi Pesantren se-Madura"
              value={formPerihal}
              onChange={e => setFormPerihal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sifat Surat</label>
              <select
                value={formSifat}
                onChange={e => setFormSifat(e.target.value as LetterPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Klasifikasi Surat</label>
              <input
                type="text"
                value={formKlasifikasi}
                onChange={e => setFormKlasifikasi(e.target.value)}
                placeholder="cth: 01/AKAD/ORIENTASI"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Ringkasan Isi Surat</label>
            <textarea
              rows={3}
              placeholder="Tuliskan intisari atau pokok isi surat..."
              value={formRingkasan}
              onChange={e => setFormRingkasan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama File / Lampiran Digital (PDF)</label>
            <input
              type="text"
              placeholder="cth: Surat_Rektorat_Orientasi_2026.pdf"
              value={formFileName}
              onChange={e => setFormFileName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
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
              Simpan Surat Masuk
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETAIL SURAT MASUK */}
      <Modal
        isOpen={!!detailLetter}
        onClose={() => setDetailLetter(null)}
        title="Detail Surat Masuk"
        subtitle={detailLetter?.nomor_surat}
        maxWidth="xl"
      >
        {detailLetter && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-500">Agenda: {detailLetter.nomor_agenda}</span>
                <StatusBadge status={detailLetter.status} />
              </div>
              <h4 className="text-sm font-bold text-slate-800">{detailLetter.perihal}</h4>
              <p className="text-slate-600 font-medium">Pengirim: {detailLetter.pengirim}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Surat</span>
                <span className="font-medium">{detailLetter.tanggal_surat}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Tanggal Diterima</span>
                <span className="font-medium">{detailLetter.tanggal_diterima}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Sifat Surat</span>
                <PriorityBadge priority={detailLetter.sifat} />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Petugas Penerima</span>
                <span className="font-medium">{detailLetter.petugas_penerima}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] mb-1">Ringkasan</span>
              <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                {detailLetter.ringkasan || 'Tidak ada ringkasan.'}
              </p>
            </div>

            {detailLetter.file_name && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <div>
                    <div className="font-medium text-emerald-900">{detailLetter.file_name}</div>
                    <div className="text-[10px] text-emerald-600">Dokumen Arsip Digital Terlampir</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Mengunduh berkas aman: ${detailLetter.file_name}`)}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded"
                >
                  Unduh
                </button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handlePrint(detailLetter)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Lembar Disposisi
              </button>
              <button
                type="button"
                onClick={() => {
                  const curr = detailLetter;
                  setDetailLetter(null);
                  setDisposisiLetter(curr);
                  setDispTargetUnit(units[0]?.id || '');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg flex items-center gap-1.5"
              >
                <Workflow className="w-3.5 h-3.5" />
                Disposisi Sekarang
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL BUAT DISPOSISI SURAT */}
      <Modal
        isOpen={!!disposisiLetter}
        onClose={() => setDisposisiLetter(null)}
        title="Terbitkan Disposisi Surat"
        subtitle={`Surat No: ${disposisiLetter?.nomor_surat}`}
        maxWidth="lg"
      >
        {disposisiLetter && (
          <form onSubmit={handleDisposisiSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900 block">{disposisiLetter.perihal}</span>
              <span className="text-[11px] text-amber-700">Pengirim: {disposisiLetter.pengirim}</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Tujuan Disposisi *</label>
              <select
                required
                value={dispTargetUnit}
                onChange={e => setDispTargetUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium"
              >
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.head_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instruksi / Arahan Pimpinan *</label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan arahan tindak lanjut secara jelas dan terukur..."
                value={dispInstruksi}
                onChange={e => setDispInstruksi(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tingkat Prioritas</label>
                <select
                  value={dispPrioritas}
                  onChange={e => setDispPrioritas(e.target.value as LetterPriority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Biasa">Biasa</option>
                  <option value="Penting">Penting</option>
                  <option value="Segera">Segera</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batas Waktu (Deadline) *</label>
                <input
                  type="date"
                  required
                  value={dispDeadline}
                  onChange={e => setDispDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setDisposisiLetter(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg shadow-xs"
              >
                Kirim Disposisi ke Unit
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
