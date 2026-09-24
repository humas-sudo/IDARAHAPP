import React, { useState } from 'react';
import {
  Archive as ArchiveIcon,
  Plus,
  Search,
  Download,
  FileText,
  Tag,
  Folder,
  Eye,
  Paperclip
} from 'lucide-react';
import { Archive, MahadId, User } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { exportToCSV } from '../../services/export';

interface ArsipDigitalProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const ArsipDigital: React.FC<ArsipDigitalProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailArchive, setDetailArchive] = useState<Archive | null>(null);

  const archives = db.getArchives(activeMahadId);
  const canCreate = auth.hasPermission('archives.manage');

  const [formNomor, setFormNomor] = useState(
    `ARS-${activeMahadId === 'mahad-banat' ? 'LBT' : 'LBN'}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [formJudul, setFormJudul] = useState('');
  const [formKategori, setFormKategori] = useState<Archive['kategori']>('Surat Keluar');
  const [formTahun, setFormTahun] = useState(new Date().getFullYear());
  const [formTags, setFormTags] = useState('resmi, administrasi, 2026');
  const [formFileName, setFormFileName] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  const filtered = archives.filter(a => {
    const matchSearch =
      a.nomor_dokumen.toLowerCase().includes(search.toLowerCase()) ||
      a.judul.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      a.unit_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || a.kategori === filterCategory;
    return matchSearch && matchCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomor || !formJudul) {
      alert('Nomor dokumen dan judul arsip wajib diisi.');
      return;
    }

    const targetMahad = activeMahadId === 'all' ? 'mahad-banin' : activeMahadId;
    const userUnit = db.getUnitById(currentUser.unit_id);

    db.createArchive(
      {
        mahad_id: targetMahad,
        nomor_dokumen: formNomor,
        judul: formJudul,
        kategori: formKategori,
        tahun: Number(formTahun),
        unit_id: currentUser.unit_id || 'unit-sekretariat-banin',
        unit_name: userUnit?.name || currentUser.position_title,
        tanggal: new Date().toISOString().split('T')[0],
        file_name: formFileName || 'Dokumen_Arsip_Terverifikasi.pdf',
        file_size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        deskripsi: formDeskripsi,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        created_by: currentUser.name
      },
      currentUser
    );

    setIsCreateOpen(false);
    setFormJudul('');
    setFormDeskripsi('');
  };

  const handleExportCSV = () => {
    exportToCSV(
      `Arsip_Digital_${activeMahadId}_${new Date().toISOString().split('T')[0]}`,
      filtered.map(a => ({
        'No. Dokumen': a.nomor_dokumen,
        Judul: a.judul,
        Kategori: a.kategori,
        Tahun: a.tahun,
        Unit: a.unit_name,
        Tanggal: a.tanggal,
        'Nama Berkas': a.file_name,
        Ukuran: a.file_size,
        Tags: a.tags.join(', '),
        Pengunggah: a.created_by
      }))
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ArchiveIcon className="w-6 h-6 text-[#0d5c3a]" />
            Arsip Digital Terpadu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Penyimpanan dokumen resmi, SK, surat dinas, dan berkas historis Ma'had UNIA
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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
              Unggah Arsip
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
            placeholder="Cari nomor dokumen, judul, tags, unit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">Semua Kategori</option>
            <option value="Surat Masuk">Surat Masuk</option>
            <option value="Surat Keluar">Surat Keluar</option>
            <option value="SK">Surat Keputusan (SK)</option>
            <option value="Notulensi">Notulensi Rapat</option>
            <option value="Laporan">Laporan Mingguan/Bulanan</option>
            <option value="Dokumen Rapat">Dokumen Rapat</option>
            <option value="Template">Template Format</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Grid of Archives */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-xl border border-slate-200 text-center">
            <EmptyState
              icon={ArchiveIcon}
              title="Tidak ada arsip ditemukan"
              description="Belum ada dokumen arsip yang tersimpan atau cocok dengan kata kunci pencarian Anda."
            />
          </div>
        ) : (
          filtered.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-[#0d5c3a] transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {item.nomor_dokumen}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#0d5c3a] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {item.kategori}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">{item.judul}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.deskripsi}</p>

                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {item.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Unit: {item.unit_name}</span>
                  <span className="text-slate-400">{item.file_size}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">Oleh: {item.created_by}</span>
                  <div className="space-x-1">
                    <button
                      type="button"
                      onClick={() => setDetailArchive(item)}
                      className="px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded"
                    >
                      Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => alert(`Mengunduh arsip: ${item.file_name}`)}
                      className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded"
                    >
                      Unduh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* UPLOAD MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Unggah Dokumen ke Arsip Digital"
        subtitle="Simpan salinan berkas resmi Ma’had UNIA"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nomor Dokumen / Registrasi *</label>
            <input
              type="text"
              required
              value={formNomor}
              onChange={e => setFormNomor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Judul / Perihal Dokumen *</label>
            <input
              type="text"
              required
              placeholder="cth: SK Mudir Pengangkatan Pengurus OSPMA 1447 H"
              value={formJudul}
              onChange={e => setFormJudul(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kategori Arsip</label>
              <select
                value={formKategori}
                onChange={e => setFormKategori(e.target.value as Archive['kategori'])}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="Surat Masuk">Surat Masuk</option>
                <option value="Surat Keluar">Surat Keluar</option>
                <option value="SK">Surat Keputusan (SK)</option>
                <option value="Notulensi">Notulensi Rapat</option>
                <option value="Laporan">Laporan</option>
                <option value="Dokumen Rapat">Dokumen Rapat</option>
                <option value="Template">Template</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tahun Dokumen</label>
              <input
                type="number"
                value={formTahun}
                onChange={e => setFormTahun(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kata Kunci / Label (Tags pisahkan koma)</label>
            <input
              type="text"
              value={formTags}
              onChange={e => setFormTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Berkas Digital (PDF / Docx)</label>
            <input
              type="text"
              placeholder="cth: SK_Pengurus_OSPMA_2026_Final.pdf"
              value={formFileName}
              onChange={e => setFormFileName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deskripsi Ringkas</label>
            <textarea
              rows={3}
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
              Simpan ke Arsip
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!detailArchive}
        onClose={() => setDetailArchive(null)}
        title="Detail Dokumen Arsip"
        subtitle={detailArchive?.nomor_dokumen}
        maxWidth="md"
      >
        {detailArchive && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono text-slate-500 block mb-1">{detailArchive.nomor_dokumen}</span>
              <h4 className="text-sm font-bold text-slate-900">{detailArchive.judul}</h4>
            </div>

            <p><strong className="text-slate-800">Kategori:</strong> {detailArchive.kategori}</p>
            <p><strong className="text-slate-800">Tahun:</strong> {detailArchive.tahun}</p>
            <p><strong className="text-slate-800">Unit:</strong> {detailArchive.unit_name}</p>
            <p><strong className="text-slate-800">Tanggal:</strong> {detailArchive.tanggal}</p>
            <p><strong className="text-slate-800">Nama File:</strong> {detailArchive.file_name} ({detailArchive.file_size})</p>
            <p><strong className="text-slate-800">Pengunggah:</strong> {detailArchive.created_by}</p>

            {detailArchive.deskripsi && (
              <div>
                <strong className="text-slate-800 block mb-1">Deskripsi:</strong>
                <p className="p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                  {detailArchive.deskripsi}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
