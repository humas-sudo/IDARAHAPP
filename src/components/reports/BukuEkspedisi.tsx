import React, { useState } from 'react';
import {
  Send,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle,
  Truck,
  UserCheck
} from 'lucide-react';
import { MahadId, User } from '../../types';
import { db } from '../../services/db';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV, printDocument } from '../../services/export';

interface BukuEkspedisiProps {
  currentUser: User;
  activeMahadId: MahadId;
}

interface EkspedisiItem {
  id: string;
  nomor_surat: string;
  perihal: string;
  tujuan_penerima: string;
  nama_penerima_tanda_tangan?: string;
  tanggal_kirim: string;
  kurir_pengantar: string;
  status: 'Terkirim' | 'Dalam Pengiriman' | 'Pending';
  catatan?: string;
}

export const BukuEkspedisi: React.FC<BukuEkspedisiProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Initialize expedition records
  const [items, setItems] = useState<EkspedisiItem[]>([
    {
      id: 'EXP-001',
      nomor_surat: '089/MHD-LBN/UNIA/IX/2026',
      perihal: 'Undangan Koordinasi Pengasuhan Asrama',
      tujuan_penerima: 'Biro Pengasuhan & Kedisiplinan Santri',
      nama_penerima_tanda_tangan: 'Ust. Ahmad Fauzi',
      tanggal_kirim: '2026-09-18',
      kurir_pengantar: 'Staff Sekretariat (Fathur)',
      status: 'Terkirim',
      catatan: 'Diterima di kantor biro gedung barat lt 1'
    },
    {
      id: 'EXP-002',
      nomor_surat: '090/MHD-LBN/UNIA/IX/2026',
      perihal: 'Permohonan Narasumber Kajian Kitab Kuning',
      tujuan_penerima: 'Fakultas Tarbiyah UNIA',
      nama_penerima_tanda_tangan: 'Ibu Siti Aminah (TU Dekanat)',
      tanggal_kirim: '2026-09-19',
      kurir_pengantar: 'Staff Sekretariat (Fathur)',
      status: 'Terkirim',
      catatan: 'Diserahkan via staf administrasi fakultas'
    },
    {
      id: 'EXP-003',
      nomor_surat: '092/MHD-LBN/UNIA/IX/2026',
      perihal: 'Pemberitahuan Ujian Tahfidz Al-Qur’an Juz 30',
      tujuan_penerima: 'Seluruh Wali Mahasantri Baru',
      tanggal_kirim: '2026-09-20',
      kurir_pengantar: 'Kurir Internal / Pos',
      status: 'Dalam Pengiriman',
      catatan: 'Sebagian terkirim via kurir pesantren dan daring'
    }
  ]);

  const [formNomor, setFormNomor] = useState('');
  const [formPerihal, setFormPerihal] = useState('');
  const [formTujuan, setFormTujuan] = useState('');
  const [formPenerima, setFormPenerima] = useState('');
  const [formKurir, setFormKurir] = useState(currentUser.name);
  const [formCatatan, setFormCatatan] = useState('');

  const filtered = items.filter(
    i =>
      i.nomor_surat.toLowerCase().includes(search.toLowerCase()) ||
      i.perihal.toLowerCase().includes(search.toLowerCase()) ||
      i.tujuan_penerima.toLowerCase().includes(search.toLowerCase()) ||
      (i.nama_penerima_tanda_tangan && i.nama_penerima_tanda_tangan.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomor || !formPerihal || !formTujuan) {
      alert('Nomor surat, perihal, dan tujuan wajib diisi.');
      return;
    }

    const newItem: EkspedisiItem = {
      id: `EXP-${String(items.length + 1).padStart(3, '0')}`,
      nomor_surat: formNomor,
      perihal: formPerihal,
      tujuan_penerima: formTujuan,
      nama_penerima_tanda_tangan: formPenerima,
      tanggal_kirim: new Date().toISOString().split('T')[0],
      kurir_pengantar: formKurir,
      status: formPenerima ? 'Terkirim' : 'Dalam Pengiriman',
      catatan: formCatatan
    };

    setItems([newItem, ...items]);
    setIsCreateOpen(false);
    setFormNomor('');
    setFormPerihal('');
    setFormTujuan('');
    setFormPenerima('');
  };

  const handleTandaTanganTerima = (id: string) => {
    const penerima = prompt('Masukkan nama lengkap penerima surat / dokumen:');
    if (!penerima) return;

    setItems(
      items.map(it =>
        it.id === id
          ? {
              ...it,
              nama_penerima_tanda_tangan: penerima,
              status: 'Terkirim'
            }
          : it
      )
    );
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Buku_Ekspedisi_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(i => ({
        'ID Ekspedisi': i.id,
        'Nomor Surat': i.nomor_surat,
        Perihal: i.perihal,
        'Tujuan / Penerima': i.tujuan_penerima,
        'Tanda Tangan Penerima': i.nama_penerima_tanda_tangan || '-',
        'Tanggal Kirim': i.tanggal_kirim,
        'Kurir Pengantar': i.kurir_pengantar,
        Status: i.status,
        Catatan: i.catatan || '-'
      }))
    );
  };

  const handlePrint = () => {
    printDocument({
      title: 'BUKU EKSPEDISI SURAT & DOKUMEN DINAS',
      period: `Per Tanggal ${new Date().toLocaleDateString('id-ID')}`,
      mahadName: activeMahadId === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th style="padding: 6px; border: 1px solid #333; text-align: center;">No.</th>
              <th style="padding: 6px; border: 1px solid #333;">Tanggal & No. Surat</th>
              <th style="padding: 6px; border: 1px solid #333;">Perihal</th>
              <th style="padding: 6px; border: 1px solid #333;">Tujuan Surat</th>
              <th style="padding: 6px; border: 1px solid #333;">Nama Penerima</th>
              <th style="padding: 6px; border: 1px solid #333; text-align: center; width: 15%;">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                (item, idx) => `
              <tr>
                <td style="padding: 6px; border: 1px solid #333; text-align: center;">${idx + 1}.</td>
                <td style="padding: 6px; border: 1px solid #333;">
                  ${item.tanggal_kirim}<br>
                  <small style="font-family: monospace;">${item.nomor_surat}</small>
                </td>
                <td style="padding: 6px; border: 1px solid #333;">${item.perihal}</td>
                <td style="padding: 6px; border: 1px solid #333;">${item.tujuan_penerima}</td>
                <td style="padding: 6px; border: 1px solid #333;">${item.nama_penerima_tanda_tangan || '-'}</td>
                <td style="padding: 6px; border: 1px solid #333; height: 35px;"></td>
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
            <Truck className="w-6 h-6 text-[#0d5c3a]" />
            Buku Ekspedisi Pengiriman Surat
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan pengiriman fisik surat keluar, bukti tanda terima, dan tanda tangan unit penerima
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Lembar Ekspedisi
          </button>

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
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Catat Pengiriman Baru
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor surat, tujuan, atau penerima..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">No. Ekspedisi & Tgl</th>
                <th className="px-4 py-3">Nomor Surat & Perihal</th>
                <th className="px-4 py-3">Tujuan Pengiriman</th>
                <th className="px-4 py-3">Penerima & Kurir</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <EmptyState
                      icon={Truck}
                      title="Belum ada catatan ekspedisi"
                      description="Klik 'Catat Pengiriman Baru' untuk mencatat bukti penyerahan surat keluar kepada tujuan."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800">{item.id}</span>
                      <div className="text-[10px] text-slate-400">{item.tanggal_kirim}</div>
                    </td>
                    <td className="px-4 py-3 max-w-sm">
                      <div className="font-mono text-[11px] font-semibold text-slate-800">{item.nomor_surat}</div>
                      <div className="text-slate-600 line-clamp-1">{item.perihal}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {item.tujuan_penerima}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.nama_penerima_tanda_tangan ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {item.nama_penerima_tanda_tangan}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum tanda tangan</span>
                      )}
                      <div className="text-[10px] text-slate-400">Kurir: {item.kurir_pengantar}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Terkirim'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.status !== 'Terkirim' && (
                        <button
                          type="button"
                          onClick={() => handleTandaTanganTerima(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-300 rounded-md"
                        >
                          Tanda Terima
                        </button>
                      )}
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
        title="Catat Ekspedisi Pengiriman Surat"
        subtitle="Registrasi bukti penyerahan dokumen dinas Ma’had UNIA"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Surat Dinas *</label>
            <input
              type="text"
              required
              placeholder="cth: 095/MHD-LBN/UNIA/IX/2026"
              value={formNomor}
              onChange={e => setFormNomor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Perihal Dokumen *</label>
            <input
              type="text"
              required
              placeholder="cth: Surat Edaran Tata Tertib Keasramaan Santri Baru"
              value={formPerihal}
              onChange={e => setFormPerihal(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Instansi / Unit Tujuan *</label>
            <input
              type="text"
              required
              placeholder="cth: Biro Pengasuhan / Fakultas Tarbiyah / Luar Kampus"
              value={formTujuan}
              onChange={e => setFormTujuan(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Petugas / Kurir Pengantar</label>
              <input
                type="text"
                value={formKurir}
                onChange={e => setFormKurir(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Penerima (Jika langsung diterima)</label>
              <input
                type="text"
                placeholder="cth: Ust. Ahmad Fauzi"
                value={formPenerima}
                onChange={e => setFormPenerima(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Catatan Pengiriman / Lokasi Serah Terima</label>
            <input
              type="text"
              value={formCatatan}
              onChange={e => setFormCatatan(e.target.value)}
              placeholder="cth: Diterima langsung di meja piket sekretariat"
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
              Simpan ke Buku Ekspedisi
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
