// IDARAH - Tipe Data & Schema Entitas Terpusat
// Universitas Al-Amien Prenduan (UNIA)

export type MahadId = 'mahad-banin' | 'mahad-banat' | 'all';

export interface Mahad {
  id: 'mahad-banin' | 'mahad-banat';
  name: string;
  arabicName: string;
  code: string;
  description: string;
  mudirName: string;
  sekretarisName: string;
}

export interface Organization {
  id: string;
  name: string;
  parentOrg: string;
  university: string;
  directorate: string;
}

export interface Unit {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  name: string;
  code: string;
  description: string;
  is_reporting_unit: boolean;
  head_position: string;
  head_name: string;
  is_active: boolean;
}

export interface Position {
  id: string;
  name: string;
  level: number;
  description: string;
}

export type PermissionCode =
  | 'letters.in.view'
  | 'letters.in.create'
  | 'letters.in.update'
  | 'letters.in.delete'
  | 'letters.out.view'
  | 'letters.out.create'
  | 'letters.out.update'
  | 'decisions.view'
  | 'decisions.create'
  | 'decisions.update'
  | 'dispositions.view'
  | 'dispositions.create'
  | 'dispositions.update'
  | 'agendas.view'
  | 'agendas.manage'
  | 'archives.view'
  | 'archives.manage'
  | 'templates.view'
  | 'templates.manage'
  | 'requests.view'
  | 'requests.create'
  | 'requests.process'
  | 'meetings.view'
  | 'meetings.manage'
  | 'meeting_minutes.create'
  | 'meeting_minutes.update'
  | 'meeting_recommendations.create'
  | 'meeting_recommendations.monitor'
  | 'recommendation_follow_ups.submit'
  | 'weekly_reports.view'
  | 'weekly_reports.submit'
  | 'weekly_reports.validate'
  | 'monthly_reports.view'
  | 'monthly_reports.manage'
  | 'annual_reports.view'
  | 'annual_reports.manage'
  | 'system.users.manage'
  | 'system.org.manage'
  | 'system.audit.view'
  | 'system.cross_mahad';

export type RoleId =
  | 'super_admin'
  | 'admin_direktorat'
  | 'admin_sekretariat'
  | 'validator_mudir'
  | 'unit_reporter'
  | 'viewer';

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  permissions: PermissionCode[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  mahad_id: 'mahad-banin' | 'mahad-banat' | 'all';
  unit_id: string;
  position_id: string;
  position_title: string;
  role_id: RoleId;
  is_active: boolean;
}

// Administrasi
export type LetterPriority = 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
export type LetterInStatus = 'Diterima' | 'Didisposisi' | 'Diproses' | 'Selesai' | 'Diarsipkan';

export interface LetterIn {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  nomor_surat: string;
  nomor_agenda: string;
  tanggal_surat: string;
  tanggal_diterima: string;
  pengirim: string;
  perihal: string;
  tujuan: string;
  sifat: LetterPriority;
  klasifikasi: string;
  ringkasan: string;
  lampiran_count: number;
  file_name?: string;
  status: LetterInStatus;
  catatan?: string;
  petugas_penerima: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type LetterOutStatus = 'Draft' | 'Diproses' | 'Menunggu Tanda Tangan' | 'Selesai' | 'Diarsipkan';

export interface LetterOut {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  nomor_surat: string;
  tanggal: string;
  tujuan: string;
  perihal: string;
  jenis_surat: string;
  sifat: LetterPriority;
  isi_ringkas: string;
  penandatangan: string;
  lampiran_count: number;
  file_name?: string;
  status: LetterOutStatus;
  catatan?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type DecisionStatus = 'Draft' | 'Disusun' | 'Diperiksa' | 'Menunggu Tanda Tangan' | 'Disahkan' | 'Diarsipkan';

export interface Decision {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  nomor_sk: string;
  judul: string;
  tentang: string;
  tanggal: string;
  pejabat_penandatangan: string;
  dasar_hukum: string;
  lampiran_count: number;
  file_name?: string;
  status: DecisionStatus;
  catatan?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type DispositionStatus = 'Baru' | 'Diterima' | 'Diproses' | 'Selesai' | 'Terlambat' | 'Ditutup';

export interface Disposition {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  letter_in_id: string;
  letter_nomor: string;
  letter_perihal: string;
  pemberi_disposisi: string;
  target_unit_id: string;
  target_unit_name: string;
  instruksi: string;
  prioritas: LetterPriority;
  deadline: string;
  status: DispositionStatus;
  catatan_tindak_lanjut?: string;
  tanggal_disposisi: string;
  tanggal_selesai?: string;
  created_at: string;
}

export type AgendaType = 'Rapat' | 'Pertemuan' | 'Kegiatan' | 'Deadline' | 'Penerimaan Tamu' | 'Agenda Surat' | 'Agenda Administrasi' | 'Lainnya';
export type AgendaStatus = 'Direncanakan' | 'Berlangsung' | 'Selesai' | 'Ditunda' | 'Dibatalkan';

export interface Agenda {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  judul: string;
  jenis: AgendaType;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tempat: string;
  penanggung_jawab: string;
  peserta: string;
  deskripsi: string;
  reminder_days: number;
  status: AgendaStatus;
  created_by: string;
  created_at: string;
}

export interface Archive {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  judul: string;
  nomor_dokumen: string;
  kategori: 'Surat Masuk' | 'Surat Keluar' | 'SK' | 'Notulensi' | 'Laporan' | 'Dokumen Rapat' | 'Template' | 'Lainnya';
  tahun: number;
  unit_id: string;
  unit_name: string;
  tanggal: string;
  file_name: string;
  file_size: string;
  deskripsi: string;
  tags: string[];
  created_by: string;
  created_at: string;
}

export interface DocumentTemplate {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat' | 'all';
  nama: string;
  kategori: 'Surat Keluar' | 'SK' | 'Surat Tugas' | 'Undangan' | 'Berita Acara' | 'Notulensi' | 'Laporan Mingguan' | 'Laporan Bulanan' | 'Laporan Tahunan';
  format_nomor: string;
  deskripsi: string;
  konten: string;
  variabel: string[];
  is_active: boolean;
  updated_at: string;
}

export type RequestStatus = 'Diajukan' | 'Diperiksa' | 'Diproses' | 'Perlu Revisi' | 'Disetujui' | 'Ditolak' | 'Selesai';

export interface AdministrativeRequest {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  pemohon_name: string;
  unit_id: string;
  unit_name: string;
  jenis_permohonan: string;
  tanggal: string;
  keperluan: string;
  lampiran_file?: string;
  status: RequestStatus;
  catatan_petugas?: string;
  penanggung_jawab: string;
  created_at: string;
  updated_at: string;
}

// Rapat & Notulensi & Rekomendasi
export type MeetingStatus = 'Direncanakan' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';

export interface Meeting {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  judul_rapat: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tempat: string;
  pimpinan_rapat: string;
  sekretaris_notulis: string;
  peserta: string[];
  agenda: string;
  status: MeetingStatus;
  catatan?: string;
  has_minute: boolean;
  minute_id?: string;
  created_at: string;
}

export type MinuteStatus = 'Draft' | 'Disusun' | 'Diperiksa' | 'Final' | 'Diarsipkan';

export interface MeetingMinute {
  id: string;
  meeting_id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  judul_rapat: string;
  jenis_rapat: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  tempat: string;
  pimpinan_rapat: string;
  notulis: string;
  peserta: string[];
  agenda: string;
  pokok_pembahasan: string;
  hasil_pembahasan: string;
  keputusan: string;
  status: MinuteStatus;
  version: number;
  lampiran?: string;
  dokumentasi_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type RecommendationPriority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Mendesak';
export type RecommendationStatus = 'Baru' | 'Diterima' | 'Sedang Ditindaklanjuti' | 'Menunggu' | 'Selesai' | 'Terlambat' | 'Ditutup';

export interface MeetingRecommendation {
  id: string;
  nomor_rekomendasi: string;
  meeting_id: string;
  minute_id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  meeting_title: string;
  isi_rekomendasi: string;
  target_unit_id: string;
  target_unit_name: string;
  penanggung_jawab: string;
  prioritas: RecommendationPriority;
  tanggal: string;
  deadline: string;
  status: RecommendationStatus;
  catatan?: string;
  lampiran?: string;
  tanggal_selesai?: string;
  progress_percent: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RecommendationFollowUp {
  id: string;
  recommendation_id: string;
  unit_id: string;
  status_update: RecommendationStatus;
  uraian_tindakan: string;
  hasil: string;
  kendala: string;
  rencana_berikutnya: string;
  tanggal_pelaksanaan: string;
  lampiran_bukti?: string;
  progress_percent: number;
  submitted_by: string;
  submitted_at: string;
}

// Pelaporan
export interface ReportPeriod {
  id: string;
  name: string;
  type: 'weekly' | 'monthly' | 'annual';
  start_date: string;
  end_date: string;
  mahad_id: 'mahad-banin' | 'mahad-banat' | 'all';
  is_active: boolean;
}

export type WeeklyReportStatus =
  | 'Draft'
  | 'Diajukan'
  | 'Diperiksa'
  | 'Menunggu Validasi'
  | 'Perlu Revisi'
  | 'Disetujui'
  | 'Ditolak'
  | 'Diarsipkan';

export interface WeeklyReport {
  id: string;
  reporting_unit_id: string;
  reporting_unit_name: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  period_id: string;
  minggu_ke: number;
  bulan: string;
  tahun: number;
  tanggal_mulai: string;
  tanggal_selesai: string;
  penanggung_jawab: string;
  ringkasan_kegiatan: string;
  kegiatan_selesai: string[];
  kegiatan_belum_selesai: string[];
  kendala: string;
  tindak_lanjut: string;
  rencana_minggu_depan: string[];
  rekomendasi_ids: string[];
  rekomendasi_details?: {
    id: string;
    nomor: string;
    ringkasan: string;
    tindakan: string;
    progress: number;
  }[];
  catatan_mudir?: string;
  status: WeeklyReportStatus;
  version: number;
  submitted_at?: string;
  submitted_by?: string;
  validated_at?: string;
  validated_by?: string;
  created_at: string;
  updated_at: string;
}

export type MonthlyReportStatus = 'Draft' | 'Disusun' | 'Diperiksa' | 'Perlu Revisi' | 'Final' | 'Disetujui' | 'Diarsipkan';

export interface MonthlyReport {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  period_id: string;
  bulan: string;
  tahun: number;
  judul: string;
  pendahuluan: string;
  ringkasan_kegiatan: string;
  rekap_kegiatan_unit: string;
  administrasi_rekap: {
    surat_masuk_count: number;
    surat_keluar_count: number;
    sk_count: number;
    disposisi_count: number;
    agenda_count: number;
  };
  rapat_rekap: {
    total_rapat: number;
    total_rekomendasi: number;
    rekomendasi_selesai: number;
    rekomendasi_berjalan: number;
    rekomendasi_terlambat: number;
  };
  kegiatan_selesai_narasi: string;
  kegiatan_belum_selesai_narasi: string;
  kendala_evaluasi: string;
  tindak_lanjut: string;
  rencana_bulan_depan: string;
  penutup: string;
  status: MonthlyReportStatus;
  version: number;
  disusun_oleh: string;
  disetujui_oleh?: string;
  created_at: string;
  updated_at: string;
}

export type AnnualReportStatus = 'Draft' | 'Disusun' | 'Diperiksa' | 'Perlu Revisi' | 'Final' | 'Disahkan' | 'Diarsipkan';

export interface AnnualReport {
  id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat';
  tahun: number;
  judul: string;
  pendahuluan: string;
  gambaran_umum: string;
  rekap_kegiatan_tahunan: string;
  rekap_administrasi_tahunan: {
    total_surat_masuk: number;
    total_surat_keluar: number;
    total_sk: number;
    total_disposisi: number;
    total_agenda: number;
  };
  rekap_rapat_tahunan: {
    total_rapat: number;
    total_notulensi: number;
    total_rekomendasi: number;
    persentase_selesai: number;
  };
  capaian_kinerja_per_unit: string;
  evaluasi_kendala_tahunan: string;
  rekomendasi_pengembangan: string;
  rencana_strategis_tahun_depan: string;
  penutup: string;
  status: AnnualReportStatus;
  version: number;
  disusun_oleh: string;
  disahkan_oleh?: string;
  created_at: string;
  updated_at: string;
}

// Sistem: Notifikasi, Audit Log, Version History
export type NotificationType =
  | 'surat_baru'
  | 'disposisi_baru'
  | 'permohonan_baru'
  | 'rapat_baru'
  | 'rekomendasi_baru'
  | 'rekomendasi_deadline'
  | 'rekomendasi_terlambat'
  | 'tindak_lanjut_masuk'
  | 'laporan_menunggu_validasi'
  | 'laporan_revisi'
  | 'laporan_disetujui'
  | 'agenda_mendatang'
  | 'sistem';

export interface Notification {
  id: string;
  user_id: string;
  mahad_id: 'mahad-banin' | 'mahad-banat' | 'all';
  type: NotificationType;
  title: string;
  message: string;
  related_entity: 'letter' | 'disposition' | 'meeting' | 'recommendation' | 'weekly_report' | 'monthly_report' | 'agenda' | 'system';
  related_entity_id: string;
  read: boolean;
  created_at: string;
  read_at?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  mahad_id: 'mahad-banin' | 'mahad-banat' | 'all';
  action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBMIT' | 'VALIDATE' | 'APPROVE' | 'REVISE' | 'REJECT' | 'ARCHIVE' | 'DOWNLOAD' | 'EXPORT';
  entity: string;
  entity_id: string;
  old_value?: string;
  new_value?: string;
  description: string;
  timestamp: string;
}

export interface VersionHistory {
  id: string;
  entity_type: 'letter' | 'decision' | 'minute' | 'weekly_report' | 'monthly_report' | 'annual_report';
  entity_id: string;
  version_number: number;
  author_id: string;
  author_name: string;
  timestamp: string;
  change_summary: string;
  snapshot: any;
}
