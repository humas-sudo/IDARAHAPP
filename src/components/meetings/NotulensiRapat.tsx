import React, { useState } from 'react';
import {
  FileText,
  Search,
  Printer,
  Edit3,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Users,
  Plus
} from 'lucide-react';
import { Meeting, MeetingMinute, User, MahadId } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { printDocument } from '../../services/export';

interface NotulensiRapatProps {
  currentUser: User;
  activeMahadId: MahadId;
}

export const NotulensiRapat: React.FC<NotulensiRapatProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [search, setSearch] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [editingMinute, setEditingMinute] = useState<MeetingMinute | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMinute, setPreviewMinute] = useState<MeetingMinute | null>(null);

  // Form states for notulensi
  const [formPokok, setFormPokok] = useState('');
  const [formHasil, setFormHasil] = useState('');
  const [formKeputusan, setFormKeputusan] = useState('');
  const [formNotulis, setFormNotulis] = useState(currentUser.name);
  const [formPeserta, setFormPeserta] = useState('');

  const meetings = db.getMeetings(activeMahadId);
  const minutes = db.getMinutes(activeMahadId);
  const canEdit =
    auth.hasPermission('meeting_minutes.create') ||
    auth.hasPermission('meeting_minutes.update') ||
    currentUser.role_id === 'admin_sekretariat' ||
    currentUser.role_id === 'super_admin';

  const filteredMinutes = minutes.filter(min => {
    return (
      min.judul_rapat.toLowerCase().includes(search.toLowerCase()) ||
      min.pokok_pembahasan.toLowerCase().includes(search.toLowerCase()) ||
      min.keputusan.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenCreateForMeeting = (m: Meeting) => {
    const existing = db.getMinuteByMeetingId(m.id);
    setSelectedMeeting(m);
    if (existing) {
      setEditingMinute(existing);
      setFormPokok(existing.pokok_pembahasan);
      setFormHasil(existing.hasil_pembahasan);
      setFormKeputusan(existing.keputusan);
      setFormNotulis(existing.notulis);
      setFormPeserta(existing.peserta.join(', '));
    } else {
      setEditingMinute(null);
      setFormPokok(`Pembahasan agenda utama: ${m.agenda}`);
      setFormHasil('');
      setFormKeputusan('');
      setFormNotulis(m.sekretaris_notulis || currentUser.name);
      setFormPeserta(m.peserta.join(', '));
    }
    setIsModalOpen(true);
  };

  const handleSaveMinute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    const pesertaList = formPeserta
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingMinute) {
      db.updateMinute(
        editingMinute.id,
        {
          pokok_pembahasan: formPokok,
          hasil_pembahasan: formHasil,
          keputusan: formKeputusan,
          notulis: formNotulis,
          peserta: pesertaList,
          status: 'Final'
        },
        'Pembaruan notulensi rapat',
        currentUser
      );
    } else {
      db.createMinute(
        {
          meeting_id: selectedMeeting.id,
          mahad_id: selectedMeeting.mahad_id,
          judul_rapat: selectedMeeting.judul_rapat,
          jenis_rapat: 'Rapat Koordinasi',
          tanggal: selectedMeeting.tanggal,
          waktu_mulai: selectedMeeting.waktu_mulai,
          waktu_selesai: selectedMeeting.waktu_selesai,
          tempat: selectedMeeting.tempat,
          pimpinan_rapat: selectedMeeting.pimpinan_rapat,
          notulis: formNotulis,
          peserta: pesertaList,
          agenda: selectedMeeting.agenda,
          pokok_pembahasan: formPokok,
          hasil_pembahasan: formHasil,
          keputusan: formKeputusan,
          status: 'Final',
          created_by: currentUser.name
        },
        currentUser
      );
    }

    setIsModalOpen(false);
  };

  const handlePrint = (min: MeetingMinute) => {
    printDocument({
      title: 'NOTULENSI RAPAT RESMI KEPESANTRENAN',
      documentNumber: `NOT-${min.id.slice(-6).toUpperCase()}/UNIA/${min.tanggal.split('-')[0]}`,
      mahadName: min.mahad_id === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      date: min.tanggal,
      signatoryName: min.notulis,
      signatoryTitle: 'Notulis Rapat',
      contentHtml: `
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Nama Rapat</td>
            <td colspan="3" style="font-weight: bold; font-size: 12pt; border: 1px solid #ddd; padding: 6px;">${min.judul_rapat}</td>
          </tr>
          <tr>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Hari / Tanggal</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${min.tanggal}</td>
            <td style="width: 25%; font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Waktu</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${min.waktu_mulai} - ${min.waktu_selesai} WIB</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Tempat</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${min.tempat}</td>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Pimpinan Rapat</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${min.pimpinan_rapat}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Notulis</td>
            <td style="border: 1px solid #ddd; padding: 6px;">${min.notulis}</td>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Versi Notulensi</td>
            <td style="border: 1px solid #ddd; padding: 6px;">v${min.version} (${min.status})</td>
          </tr>
          <tr>
            <td style="font-weight: bold; background: #f8fafc; border: 1px solid #ddd; padding: 6px;">Peserta Hadir</td>
            <td colspan="3" style="border: 1px solid #ddd; padding: 6px;">${min.peserta.join(', ') || '-'}</td>
          </tr>
        </table>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px; font-size: 12pt;">A. Pokok Pembahasan</h3>
          <div style="padding: 10px 0; font-size: 10.5pt; line-height: 1.6; white-space: pre-line;">${min.pokok_pembahasan || 'Belum diisi'}</div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px; font-size: 12pt;">B. Hasil Pembahasan</h3>
          <div style="padding: 10px 0; font-size: 10.5pt; line-height: 1.6; white-space: pre-line;">${min.hasil_pembahasan || 'Belum diisi'}</div>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #0d5c3a; border-bottom: 2px solid #0d5c3a; padding-bottom: 5px; font-size: 12pt;">C. Keputusan & Tindak Lanjut</h3>
          <div style="padding: 10px 0; font-size: 10.5pt; line-height: 1.6; white-space: pre-line;">${min.keputusan || 'Belum diisi'}</div>
        </div>
      `
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0d5c3a]" />
            Notulensi Rapat Kepesantrenan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi resmi hasil pembahasan, keputusan musyawarah, dan daftar kehadiran sidang
          </p>
        </div>
      </div>

      {/* Quick Meeting Selector for Creating Notulensi */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
        <h3 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-emerald-700" />
          Pilih Agenda Rapat Untuk Mencatat / Memperbarui Notulensi:
        </h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {meetings.map(m => {
            const hasMin = db.getMinuteByMeetingId(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleOpenCreateForMeeting(m)}
                className={`px-3 py-2 rounded-lg text-xs text-left border shrink-0 transition-colors ${
                  hasMin
                    ? 'bg-white border-emerald-300 text-slate-800 hover:bg-emerald-50'
                    : 'bg-white border-amber-300 text-slate-800 hover:bg-amber-50'
                }`}
              >
                <div className="font-semibold line-clamp-1 max-w-[200px]">{m.judul_rapat}</div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between gap-2 mt-1">
                  <span>{m.tanggal}</span>
                  <span
                    className={`font-bold ${
                      hasMin ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {hasMin ? '✓ Ada Notulensi' : '+ Catat Notulensi'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul rapat, pokok pembahasan, keputusan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
          />
        </div>
      </div>

      {/* Grid of Minutes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMinutes.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              icon={FileText}
              title="Belum ada notulensi yang tercatat"
              description="Pilih salah satu agenda rapat di panel atas untuk mencatat notulensi baru."
            />
          </div>
        ) : (
          filteredMinutes.map(min => (
            <div
              key={min.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    v{min.version} • {min.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{min.tanggal}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {min.judul_rapat}
                </h3>

                <div className="text-xs text-slate-600 space-y-1 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {min.waktu_mulai} - {min.waktu_selesai} WIB
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{min.tempat}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Pimpinan: {min.pimpinan_rapat} | Notulis: {min.notulis}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-xs mb-3 space-y-1.5">
                  <div>
                    <span className="font-bold text-slate-700 block">Pokok Pembahasan:</span>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed">{min.pokok_pembahasan}</p>
                  </div>
                  {min.keputusan && (
                    <div>
                      <span className="font-bold text-emerald-800 block">Keputusan:</span>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">{min.keputusan}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setPreviewMinute(min)}
                  className="text-xs font-semibold text-slate-700 hover:text-[#0d5c3a]"
                >
                  Detail Lengkap →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrint(min)}
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                    title="Cetak Notulensi"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => {
                        const m = meetings.find(item => item.id === min.meeting_id);
                        if (m) handleOpenCreateForMeeting(m);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMinute ? 'Edit Notulensi Rapat' : 'Catat Notulensi Rapat'}
        subtitle={selectedMeeting?.judul_rapat || ''}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveMinute} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Notulis *</label>
              <input
                type="text"
                required
                value={formNotulis}
                onChange={e => setFormNotulis(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daftar Hadir (Pisahkan dg koma)</label>
              <input
                type="text"
                value={formPeserta}
                onChange={e => setFormPeserta(e.target.value)}
                placeholder="cth: Ust. Fauzi, Ust. Dahlan, Ust. Irfan"
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">A. Pokok Pembahasan Sidang / Musyawarah *</label>
            <textarea
              rows={4}
              required
              value={formPokok}
              onChange={e => setFormPokok(e.target.value)}
              placeholder="Tuliskan pokok-pokok bahasan yang diangkat dalam rapat..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">B. Uraian & Dinamika Hasil Pembahasan</label>
            <textarea
              rows={4}
              value={formHasil}
              onChange={e => setFormHasil(e.target.value)}
              placeholder="Catatan pandangan peserta, masukan pimpinan, dan dinamika diskusi..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">C. Keputusan & Rekomendasi Rapat *</label>
            <textarea
              rows={4}
              required
              value={formKeputusan}
              onChange={e => setFormKeputusan(e.target.value)}
              placeholder="Keputusan final yang disepakati bersama dan tindakan yang harus diambil..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium text-emerald-950"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg shadow-xs"
            >
              Simpan Notulensi Resmi
            </button>
          </div>
        </form>
      </Modal>

      {/* PREVIEW DETAIL MODAL */}
      <Modal
        isOpen={!!previewMinute}
        onClose={() => setPreviewMinute(null)}
        title="Dokumen Notulensi Rapat"
        subtitle={previewMinute?.judul_rapat || ''}
        maxWidth="2xl"
      >
        {previewMinute && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <div className="font-bold text-slate-800">{previewMinute.judul_rapat}</div>
                <div className="text-[11px] text-slate-500">
                  {previewMinute.tanggal} • {previewMinute.tempat}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handlePrint(previewMinute)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0d5c3a] text-white rounded-lg text-xs font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Notulensi
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="font-bold text-slate-800 block text-xs border-b pb-1 mb-1">
                  A. Pokok Pembahasan
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {previewMinute.pokok_pembahasan || '-'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block text-xs border-b pb-1 mb-1">
                  B. Hasil Pembahasan
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {previewMinute.hasil_pembahasan || '-'}
                </p>
              </div>

              <div>
                <span className="font-bold text-emerald-800 block text-xs border-b pb-1 mb-1">
                  C. Keputusan & Tindak Lanjut
                </span>
                <p className="text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                  {previewMinute.keputusan || '-'}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block text-xs border-b pb-1 mb-1">
                  Daftar Peserta Hadir ({previewMinute.peserta.length})
                </span>
                <p className="text-slate-600">{previewMinute.peserta.join(', ') || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
