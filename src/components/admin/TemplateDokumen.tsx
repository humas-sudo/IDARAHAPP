import React, { useState } from 'react';
import { FileCode2, Copy, Printer, Check, Eye } from 'lucide-react';
import { MahadId, User } from '../../types';
import { Modal } from '../common/Modal';
import { printDocument } from '../../services/export';

interface TemplateDokumenProps {
  currentUser: User;
  activeMahadId: MahadId;
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
}

export const TemplateDokumen: React.FC<TemplateDokumenProps> = ({
  currentUser,
  activeMahadId
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const templates: TemplateItem[] = [
    {
      id: 'tpl-surat-tugas',
      title: 'Surat Perintah Tugas (SPT)',
      category: 'Kepegawaian / Penugasan',
      description: 'Format penugasan resmi ustadz/pengurus untuk kegiatan luar kampus atau kepesantrenan.',
      content: `SURAT PERINTAH TUGAS
Nomor: .../SPT/MHD-${activeMahadId === 'mahad-banat' ? 'LBT' : 'LBN'}/UNIA/IX/2026

Yang bertanda tangan di bawah ini, Mudir Ma'had Universitas Al-Amien Prenduan memberikan tugas kepada:
1. Nama : ...
   NIY  : ...
   Tugas: ...

Untuk melaksanakan tugas: ...
Pada tanggal: ...
Tempat: ...

Demikian Surat Tugas ini dibuat untuk dilaksanakan dengan penuh amanah dan tanggung jawab.`
    },
    {
      id: 'tpl-surat-undangan',
      title: 'Surat Undangan Rapat Resmi',
      category: 'Persuratan Dinas',
      description: 'Undangan pertemuan dinas, musyawarah asrama, atau rapat evaluasi kepesantrenan.',
      content: `SURAT UNDANGAN KOORDINASI
Nomor: .../UND/MHD-${activeMahadId === 'mahad-banat' ? 'LBT' : 'LBN'}/UNIA/IX/2026

Kepada Yth.
Bapak/Ibu/Ustadz: ...
Di Tempat

Assalamu'alaikum Wr. Wb.
Mengharap kehadiran Bapak/Ibu/Ustadz dalam rapat koordinasi kepesantrenan yang insya Allah diselenggarakan pada:
Hari/Tanggal : ...
Waktu        : 08.00 - Selesai WIB
Tempat       : Ruang Pertemuan Sekretariat Ma'had
Agenda       : ...

Mengingat pentingnya agenda ini, dimohon hadir tepat waktu.
Wassalamu'alaikum Wr. Wb.`
    },
    {
      id: 'tpl-berita-acara',
      title: 'Berita Acara Rapat / Pertemuan',
      category: 'Notulensi & Berita Acara',
      description: 'Format legal penandatanganan hasil kesepakatan dan musyawarah pimpinan.',
      content: `BERITA ACARA RAPAT KOORDINASI
Pada hari ini, ..., bertempat di ..., telah diselenggarakan musyawarah kepesantrenan dengan hasil mufakat:
1. ...
2. ...
3. ...

Berita acara ini dibuat dan ditandatangani oleh pimpinan rapat dan sekretaris sebagai bukti sah keputusan.`
    },
    {
      id: 'tpl-surat-izin',
      title: 'Surat Izin / Dispensasi Mahasantri',
      category: 'Kesiswaan / Kepengasuhan',
      description: 'Dispensasi perkuliahan atau kepesantrenan bagi mahasantri yang bertugas.',
      content: `SURAT KETERANGAN DISPENSASI
Nomor: .../KET/MHD-${activeMahadId === 'mahad-banat' ? 'LBT' : 'LBN'}/UNIA/IX/2026

Menerangkan bahwa mahasantri di bawah ini:
Nama : ...
NIM  : ...
Unit : ...

Diberikan izin/dispensasi dari kegiatan pada tanggal ... sehubungan dengan penugasan kepesantrenan.
Demikian untuk dipergunakan sebagaimana mestinya.`
    }
  ];

  const handleCopy = (tpl: TemplateItem) => {
    navigator.clipboard.writeText(tpl.content);
    setCopiedId(tpl.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = (tpl: TemplateItem) => {
    printDocument({
      title: tpl.title.toUpperCase(),
      mahadName: activeMahadId === 'mahad-banat' ? "Ma'had Putri (Lil Banat)" : "Ma'had Putra (Lil Banin)",
      contentHtml: `<pre style="font-family: 'Times New Roman', serif; font-size: 12pt; white-space: pre-wrap; line-height: 1.6;">${tpl.content}</pre>`
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileCode2 className="w-6 h-6 text-[#0d5c3a]" />
          Template Naskah Dinas Resmi
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Standarisasi format surat dinas, surat tugas, undangan, dan berita acara kepesantrenan UNIA
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(tpl => (
          <div
            key={tpl.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-[#0d5c3a] transition-all"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {tpl.category}
              </span>
              <h3 className="font-bold text-slate-800 text-base mt-2">{tpl.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 max-h-36 overflow-y-auto whitespace-pre-wrap">
                {tpl.content}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
              <button
                type="button"
                onClick={() => setSelectedTemplate(tpl)}
                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Lihat Lengkap
              </button>
              <button
                type="button"
                onClick={() => handleCopy(tpl)}
                className="px-3 py-1.5 text-xs text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5"
              >
                {copiedId === tpl.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin Teks
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handlePrint(tpl)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0d5c3a] hover:bg-[#09472c] rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Format
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title={selectedTemplate?.title || ''}
        subtitle={selectedTemplate?.category}
        maxWidth="lg"
      >
        {selectedTemplate && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">{selectedTemplate.description}</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed text-slate-800">
              {selectedTemplate.content}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleCopy(selectedTemplate)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Salin Teks Format
              </button>
              <button
                type="button"
                onClick={() => handlePrint(selectedTemplate)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0d5c3a] rounded-lg"
              >
                Cetak Lembar Format
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
