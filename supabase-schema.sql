-- ==========================================================
-- IDARAH - TATA KELOLA KEPESANTRENAN MA'HAD UNIA
-- Master Supabase PostgreSQL Database Schema (V2 - 100% Synced)
-- Jalankan skrip ini di Supabase SQL Editor (New query -> Run)
-- ==========================================================

-- 0. Hapus tabel lama (jika ada) agar skema kolom diperbarui 100% sesuai model IDARAH
DROP TABLE IF EXISTS
  version_histories, audit_logs, notifications,
  annual_reports, monthly_reports, weekly_reports,
  recommendation_follow_ups, meeting_recommendations,
  meeting_minutes, meetings, administrative_requests,
  templates, archives, agendas, dispositions, decisions,
  letters_out, letters_in, report_periods, users,
  roles, positions, units, mahads CASCADE;

-- 1. MAHADS
CREATE TABLE mahads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  arabic_name TEXT,
  "arabicName" TEXT,
  code TEXT NOT NULL,
  description TEXT,
  mudir_name TEXT,
  "mudirName" TEXT,
  sekretaris_name TEXT,
  "sekretarisName" TEXT
);

-- 2. UNITS
CREATE TABLE units (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_reporting_unit BOOLEAN DEFAULT TRUE,
  head_position TEXT,
  head_name TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. POSITIONS
CREATE TABLE positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level INT DEFAULT 1,
  description TEXT
);

-- 4. ROLES
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::JSONB
);

-- 5. USERS
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  mahad_id TEXT NOT NULL,
  unit_id TEXT,
  position_id TEXT,
  position_title TEXT,
  role_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- 6. REPORT PERIODS
CREATE TABLE report_periods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  mahad_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- 7. LETTERS IN (Surat Masuk)
CREATE TABLE letters_in (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  nomor_surat TEXT NOT NULL,
  nomor_agenda TEXT NOT NULL,
  tanggal_surat TEXT,
  tanggal_diterima TEXT,
  pengirim TEXT NOT NULL,
  perihal TEXT NOT NULL,
  tujuan TEXT,
  sifat TEXT,
  klasifikasi TEXT,
  ringkasan TEXT,
  lampiran_count INT DEFAULT 0,
  file_name TEXT,
  status TEXT DEFAULT 'Diterima',
  catatan TEXT,
  petugas_penerima TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. LETTERS OUT (Surat Keluar)
CREATE TABLE letters_out (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  nomor_surat TEXT NOT NULL,
  tanggal TEXT,
  tujuan TEXT NOT NULL,
  perihal TEXT NOT NULL,
  jenis_surat TEXT,
  sifat TEXT,
  isi_ringkas TEXT,
  penandatangan TEXT,
  lampiran_count INT DEFAULT 0,
  file_name TEXT,
  status TEXT DEFAULT 'Disahkan',
  catatan TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DECISIONS (Surat Keputusan Mudir / Direktur)
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  nomor_sk TEXT NOT NULL,
  judul TEXT NOT NULL,
  tentang TEXT NOT NULL,
  tanggal TEXT,
  pejabat_penandatangan TEXT,
  dasar_hukum TEXT,
  lampiran_count INT DEFAULT 1,
  file_name TEXT,
  status TEXT DEFAULT 'Disahkan',
  catatan TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DISPOSITIONS
CREATE TABLE dispositions (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  letter_in_id TEXT,
  letter_nomor TEXT,
  letter_perihal TEXT,
  pemberi_disposisi TEXT,
  target_unit_id TEXT,
  target_unit_name TEXT,
  instruksi TEXT,
  prioritas TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Baru',
  catatan_tindak_lanjut TEXT,
  tanggal_disposisi TEXT,
  tanggal_selesai TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AGENDAS
CREATE TABLE agendas (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  judul TEXT NOT NULL,
  jenis TEXT NOT NULL,
  tanggal TEXT,
  waktu_mulai TEXT,
  waktu_selesai TEXT,
  tempat TEXT,
  penanggung_jawab TEXT,
  peserta TEXT,
  deskripsi TEXT,
  reminder_days INT DEFAULT 1,
  status TEXT DEFAULT 'Direncanakan',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ARCHIVES
CREATE TABLE archives (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  judul TEXT NOT NULL,
  nomor_dokumen TEXT NOT NULL,
  kategori TEXT NOT NULL,
  tahun INT,
  unit_id TEXT,
  unit_name TEXT,
  tanggal TEXT,
  file_name TEXT,
  file_size TEXT,
  deskripsi TEXT,
  tags JSONB DEFAULT '[]'::JSONB,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. TEMPLATES
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  format_nomor TEXT,
  deskripsi TEXT,
  konten TEXT,
  variabel JSONB DEFAULT '[]'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TEXT
);

-- 14. ADMINISTRATIVE REQUESTS
CREATE TABLE administrative_requests (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  pemohon_name TEXT NOT NULL,
  unit_id TEXT,
  unit_name TEXT,
  jenis_permohonan TEXT,
  tanggal TEXT,
  keperluan TEXT,
  lampiran_file TEXT,
  status TEXT DEFAULT 'Diajukan',
  catatan_petugas TEXT,
  penanggung_jawab TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. MEETINGS
CREATE TABLE meetings (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  judul_rapat TEXT NOT NULL,
  tanggal TEXT,
  waktu_mulai TEXT,
  waktu_selesai TEXT,
  tempat TEXT,
  pimpinan_rapat TEXT,
  sekretaris_notulis TEXT,
  peserta JSONB DEFAULT '[]'::JSONB,
  agenda TEXT,
  status TEXT DEFAULT 'Direncanakan',
  catatan TEXT,
  has_minute BOOLEAN DEFAULT FALSE,
  minute_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. MEETING MINUTES
CREATE TABLE meeting_minutes (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  mahad_id TEXT NOT NULL,
  judul_rapat TEXT NOT NULL,
  jenis_rapat TEXT,
  tanggal TEXT,
  waktu_mulai TEXT,
  waktu_selesai TEXT,
  tempat TEXT,
  pimpinan_rapat TEXT,
  notulis TEXT,
  peserta JSONB DEFAULT '[]'::JSONB,
  agenda TEXT,
  pokok_pembahasan TEXT,
  hasil_pembahasan TEXT,
  keputusan TEXT,
  status TEXT DEFAULT 'Draft',
  version INT DEFAULT 1,
  lampiran TEXT,
  dokumentasi_url TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. MEETING RECOMMENDATIONS
CREATE TABLE meeting_recommendations (
  id TEXT PRIMARY KEY,
  nomor_rekomendasi TEXT,
  meeting_id TEXT,
  minute_id TEXT,
  mahad_id TEXT NOT NULL,
  meeting_title TEXT,
  isi_rekomendasi TEXT NOT NULL,
  target_unit_id TEXT,
  target_unit_name TEXT,
  penanggung_jawab TEXT,
  prioritas TEXT DEFAULT 'Sedang',
  tanggal TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Baru',
  catatan TEXT,
  lampiran TEXT,
  tanggal_selesai TEXT,
  progress_percent INT DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. RECOMMENDATION FOLLOW-UPS
CREATE TABLE recommendation_follow_ups (
  id TEXT PRIMARY KEY,
  recommendation_id TEXT NOT NULL,
  unit_id TEXT,
  status_update TEXT,
  uraian_tindakan TEXT,
  hasil TEXT,
  kendala TEXT,
  rencana_berikutnya TEXT,
  tanggal_pelaksanaan TEXT,
  lampiran_bukti TEXT,
  progress_percent INT DEFAULT 0,
  submitted_by TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. WEEKLY REPORTS
CREATE TABLE weekly_reports (
  id TEXT PRIMARY KEY,
  reporting_unit_id TEXT NOT NULL,
  reporting_unit_name TEXT,
  mahad_id TEXT NOT NULL,
  period_id TEXT,
  minggu_ke INT,
  bulan TEXT,
  tahun INT,
  tanggal_mulai TEXT,
  tanggal_selesai TEXT,
  penanggung_jawab TEXT,
  ringkasan_kegiatan TEXT,
  kegiatan_selesai JSONB DEFAULT '[]'::JSONB,
  kegiatan_belum_selesai JSONB DEFAULT '[]'::JSONB,
  kendala TEXT,
  tindak_lanjut TEXT,
  rencana_minggu_depan JSONB DEFAULT '[]'::JSONB,
  rekomendasi_ids JSONB DEFAULT '[]'::JSONB,
  rekomendasi_details JSONB DEFAULT '[]'::JSONB,
  catatan_mudir TEXT,
  status TEXT DEFAULT 'Draft',
  version INT DEFAULT 1,
  submitted_at TIMESTAMPTZ,
  submitted_by TEXT,
  validated_at TIMESTAMPTZ,
  validated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. MONTHLY REPORTS
CREATE TABLE monthly_reports (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  period_id TEXT,
  bulan TEXT,
  tahun INT,
  judul TEXT,
  pendahuluan TEXT,
  ringkasan_kegiatan TEXT,
  rekap_kegiatan_unit TEXT,
  administrasi_rekap JSONB DEFAULT '{}'::JSONB,
  rapat_rekap JSONB DEFAULT '{}'::JSONB,
  kegiatan_selesai_narasi TEXT,
  kegiatan_belum_selesai_narasi TEXT,
  kendala_evaluasi TEXT,
  tindak_lanjut TEXT,
  rencana_bulan_depan TEXT,
  penutup TEXT,
  status TEXT DEFAULT 'Draft',
  version INT DEFAULT 1,
  disusun_oleh TEXT,
  disetujui_oleh TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. ANNUAL REPORTS
CREATE TABLE annual_reports (
  id TEXT PRIMARY KEY,
  mahad_id TEXT NOT NULL,
  tahun INT,
  judul TEXT,
  pendahuluan TEXT,
  gambaran_umum TEXT,
  rekap_kegiatan_tahunan TEXT,
  rekap_administrasi_tahunan JSONB DEFAULT '{}'::JSONB,
  rekap_rapat_tahunan JSONB DEFAULT '{}'::JSONB,
  capaian_kinerja_per_unit TEXT,
  evaluasi_kendala_tahunan TEXT,
  rekomendasi_pengembangan TEXT,
  rencana_strategis_tahun_depan TEXT,
  penutup TEXT,
  status TEXT DEFAULT 'Draft',
  version INT DEFAULT 1,
  disusun_oleh TEXT,
  disahkan_oleh TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. NOTIFICATIONS
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mahad_id TEXT,
  type TEXT DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity TEXT,
  related_entity_id TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. AUDIT LOGS
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  mahad_id TEXT,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  description TEXT
);

-- 24. VERSION HISTORIES
CREATE TABLE version_histories (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  version_number INT DEFAULT 1,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  author_id TEXT,
  author_name TEXT,
  change_summary TEXT,
  snapshot JSONB DEFAULT '{}'::JSONB
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Memberikan akses penuh baca & tulis untuk Anon / Public Key
-- ==========================================================

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'mahads', 'units', 'positions', 'roles', 'users', 'report_periods',
    'letters_in', 'letters_out', 'decisions', 'dispositions', 'agendas',
    'archives', 'templates', 'administrative_requests', 'meetings',
    'meeting_minutes', 'meeting_recommendations', 'recommendation_follow_ups',
    'weekly_reports', 'monthly_reports', 'annual_reports', 'notifications',
    'audit_logs', 'version_histories'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Public Full Access" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Public Full Access" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- ==========================================================
-- INITIAL SEED DATA (MAHAD & MASTER UNITS)
-- ==========================================================

INSERT INTO mahads (id, name, arabic_name, "arabicName", code, description, mudir_name, "mudirName", sekretaris_name, "sekretarisName")
VALUES
  ('mahad-banin', 'Ma''had Lil Banin (Putra)', 'معهد البنين', 'معهد البنين', 'LBN', 'Kampus Putra Universitas Al-Amien Prenduan, Pragaan, Sumenep, Madura.', 'K.H. Moh. Khoirul Umam, M.Pd.I', 'K.H. Moh. Khoirul Umam, M.Pd.I', 'Ust. Ahmad Zarkasyi, S.Pd', 'Ust. Ahmad Zarkasyi, S.Pd'),
  ('mahad-banat', 'Ma''had Lil Banat (Putri)', 'معهد البنات', 'معهد البنات', 'LBT', 'Kampus Putri Universitas Al-Amien Prenduan, Pragaan, Sumenep, Madura.', 'Nyai Hj. Nurul Hidayah, M.A', 'Nyai Hj. Nurul Hidayah, M.A', 'Ustzh. Siti Maryam, S.Pd.I', 'Ustzh. Siti Maryam, S.Pd.I')
ON CONFLICT (id) DO NOTHING;

INSERT INTO positions (id, name, level, description)
VALUES
  ('pos-mudir', 'Mudir Ma''had', 1, 'Pimpinan Tertinggi Pengasuhan & Kelembagaan Ma''had'),
  ('pos-sekretaris', 'Sekretaris Ma''had', 2, 'Kepala Administrasi, Persuratan & Pengarsipan Ma''had'),
  ('pos-kabid', 'Kepala Bidang / Koordinator Unit', 3, 'Penanggung Jawab Pelaksanaan Program Unit Kerja'),
  ('pos-staf', 'Staf Administrasi Unit', 4, 'Petugas Teknis Pelaksana & Pelaporan'),
  ('pos-auditor', 'Auditor Mutu Internal', 2, 'Pemantau Kepatuhan & Evaluasi Administrasi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name, description, permissions)
VALUES
  ('super_admin', 'Super Administrator', 'Akses penuh ke seluruh sistem dan konfigurasi', '["*"]'::JSONB),
  ('admin_direktorat', 'Admin Direktorat', 'Pengelola administrasi umum, SK dan permohonan', '["letters.in.view", "letters.out.view", "decisions.view", "decisions.create"]'::JSONB),
  ('admin_sekretariat', 'Admin Sekretariat', 'Pencatatan surat masuk/keluar, disposisi, notulensi rapat', '["letters.in.create", "letters.out.create", "dispositions.create", "meetings.manage"]'::JSONB),
  ('validator_mudir', 'Validator / Mudir', 'Pimpinan pengesahan surat, pemberi disposisi dan validasi laporan', '["dispositions.create", "weekly_reports.validate"]'::JSONB),
  ('unit_reporter', 'Pelapor Unit', 'Penyusun dan pengirim laporan berkala unit kerja', '["weekly_reports.submit", "recommendation_follow_ups.submit"]'::JSONB),
  ('viewer', 'Pengamat', 'Hanya melihat data tanpa hak modifikasi', '["letters.in.view", "weekly_reports.view"]'::JSONB)
ON CONFLICT (id) DO NOTHING;
