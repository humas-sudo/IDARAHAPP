// Seed Data Realistis untuk IDARAH - Universitas Al-Amien Prenduan (UNIA)
import {
  Mahad,
  Unit,
  Position,
  Role,
  User,
  ReportPeriod,
  LetterIn,
  LetterOut,
  Decision,
  Disposition,
  Agenda,
  Archive,
  DocumentTemplate,
  AdministrativeRequest,
  Meeting,
  MeetingMinute,
  MeetingRecommendation,
  RecommendationFollowUp,
  WeeklyReport,
  MonthlyReport,
  AnnualReport,
  Notification,
  AuditLog,
  VersionHistory
} from '../types';

export const INITIAL_MAHADS: Mahad[] = [
  {
    id: 'mahad-banin',
    name: "Ma'had Putra (Lil Banin)",
    arabicName: "معهد البنين",
    code: 'LBN',
    description: "Kampus Putra Universitas Al-Amien Prenduan, Pragaan, Sumenep, Madura.",
    mudirName: "K.H. Moh. Khoirul Umam, M.Pd.I",
    sekretarisName: "Ust. Ahmad Zarkasyi, S.Pd"
  },
  {
    id: 'mahad-banat',
    name: "Ma'had Putri (Lil Banat)",
    arabicName: "معهد البنات",
    code: 'LBT',
    description: "Kampus Putri Universitas Al-Amien Prenduan, Pragaan, Sumenep, Madura.",
    mudirName: "Nyai Hj. Nurul Hidayah, M.A",
    sekretarisName: "Ustzh. Siti Maryam, S.Pd.I"
  }
];

export const INITIAL_POSITIONS: Position[] = [
  { id: 'pos-mudir', name: "Mudir Ma'had", level: 1, description: "Pimpinan Tertinggi Pengasuhan & Kelembagaan Ma'had" },
  { id: 'pos-sekretaris', name: "Sekretaris Ma'had", level: 2, description: "Kepala Administrasi, Persuratan & Pengarsipan Ma'had" },
  { id: 'pos-kabid', name: "Kepala Bidang / Koordinator Unit", level: 3, description: "Penanggung Jawab Pelaksanaan Program Unit Kerja" },
  { id: 'pos-staf', name: "Staf Administrasi Unit", level: 4, description: "Petugas Teknis Pelaksana & Pelaporan" },
  { id: 'pos-auditor', name: "Auditor Mutu Internal", level: 2, description: "Pemantau Kepatuhan & Evaluasi Administrasi" }
];

export const INITIAL_UNITS: Unit[] = [
  // Banin Units
  {
    id: 'unit-sekre-banin',
    mahad_id: 'mahad-banin',
    name: "Sekretariat Ma'had Putra",
    code: 'SEKRE-LBN',
    description: "Pengelola administrasi persuratan, notulensi rapat, dan arsip kelembagaan Putra",
    is_reporting_unit: true,
    head_position: "Sekretaris Ma'had",
    head_name: "Ust. Ahmad Zarkasyi, S.Pd",
    is_active: true
  },
  {
    id: 'unit-pembinaan-banin',
    mahad_id: 'mahad-banin',
    name: "Bidang Pembinaan & Tarbiyah Putra",
    code: 'TARBIYAH-LBN',
    description: "Pendidikan karakter kepesantrenan, pembinaan mahasantri, dan kedisiplinan asrama",
    is_reporting_unit: true,
    head_position: "Koordinator Pembinaan",
    head_name: "Ust. M. Syukron Katsir, Lc., M.H",
    is_active: true
  },
  {
    id: 'unit-ibadah-banin',
    mahad_id: 'mahad-banin',
    name: "Bidang Ibadah & DKM Masjid Jami' Putra",
    code: 'DKM-LBN',
    description: "Pengelolaan salat berjamaah, tilawah, imam, muadzin, dan ibadah sunnah",
    is_reporting_unit: true,
    head_position: "Ketua DKM Putra",
    head_name: "Ust. Fathurrahman Al-Hafidz, S.Ag",
    is_active: true
  },
  {
    id: 'unit-bahasa-banin',
    mahad_id: 'mahad-banin',
    name: "Bagian Penggerak Bahasa (CLI) Putra",
    code: 'BAHASA-LBN',
    description: "Penerapan bi'ah lughawiyyah bahasa Arab & Inggris di lingkungan Ma'had",
    is_reporting_unit: true,
    head_position: "Koordinator Bahasa Putra",
    head_name: "Ust. Ridwan Habibi, M.Pd",
    is_active: true
  },
  {
    id: 'unit-keamanan-banin',
    mahad_id: 'mahad-banin',
    name: "Bidang Ketertiban & Keamanan Putra",
    code: 'KAMTIB-LBN',
    description: "Pengawasan perizinan keluar, ronda malam, dan ketertiban umum Ma'had Putra",
    is_reporting_unit: true,
    head_position: "Kepala Keamanan Putra",
    head_name: "Ust. Hendra Gunawan, S.Kom",
    is_active: true
  },

  // Banat Units
  {
    id: 'unit-sekre-banat',
    mahad_id: 'mahad-banat',
    name: "Sekretariat Ma'had Putri",
    code: 'SEKRE-LBT',
    description: "Pengelola administrasi persuratan, notulensi rapat, dan arsip kelembagaan Putri",
    is_reporting_unit: true,
    head_position: "Sekretaris Ma'had Putri",
    head_name: "Ustzh. Siti Maryam, S.Pd.I",
    is_active: true
  },
  {
    id: 'unit-pembinaan-banat',
    mahad_id: 'mahad-banat',
    name: "Bidang Pembinaan & Tarbiyah Putri",
    code: 'TARBIYAH-LBT',
    description: "Pendidikan keputrian, tarbiyah mahasantriwati, dan pembinaan halaqah",
    is_reporting_unit: true,
    head_position: "Koordinator Pembinaan Putri",
    head_name: "Ustzh. Halimatus Sa'diyah, M.Ag",
    is_active: true
  },
  {
    id: 'unit-bahasa-banat',
    mahad_id: 'mahad-banat',
    name: "Bagian Penggerak Bahasa (CLI) Putri",
    code: 'BAHASA-LBT',
    description: "Pengembangan disiplin mufradat dan muhadatsah bahasa resmi Putri",
    is_reporting_unit: true,
    head_position: "Koordinator Bahasa Putri",
    head_name: "Ustzh. Fatimatuz Zahro, S.Hum",
    is_active: true
  }
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Akses penuh ke seluruh sistem, multi-Ma’had, konfigurasi organisasi dan audit',
    permissions: [
      'letters.in.view', 'letters.in.create', 'letters.in.update', 'letters.in.delete',
      'letters.out.view', 'letters.out.create', 'letters.out.update',
      'decisions.view', 'decisions.create', 'decisions.update',
      'dispositions.view', 'dispositions.create', 'dispositions.update',
      'agendas.view', 'agendas.manage',
      'archives.view', 'archives.manage',
      'templates.view', 'templates.manage',
      'requests.view', 'requests.create', 'requests.process',
      'meetings.view', 'meetings.manage',
      'meeting_minutes.create', 'meeting_minutes.update',
      'meeting_recommendations.create', 'meeting_recommendations.monitor',
      'recommendation_follow_ups.submit',
      'weekly_reports.view', 'weekly_reports.submit', 'weekly_reports.validate',
      'monthly_reports.view', 'monthly_reports.manage',
      'annual_reports.view', 'annual_reports.manage',
      'system.users.manage', 'system.org.manage', 'system.audit.view', 'system.cross_mahad'
    ]
  },
  {
    id: 'admin_sekretariat',
    name: 'Admin Sekretariat Ma’had',
    description: 'Pengelola persuratan, agenda, rapat, notulensi, pembuat laporan bulanan/tahunan',
    permissions: [
      'letters.in.view', 'letters.in.create', 'letters.in.update',
      'letters.out.view', 'letters.out.create', 'letters.out.update',
      'decisions.view', 'decisions.create', 'decisions.update',
      'dispositions.view', 'dispositions.create', 'dispositions.update',
      'agendas.view', 'agendas.manage',
      'archives.view', 'archives.manage',
      'templates.view', 'templates.manage',
      'requests.view', 'requests.process',
      'meetings.view', 'meetings.manage',
      'meeting_minutes.create', 'meeting_minutes.update',
      'meeting_recommendations.create', 'meeting_recommendations.monitor',
      'recommendation_follow_ups.submit',
      'weekly_reports.view', 'weekly_reports.submit',
      'monthly_reports.view', 'monthly_reports.manage',
      'annual_reports.view', 'annual_reports.manage',
      'system.audit.view'
    ]
  },
  {
    id: 'validator_mudir',
    name: 'Validator Mudir Ma’had',
    description: 'Pimpinan pengambil keputusan, pemberi disposisi dan validator resmi laporan mingguan unit',
    permissions: [
      'letters.in.view', 'letters.out.view', 'decisions.view',
      'dispositions.view', 'dispositions.create',
      'agendas.view', 'archives.view', 'requests.view',
      'meetings.view', 'meeting_recommendations.monitor',
      'weekly_reports.view', 'weekly_reports.validate',
      'monthly_reports.view', 'annual_reports.view',
      'system.audit.view'
    ]
  },
  {
    id: 'unit_reporter',
    name: 'Pelapor Unit / Penanggung Jawab',
    description: 'Penanggung jawab unit kerja, pelapor mingguan dan pelaksana tindak lanjut rekomendasi rapat',
    permissions: [
      'agendas.view', 'requests.view', 'requests.create',
      'meeting_recommendations.monitor', 'recommendation_follow_ups.submit',
      'weekly_reports.view', 'weekly_reports.submit',
      'dispositions.view'
    ]
  },
  {
    id: 'viewer',
    name: 'Auditor & Pengamat (Viewer)',
    description: 'Hak akses baca untuk pemantauan evaluasi dan audit mutu internal',
    permissions: [
      'letters.in.view', 'letters.out.view', 'decisions.view',
      'agendas.view', 'archives.view', 'meetings.view',
      'meeting_recommendations.monitor', 'weekly_reports.view',
      'monthly_reports.view', 'annual_reports.view'
    ]
  }
];

export const DEMO_USERS: User[] = [
  {
    id: 'usr-superadmin',
    name: 'Dr. H. Abd. Aziz, M.Pd.I',
    email: 'superadmin@unia.ac.id',
    mahad_id: 'all',
    unit_id: 'unit-sekre-banin',
    position_id: 'pos-auditor',
    position_title: 'Direktur Kepesantrenan UNIA',
    role_id: 'super_admin',
    is_active: true
  },
  {
    id: 'usr-sekre-banin',
    name: 'Ust. Ahmad Zarkasyi, S.Pd',
    email: 'sekretariat.banin@unia.ac.id',
    mahad_id: 'mahad-banin',
    unit_id: 'unit-sekre-banin',
    position_id: 'pos-sekretaris',
    position_title: "Sekretaris Ma'had Lil Banin",
    role_id: 'admin_sekretariat',
    is_active: true
  },
  {
    id: 'usr-sekre-banat',
    name: 'Ustzh. Siti Maryam, S.Pd.I',
    email: 'sekretariat.banat@unia.ac.id',
    mahad_id: 'mahad-banat',
    unit_id: 'unit-sekre-banat',
    position_id: 'pos-sekretaris',
    position_title: "Sekretaris Ma'had Lil Banat",
    role_id: 'admin_sekretariat',
    is_active: true
  },
  {
    id: 'usr-mudir-banin',
    name: 'K.H. Moh. Khoirul Umam, M.Pd.I',
    email: 'mudir.banin@unia.ac.id',
    mahad_id: 'mahad-banin',
    unit_id: 'unit-sekre-banin',
    position_id: 'pos-mudir',
    position_title: "Mudir Ma'had Lil Banin",
    role_id: 'validator_mudir',
    is_active: true
  },
  {
    id: 'usr-mudir-banat',
    name: 'Nyai Hj. Nurul Hidayah, M.A',
    email: 'mudir.banat@unia.ac.id',
    mahad_id: 'mahad-banat',
    unit_id: 'unit-sekre-banat',
    position_id: 'pos-mudir',
    position_title: "Mudir Ma'had Lil Banat",
    role_id: 'validator_mudir',
    is_active: true
  },
  {
    id: 'usr-unit-pembinaan-banin',
    name: 'Ust. M. Syukron Katsir, Lc., M.H',
    email: 'pembinaan.banin@unia.ac.id',
    mahad_id: 'mahad-banin',
    unit_id: 'unit-pembinaan-banin',
    position_id: 'pos-kabid',
    position_title: 'Kabid Pembinaan Putra',
    role_id: 'unit_reporter',
    is_active: true
  },
  {
    id: 'usr-unit-bahasa-banat',
    name: 'Ustzh. Fatimatuz Zahro, S.Hum',
    email: 'bahasa.banat@unia.ac.id',
    mahad_id: 'mahad-banat',
    unit_id: 'unit-bahasa-banat',
    position_id: 'pos-kabid',
    position_title: 'Koordinator Bahasa Putri',
    role_id: 'unit_reporter',
    is_active: true
  },
  {
    id: 'usr-viewer',
    name: 'Ust. H. Munir Al-Faruqi, M.Ag',
    email: 'auditor@unia.ac.id',
    mahad_id: 'all',
    unit_id: 'unit-sekre-banin',
    position_id: 'pos-auditor',
    position_title: 'Badan Penjaminan Mutu UNIA',
    role_id: 'viewer',
    is_active: true
  }
];

export const INITIAL_REPORT_PERIODS: ReportPeriod[] = [
  {
    id: 'per-w37-2026',
    name: 'Minggu ke-3 September 2026 (W37)',
    type: 'weekly',
    start_date: '2026-09-14',
    end_date: '2026-09-20',
    mahad_id: 'all',
    is_active: true
  },
  {
    id: 'per-w38-2026',
    name: 'Minggu ke-4 September 2026 (W38)',
    type: 'weekly',
    start_date: '2026-09-21',
    end_date: '2026-09-27',
    mahad_id: 'all',
    is_active: true
  },
  {
    id: 'per-m09-2026',
    name: 'Bulan September 2026',
    type: 'monthly',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    mahad_id: 'all',
    is_active: true
  },
  {
    id: 'per-y2026',
    name: 'Tahun Akademik 2026',
    type: 'annual',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    mahad_id: 'all',
    is_active: true
  }
];

export const INITIAL_LETTERS_IN: LetterIn[] = [
  {
    id: 'let-in-001',
    mahad_id: 'mahad-banin',
    nomor_surat: '012/REK/UNIA/IX/2026',
    nomor_agenda: 'AG-LBN-2026-089',
    tanggal_surat: '2026-09-15',
    tanggal_diterima: '2026-09-16',
    pengirim: 'Rektorat Universitas Al-Amien Prenduan',
    perihal: 'Koordinasi Pelaksanaan Pekan Orientasi Mahasantri Baru 1448 H',
    tujuan: "Mudir Ma'had Lil Banin",
    sifat: 'Penting',
    klasifikasi: '01/AKAD/ORIENTASI',
    ringkasan: 'Permohonan kesiapan fasilitas asrama dan jadwal ta’aruf mahasantri baru tingkat universitas di lingkungan Ma’had Putra.',
    lampiran_count: 2,
    file_name: 'Surat_Rektorat_Orientasi_2026.pdf',
    status: 'Didisposisi',
    catatan: 'Disposisi langsung diteruskan ke Bidang Pembinaan & Sekretariat untuk rapat koordinasi',
    petugas_penerima: 'Ust. Ahmad Zarkasyi, S.Pd',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-16T08:30:00Z',
    updated_at: '2026-09-16T09:10:00Z'
  },
  {
    id: 'let-in-002',
    mahad_id: 'mahad-banin',
    nomor_surat: '045/DKM-JAMI/UNIA/IX/2026',
    nomor_agenda: 'AG-LBN-2026-090',
    tanggal_surat: '2026-09-17',
    tanggal_diterima: '2026-09-18',
    pengirim: "Pengurus Ta'mir Masjid Jami' Al-Amien",
    perihal: 'Jadwal Imam dan Muadzin Salat Fardhu Periode Rabiul Awal 1448 H',
    tujuan: "Sekretariat Ma'had Putra",
    sifat: 'Biasa',
    klasifikasi: '03/IBADAH/JADWAL',
    ringkasan: 'Daftar penugasan asatidz dan mahasantri tahfidz sebagai imam salat rawatib dan sholat malam.',
    lampiran_count: 1,
    file_name: 'Jadwal_Imam_Rabiul_Awal_1448.pdf',
    status: 'Selesai',
    catatan: 'Sudah disosialisasikan dan diarsipkan ke digital archive.',
    petugas_penerima: 'Ust. Ahmad Zarkasyi, S.Pd',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-18T10:15:00Z',
    updated_at: '2026-09-18T11:00:00Z'
  },
  {
    id: 'let-in-003',
    mahad_id: 'mahad-banat',
    nomor_surat: '028/DIR-KPS/UNIA/IX/2026',
    nomor_agenda: 'AG-LBT-2026-054',
    tanggal_surat: '2026-09-16',
    tanggal_diterima: '2026-09-17',
    pengirim: 'Direktorat Kepesantrenan UNIA',
    perihal: 'Instruksi Penguatan Disiplin Percakapan Bahasa Arab & Inggris di Asrama Putri',
    tujuan: "Mudir Ma'had Lil Banat",
    sifat: 'Segera',
    klasifikasi: '02/BAHASA/DISIPLIN',
    ringkasan: 'Arahan agar Bagian Bahasa Putri menggelar penyegaran tajdid al-lughah pasca liburan semester.',
    lampiran_count: 1,
    file_name: 'Instruksi_Penguatan_Bahasa_Banat.pdf',
    status: 'Didisposisi',
    catatan: 'Diteruskan ke Bagian Bahasa Putri untuk eksekusi program.',
    petugas_penerima: 'Ustzh. Siti Maryam, S.Pd.I',
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-17T09:00:00Z',
    updated_at: '2026-09-17T10:20:00Z'
  }
];

export const INITIAL_LETTERS_OUT: LetterOut[] = [
  {
    id: 'let-out-001',
    mahad_id: 'mahad-banin',
    nomor_surat: '088/MHD-LBN/UNIA/IX/2026',
    tanggal: '2026-09-18',
    tujuan: 'Para Kepala Bidang & Koordinator Asrama Ma’had Putra',
    perihal: 'Undangan Rapat Evaluasi Mingguan Pembinaan & Disiplin Mahasantri',
    jenis_surat: 'Surat Undangan Dinas',
    sifat: 'Penting',
    isi_ringkas: 'Mengharap kehadiran seluruh kepala bidang pada rapat evaluasi hari Sabtu malam di Aula Sekretariat Putra.',
    penandatangan: "K.H. Moh. Khoirul Umam, M.Pd.I (Mudir Ma'had Putra)",
    lampiran_count: 1,
    file_name: 'Undangan_Rapat_Evaluasi_19Sept2026.pdf',
    status: 'Selesai',
    catatan: 'Surat telah dikirim melalui sekretariat ke seluruh koordinator unit.',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-18T13:00:00Z',
    updated_at: '2026-09-18T14:30:00Z'
  },
  {
    id: 'let-out-002',
    mahad_id: 'mahad-banat',
    nomor_surat: '061/MHD-LBT/UNIA/IX/2026',
    tanggal: '2026-09-19',
    tujuan: 'Seluruh Pembina Halaqah dan Musyrifah Ma’had Putri',
    perihal: 'Surat Edaran Jadwal Muhadhoroh Kubro & Gerakan Literasi Keputrian',
    jenis_surat: 'Surat Edaran',
    sifat: 'Biasa',
    isi_ringkas: 'Pedoman pembagian kelompok muhadhoroh dan pengawasan bahasa mahasantriwati di asrama.',
    penandatangan: "Nyai Hj. Nurul Hidayah, M.A (Mudir Ma'had Putri)",
    lampiran_count: 2,
    file_name: 'Edaran_Muhadhoroh_Kubro_LBT.pdf',
    status: 'Selesai',
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-19T09:30:00Z',
    updated_at: '2026-09-19T11:00:00Z'
  }
];

export const INITIAL_DECISIONS: Decision[] = [
  {
    id: 'sk-001',
    mahad_id: 'mahad-banin',
    nomor_sk: 'SK-014/MHD-LBN/UNIA/2026',
    judul: 'Keputusan Mudir Ma’had Lil Banin UNIA tentang Tim Pembina Kedisiplinan & Tarbiyah Mahasantri TA 2026/2027',
    tentang: 'Penetapan Struktur Pengurus Pembina Disiplin Asrama Putra',
    tanggal: '2026-09-01',
    pejabat_penandatangan: "K.H. Moh. Khoirul Umam, M.Pd.I",
    dasar_hukum: 'Statuta Universitas Al-Amien Prenduan Bab V Pasal 18 tentang Tata Kelola Keasramaan dan Kepesantrenan.',
    lampiran_count: 2,
    file_name: 'SK_Tim_Pembina_Disiplin_Banin_2026.pdf',
    status: 'Disahkan',
    catatan: 'SK berlaku selama satu tahun akademik.',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-01T08:00:00Z',
    updated_at: '2026-09-02T10:00:00Z'
  },
  {
    id: 'sk-002',
    mahad_id: 'mahad-banat',
    nomor_sk: 'SK-009/MHD-LBT/UNIA/2026',
    judul: 'Keputusan Mudir Ma’had Lil Banat UNIA tentang Standar Operasional Prosedur (SOP) Perizinan Mahasantriwati',
    tentang: 'Pemberlakuan SOP Baru Perizinan Pulang & Kunjungan Wali Mahasantri',
    tanggal: '2026-09-05',
    pejabat_penandatangan: "Nyai Hj. Nurul Hidayah, M.A",
    dasar_hukum: 'Hasil Musyawarah Majelis Mudir dan Pengasuh Pondok Pesantren Al-Amien Prenduan.',
    lampiran_count: 1,
    file_name: 'SK_SOP_Perizinan_Banat_2026.pdf',
    status: 'Disahkan',
    catatan: 'Disosialisasikan ke seluruh wali mahasantriwati.',
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-05T09:00:00Z',
    updated_at: '2026-09-05T11:00:00Z'
  }
];

export const INITIAL_DISPOSITIONS: Disposition[] = [
  {
    id: 'disp-001',
    mahad_id: 'mahad-banin',
    letter_in_id: 'let-in-001',
    letter_nomor: '012/REK/UNIA/IX/2026',
    letter_perihal: 'Koordinasi Pelaksanaan Pekan Orientasi Mahasantri Baru 1448 H',
    pemberi_disposisi: "K.H. Moh. Khoirul Umam, M.Pd.I (Mudir)",
    target_unit_id: 'unit-pembinaan-banin',
    target_unit_name: 'Bidang Pembinaan & Tarbiyah Putra',
    instruksi: 'Segera susun draft tata tertib khusus keasramaan dan jadwal pengenalan tradisi Al-Amien bagi mahasantri baru. Laporkan sebelum tanggal 24 September 2026.',
    prioritas: 'Penting',
    deadline: '2026-09-24',
    status: 'Diproses',
    catatan_tindak_lanjut: 'Sedang dirumuskan bersama tim musyrif asrama',
    tanggal_disposisi: '2026-09-16',
    created_at: '2026-09-16T09:30:00Z'
  },
  {
    id: 'disp-002',
    mahad_id: 'mahad-banat',
    letter_in_id: 'let-in-003',
    letter_nomor: '028/DIR-KPS/UNIA/IX/2026',
    letter_perihal: 'Instruksi Penguatan Disiplin Percakapan Bahasa Arab & Inggris di Asrama Putri',
    pemberi_disposisi: "Nyai Hj. Nurul Hidayah, M.A (Mudir)",
    target_unit_id: 'unit-bahasa-banat',
    target_unit_name: 'Bagian Penggerak Bahasa (CLI) Putri',
    instruksi: 'Tindak lanjuti dengan apel pembukaan pekan bahasa Arab dan aktifkan kembali mahkamah lughah dengan pendekatan edukatif.',
    prioritas: 'Segera',
    deadline: '2026-09-23',
    status: 'Diproses',
    catatan_tindak_lanjut: 'Rencana apel bahasa hari Ahad pagi di pelataran asrama putri.',
    tanggal_disposisi: '2026-09-17',
    created_at: '2026-09-17T10:30:00Z'
  }
];

export const INITIAL_AGENDAS: Agenda[] = [
  {
    id: 'agd-001',
    mahad_id: 'mahad-banin',
    judul: 'Rapat Koordinasi Mingguan Majelis Pembina Asrama Banin',
    jenis: 'Rapat',
    tanggal: '2026-09-22',
    waktu_mulai: '20:00',
    waktu_selesai: '22:00',
    tempat: 'Ruang Sidang Sekretariat Ma’had Putra UNIA',
    penanggung_jawab: 'Ust. Ahmad Zarkasyi, S.Pd',
    peserta: 'Mudir, Sekretaris, Seluruh Kabid, Koordinator Asrama',
    deskripsi: 'Evaluasi program pekanan, tindak lanjut rekomendasi rapat lalu, dan verifikasi laporan mingguan unit.',
    reminder_days: 1,
    status: 'Direncanakan',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-19T08:00:00Z'
  },
  {
    id: 'agd-002',
    mahad_id: 'mahad-banin',
    judul: 'Kunjungan Tim Asesor Penjaminan Mutu Pesantren Kemenag RI',
    jenis: 'Penerimaan Tamu',
    tanggal: '2026-09-25',
    waktu_mulai: '08:30',
    waktu_selesai: '14:00',
    tempat: "Gedung Rektorat & Ma'had Putra UNIA",
    penanggung_jawab: 'Sekretariat Ma’had Putra & BPM',
    peserta: 'Pimpinan Pondok, Pengasuh, Mudir, Tim Administrasi',
    deskripsi: 'Verifikasi kelengkapan dokumen administrasi, data notulensi, persuratan, dan standar pelayanan santri.',
    reminder_days: 3,
    status: 'Direncanakan',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-18T11:00:00Z'
  },
  {
    id: 'agd-003',
    mahad_id: 'mahad-banat',
    judul: 'Gebyar Bahasa Asing & Muhadatsah Akbar Mahasantriwati',
    jenis: 'Kegiatan',
    tanggal: '2026-09-24',
    waktu_mulai: '06:00',
    waktu_selesai: '08:00',
    tempat: 'Lapangan Utama Ma’had Putri',
    penanggung_jawab: 'Ustzh. Fatimatuz Zahro, S.Hum',
    peserta: 'Seluruh Mahasantriwati & Asatidzah Lil Banat',
    deskripsi: 'Pembagian kosa kata tematik bahasa Arab dan demonstrasi pidato 3 bahasa.',
    reminder_days: 2,
    status: 'Direncanakan',
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-19T10:00:00Z'
  }
];

export const INITIAL_ARCHIVES: Archive[] = [
  {
    id: 'arc-001',
    mahad_id: 'mahad-banin',
    judul: 'Dokumen SK Pengesahan Tata Tertib Mahasantri Banin TA 2026',
    nomor_dokumen: 'SK-014/MHD-LBN/UNIA/2026',
    kategori: 'SK',
    tahun: 2026,
    unit_id: 'unit-sekre-banin',
    unit_name: "Sekretariat Ma'had Putra",
    tanggal: '2026-09-01',
    file_name: 'SK_Tatib_Mahasantri_2026_Signed.pdf',
    file_size: '2.4 MB',
    deskripsi: 'Buku saku dan lampiran resmi tata tertib kedisiplinan dan sistem poin pelanggaran asrama putra.',
    tags: ['SK', 'Tata Tertib', 'Disiplin', '2026'],
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-02T10:00:00Z'
  },
  {
    id: 'arc-002',
    mahad_id: 'mahad-banin',
    judul: 'Notulensi Rapat Pleno Koordinasi Awal Semester Ganjil 1448 H',
    nomor_dokumen: 'NOT-LBN-2026-018',
    kategori: 'Notulensi',
    tahun: 2026,
    unit_id: 'unit-sekre-banin',
    unit_name: "Sekretariat Ma'had Putra",
    tanggal: '2026-09-10',
    file_name: 'Notulensi_Pleno_Awal_Semester_Banin.pdf',
    file_size: '1.8 MB',
    deskripsi: 'Keputusan pembagian jadwal halaqah tarbiyah dan penetapan standar kelulusan tahsin Al-Quran.',
    tags: ['Notulensi', 'Rapat Pleno', 'Semester Ganjil'],
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-11T09:00:00Z'
  },
  {
    id: 'arc-003',
    mahad_id: 'mahad-banat',
    judul: 'Laporan Bulanan Sekretariat Ma’had Putri Periode Agustus 2026',
    nomor_dokumen: 'LAP-BLN-LBT-2026-08',
    kategori: 'Laporan',
    tahun: 2026,
    unit_id: 'unit-sekre-banat',
    unit_name: "Sekretariat Ma'had Putri",
    tanggal: '2026-09-02',
    file_name: 'Laporan_Bulanan_Sekre_Banat_Agustus_2026.pdf',
    file_size: '3.1 MB',
    deskripsi: 'Kompilasi rekap administrasi surat menyurat, rapat evaluasi, dan pelaksanaan pembinaan putri.',
    tags: ['Laporan Bulanan', 'Agustus 2026', 'Banat'],
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-02T14:00:00Z'
  }
];

export const INITIAL_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl-001',
    mahad_id: 'all',
    nama: 'Format Surat Tugas Dinas Pengasuhan Ma’had',
    kategori: 'Surat Tugas',
    format_nomor: '{NO}/ST/MHD-{MAHAD}/UNIA/{ROMAN_MONTH}/{YEAR}',
    deskripsi: 'Template resmi penugasan asatidz untuk kegiatan pendampingan dakwah, lomba kepesantrenan, atau kunjungan studi.',
    konten: `SURAT TUGAS
Nomor: {NOMOR_SURAT}

Mudir Ma'had {NAMA_MAHAD} Universitas Al-Amien Prenduan memberikan tugas kedinasan kepada:
Nama: {NAMA_PETUGAS}
Jabatan: {JABATAN_PETUGAS}
Unit Kerja: {UNIT_KERJA}

Untuk melaksanakan:
Keperluan: {URAIAN_TUGAS}
Tempat: {LOKASI_TUGAS}
Waktu Pelaksanaan: {TANGGAL_PELAKSANAAN}

Demikian surat tugas ini dibuat agar dapat dilaksanakan dengan penuh amanah dan tanggung jawab.

Prenduan, {TANGGAL_SURAT}
Mudir Ma'had {NAMA_MAHAD}

{NAMA_MUDIR}`,
    variabel: ['NOMOR_SURAT', 'NAMA_MAHAD', 'NAMA_PETUGAS', 'JABATAN_PETUGAS', 'UNIT_KERJA', 'URAIAN_TUGAS', 'LOKASI_TUGAS', 'TANGGAL_PELAKSANAAN', 'TANGGAL_SURAT', 'NAMA_MUDIR'],
    is_active: true,
    updated_at: '2026-09-10'
  },
  {
    id: 'tpl-002',
    mahad_id: 'all',
    nama: 'Format Undangan Rapat Dinas Ma’had',
    kategori: 'Undangan',
    format_nomor: '{NO}/UND/MHD-{MAHAD}/UNIA/{ROMAN_MONTH}/{YEAR}',
    deskripsi: 'Template undangan musyawarah kerja unit dan rapat mingguan sekretariat.',
    konten: `SURAT UNDANGAN RAPAT DINAS
Nomor: {NOMOR_SURAT}

Kepada Yth.
{DAFTAR_PENERIMA}
Di Tempat

Assalamu'alaikum Wr. Wb.
Mengharap dengan hormat kehadiran Bapak/Ibu/Ustadz pada agenda rapat yang insya Allah akan diselenggarakan pada:
Hari/Tanggal : {HARI_TANGGAL}
Waktu        : {WAKTU_RAPAT} WIB
Tempat       : {TEMPAT_RAPAT}
Agenda       : {AGENDA_PEMBAHASAN}

Mengingat pentingnya agenda ini, dimohon hadir tepat pada waktunya. Atas perhatiannya disampaikan terima kasih.

Wassalamu'alaikum Wr. Wb.
Sekretaris Ma'had {NAMA_MAHAD},

{NAMA_SEKRETARIS}`,
    variabel: ['NOMOR_SURAT', 'DAFTAR_PENERIMA', 'HARI_TANGGAL', 'WAKTU_RAPAT', 'TEMPAT_RAPAT', 'AGENDA_PEMBAHASAN', 'NAMA_MAHAD', 'NAMA_SEKRETARIS'],
    is_active: true,
    updated_at: '2026-09-12'
  }
];

export const INITIAL_REQUESTS: AdministrativeRequest[] = [
  {
    id: 'req-001',
    mahad_id: 'mahad-banin',
    pemohon_name: 'Ust. M. Syukron Katsir, Lc., M.H',
    unit_id: 'unit-pembinaan-banin',
    unit_name: 'Bidang Pembinaan & Tarbiyah Putra',
    jenis_permohonan: 'Penerbitan Surat Tugas Pemateri Daurah Tarbawiyah',
    tanggal: '2026-09-17',
    keperluan: 'Penerbitan surat tugas resmi bagi 4 orang asatidz senior pembina halaqah tahfidz untuk kegiatan dauroh intensif akhir pekan.',
    lampiran_file: 'Daftar_Nama_Pemateri_Daurah.pdf',
    status: 'Diproses',
    catatan_petugas: 'Draft surat tugas sedang disiapkan oleh sekretariat',
    penanggung_jawab: 'Ust. Ahmad Zarkasyi, S.Pd',
    created_at: '2026-09-17T11:00:00Z',
    updated_at: '2026-09-17T13:30:00Z'
  },
  {
    id: 'req-002',
    mahad_id: 'mahad-banat',
    pemohon_name: 'Ustzh. Fatimatuz Zahro, S.Hum',
    unit_id: 'unit-bahasa-banat',
    unit_name: 'Bagian Penggerak Bahasa (CLI) Putri',
    jenis_permohonan: 'Permohonan Pengadaan Buku Panduan Kosa Kata Bahasa Arab',
    tanggal: '2026-09-18',
    keperluan: 'Permohonan persetujuan pengadaan 250 eksemplar buku saku mufradat harian untuk mahasantriwati baru.',
    status: 'Diajukan',
    catatan_petugas: 'Menunggu review alokasi anggaran dari Mudir',
    penanggung_jawab: 'Ustzh. Siti Maryam, S.Pd.I',
    created_at: '2026-09-18T09:20:00Z',
    updated_at: '2026-09-18T09:20:00Z'
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg-001',
    mahad_id: 'mahad-banin',
    judul_rapat: 'Rapat Evaluasi Penegakan Disiplin Asrama & Bahasa Putra',
    tanggal: '2026-09-14',
    waktu_mulai: '20:00',
    waktu_selesai: '22:30',
    tempat: 'Aula Sekretariat Ma’had Lil Banin UNIA',
    pimpinan_rapat: "K.H. Moh. Khoirul Umam, M.Pd.I (Mudir)",
    sekretaris_notulis: "Ust. Ahmad Zarkasyi, S.Pd",
    peserta: [
      "K.H. Moh. Khoirul Umam, M.Pd.I",
      "Ust. Ahmad Zarkasyi, S.Pd",
      "Ust. M. Syukron Katsir, Lc., M.H",
      "Ust. Ridwan Habibi, M.Pd",
      "Ust. Hendra Gunawan, S.Kom"
    ],
    agenda: '1. Evaluasi ketertiban salat subuh berjamaah; 2. Optimalisasi bahasa resmi santri di lingkungan asrama; 3. Rekomendasi perbaikan sarana sanitasi kamar santri.',
    status: 'Selesai',
    has_minute: true,
    minute_id: 'min-001',
    created_at: '2026-09-13T10:00:00Z'
  },
  {
    id: 'mtg-002',
    mahad_id: 'mahad-banat',
    judul_rapat: 'Rapat Koordinasi Persiapan Gebyar Muhadhoroh & Halaqah Al-Quran',
    tanggal: '2026-09-15',
    waktu_mulai: '19:30',
    waktu_selesai: '21:30',
    tempat: 'Gedung Kesenian Ma’had Putri UNIA',
    pimpinan_rapat: "Nyai Hj. Nurul Hidayah, M.A (Mudir)",
    sekretaris_notulis: "Ustzh. Siti Maryam, S.Pd.I",
    peserta: [
      "Nyai Hj. Nurul Hidayah, M.A",
      "Ustzh. Siti Maryam, S.Pd.I",
      "Ustzh. Halimatus Sa'diyah, M.Ag",
      "Ustzh. Fatimatuz Zahro, S.Hum"
    ],
    agenda: '1. Jadwal muhadhoroh kubro; 2. Pengadaan modul bahasa Arab; 3. Pemantauan mahasantriwati dengan capaian hafalan belum tuntas.',
    status: 'Selesai',
    has_minute: true,
    minute_id: 'min-002',
    created_at: '2026-09-14T08:00:00Z'
  }
];

export const INITIAL_MEETING_MINUTES: MeetingMinute[] = [
  {
    id: 'min-001',
    meeting_id: 'mtg-001',
    mahad_id: 'mahad-banin',
    judul_rapat: 'Notulensi Rapat Evaluasi Penegakan Disiplin Asrama & Bahasa Putra',
    jenis_rapat: 'Rapat Evaluasi Berkala',
    tanggal: '2026-09-14',
    waktu_mulai: '20:00',
    waktu_selesai: '22:30',
    tempat: 'Aula Sekretariat Ma’had Lil Banin UNIA',
    pimpinan_rapat: "K.H. Moh. Khoirul Umam, M.Pd.I",
    notulis: "Ust. Ahmad Zarkasyi, S.Pd",
    peserta: [
      "K.H. Moh. Khoirul Umam, M.Pd.I",
      "Ust. Ahmad Zarkasyi, S.Pd",
      "Ust. M. Syukron Katsir, Lc., M.H",
      "Ust. Ridwan Habibi, M.Pd",
      "Ust. Hendra Gunawan, S.Kom"
    ],
    agenda: '1. Evaluasi ketertiban salat subuh berjamaah; 2. Optimalisasi bahasa resmi santri di lingkungan asrama; 3. Rekomendasi sarana sanitasi.',
    pokok_pembahasan: 'Ditemukan penurunan kehadiran tepat waktu salat subuh pada blok asrama C dan D akibat begadang tugas kuliah. Selain itu, penggunaan bahasa campuran (Arab-Indonesia) masih sering terdengar di kantin santri.',
    hasil_pembahasan: 'Majelis pimpinan menyepakati perlunya ronda pagi serentak oleh staf tarbiyah dan pengawas keamanan, serta mewajibkan mahkamah bahasa bagi pelanggar bahasa resmi dengan metode edukatif ta’lim mufradat.',
    keputusan: '1. Penguncian pintu asrama pukul 04:15 WIB untuk memastikan santri menuju masjid tepat waktu; 2. Pemberlakuan zona wajib bahasa Arab di seluruh area kantin dan asrama; 3. Seluruh unit wajib melaporkan tindak lanjut rekomendasi dalam laporan mingguan.',
    status: 'Final',
    version: 1,
    lampiran: 'Daftar_Hadir_Rapat_14Sept2026.pdf',
    dokumentasi_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80',
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-14T23:00:00Z',
    updated_at: '2026-09-15T08:00:00Z'
  },
  {
    id: 'min-002',
    meeting_id: 'mtg-002',
    mahad_id: 'mahad-banat',
    judul_rapat: 'Notulensi Rapat Koordinasi Persiapan Gebyar Muhadhoroh & Halaqah Al-Quran',
    jenis_rapat: 'Rapat Koordinasi Program',
    tanggal: '2026-09-15',
    waktu_mulai: '19:30',
    waktu_selesai: '21:30',
    tempat: 'Gedung Kesenian Ma’had Putri UNIA',
    pimpinan_rapat: "Nyai Hj. Nurul Hidayah, M.A",
    notulis: "Ustzh. Siti Maryam, S.Pd.I",
    peserta: [
      "Nyai Hj. Nurul Hidayah, M.A",
      "Ustzh. Siti Maryam, S.Pd.I",
      "Ustzh. Halimatus Sa'diyah, M.Ag",
      "Ustzh. Fatimatuz Zahro, S.Hum"
    ],
    agenda: 'Persiapan gebyar muhadhoroh dan pemantauan tahfidz putri',
    pokok_pembahasan: 'Kesiapan panggung dan penguji muhadhoroh kubro bahasa Arab-Inggris serta evaluasi target setoran juziyyah.',
    hasil_pembahasan: 'Seluruh mahasantriwati semester 1-4 wajib tampil dalam giliran pidato berantai. Bagian bahasa menyediakan modul bimbingan retorika dakwah.',
    keputusan: 'Gebyar muhadhoroh ditetapkan pada tanggal 24 September 2026 dan bimbingan khusus tahfidz sore diaktifkan kembali.',
    status: 'Final',
    version: 1,
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-15T22:00:00Z',
    updated_at: '2026-09-16T08:00:00Z'
  }
];

export const INITIAL_RECOMMENDATIONS: MeetingRecommendation[] = [
  {
    id: 'rec-001',
    nomor_rekomendasi: 'REK/LBN/2026/09/001',
    meeting_id: 'mtg-001',
    minute_id: 'min-001',
    mahad_id: 'mahad-banin',
    meeting_title: 'Rapat Evaluasi Penegakan Disiplin Asrama & Bahasa Putra',
    isi_rekomendasi: 'Melakukan penertiban jam malam dan piket gerbang asrama blok C & D guna memastikan 100% santri berada di masjid sebelum adzan subuh berkumandang.',
    target_unit_id: 'unit-pembinaan-banin',
    target_unit_name: 'Bidang Pembinaan & Tarbiyah Putra',
    penanggung_jawab: 'Ust. M. Syukron Katsir, Lc., M.H',
    prioritas: 'Tinggi',
    tanggal: '2026-09-14',
    deadline: '2026-09-22',
    status: 'Sedang Ditindaklanjuti',
    catatan: 'Prioritas mendesak menjelang kedatangan asesor penjaminan mutu',
    progress_percent: 65,
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-14T23:30:00Z',
    updated_at: '2026-09-18T10:00:00Z'
  },
  {
    id: 'rec-002',
    nomor_rekomendasi: 'REK/LBN/2026/09/002',
    meeting_id: 'mtg-001',
    minute_id: 'min-001',
    mahad_id: 'mahad-banin',
    meeting_title: 'Rapat Evaluasi Penegakan Disiplin Asrama & Bahasa Putra',
    isi_rekomendasi: 'Menggelar razia bahasa resmi di area kantin dan asrama putra serta memberikan pembinaan hafalan 50 mufradat bagi santri yang belum disiplin.',
    target_unit_id: 'unit-bahasa-banin',
    target_unit_name: 'Bagian Penggerak Bahasa (CLI) Putra',
    penanggung_jawab: 'Ust. Ridwan Habibi, M.Pd',
    prioritas: 'Sedang',
    tanggal: '2026-09-14',
    deadline: '2026-09-25',
    status: 'Sedang Ditindaklanjuti',
    progress_percent: 40,
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-14T23:35:00Z',
    updated_at: '2026-09-17T11:00:00Z'
  },
  {
    id: 'rec-003',
    nomor_rekomendasi: 'REK/LBN/2026/09/003',
    meeting_id: 'mtg-001',
    minute_id: 'min-001',
    mahad_id: 'mahad-banin',
    meeting_title: 'Rapat Evaluasi Penegakan Disiplin Asrama & Bahasa Putra',
    isi_rekomendasi: 'Melakukan perbaikan dan sterilisasi instalasi air kran tempat wudhu masjid barat yang debit airnya melemah.',
    target_unit_id: 'unit-ibadah-banin',
    target_unit_name: "Bidang Ibadah & DKM Masjid Jami' Putra",
    penanggung_jawab: 'Ust. Fathurrahman Al-Hafidz, S.Ag',
    prioritas: 'Mendesak',
    tanggal: '2026-09-14',
    deadline: '2026-09-18',
    status: 'Selesai',
    catatan: 'Telah diperbaiki oleh tim sarpras dan teknisi pompa',
    tanggal_selesai: '2026-09-17',
    progress_percent: 100,
    created_by: 'usr-sekre-banin',
    created_at: '2026-09-14T23:40:00Z',
    updated_at: '2026-09-17T16:00:00Z'
  },
  {
    id: 'rec-004',
    nomor_rekomendasi: 'REK/LBT/2026/09/001',
    meeting_id: 'mtg-002',
    minute_id: 'min-002',
    mahad_id: 'mahad-banat',
    meeting_title: 'Rapat Koordinasi Persiapan Gebyar Muhadhoroh & Halaqah Al-Quran',
    isi_rekomendasi: 'Mendistribusikan modul retorika dakwah 3 bahasa kepada seluruh ketua kelompok muhadhoroh asrama putri paling lambat tanggal 21 September 2026.',
    target_unit_id: 'unit-bahasa-banat',
    target_unit_name: 'Bagian Penggerak Bahasa (CLI) Putri',
    penanggung_jawab: 'Ustzh. Fatimatuz Zahro, S.Hum',
    prioritas: 'Tinggi',
    tanggal: '2026-09-15',
    deadline: '2026-09-21',
    status: 'Sedang Ditindaklanjuti',
    progress_percent: 75,
    created_by: 'usr-sekre-banat',
    created_at: '2026-09-15T22:30:00Z',
    updated_at: '2026-09-19T08:00:00Z'
  }
];

export const INITIAL_FOLLOW_UPS: RecommendationFollowUp[] = [
  {
    id: 'flw-001',
    recommendation_id: 'rec-001',
    unit_id: 'unit-pembinaan-banin',
    status_update: 'Sedang Ditindaklanjuti',
    uraian_tindakan: 'Telah dibentuk regu piket gabungan pembina asrama untuk ronda blok C & D mulai pukul 03:45 WIB. Dilakukan pencatatan absensi langsung di pintu gerbang.',
    hasil: 'Tingkat keterlambatan santri di subuh hari menurun dari 18% menjadi 4% dalam 3 hari terakhir.',
    kendala: 'Masih ada santri yang belajar hingga lewat tengah malam karena tugas praktikum.',
    rencana_berikutnya: 'Sosialisasi batas akhir belajar mandiri maksimal pukul 23:00 WIB dan koordinasi dengan dosen pengampu.',
    tanggal_pelaksanaan: '2026-09-18',
    progress_percent: 65,
    submitted_by: 'Ust. M. Syukron Katsir, Lc., M.H',
    submitted_at: '2026-09-18T10:00:00Z'
  },
  {
    id: 'flw-002',
    recommendation_id: 'rec-003',
    unit_id: 'unit-ibadah-banin',
    status_update: 'Selesai',
    uraian_tindakan: 'Mengganti pipa hisap pompa air barat dan membersihkan filter tampungan tandon atas masjid.',
    hasil: 'Debit air wudhu kembali normal dan seluruh 24 kran wudhu berfungsi lancar.',
    kendala: 'Pipa cadangan sempat kosong sehingga menunggu pengadaan 1 hari.',
    rencana_berikutnya: 'Pemeriksaan berkala setiap hari Kamis pagi.',
    tanggal_pelaksanaan: '2026-09-17',
    progress_percent: 100,
    submitted_by: 'Ust. Fathurrahman Al-Hafidz, S.Ag',
    submitted_at: '2026-09-17T16:00:00Z'
  }
];

export const INITIAL_WEEKLY_REPORTS: WeeklyReport[] = [
  {
    id: 'rep-w37-pembinaan-banin',
    reporting_unit_id: 'unit-pembinaan-banin',
    reporting_unit_name: 'Bidang Pembinaan & Tarbiyah Putra',
    mahad_id: 'mahad-banin',
    period_id: 'per-w37-2026',
    minggu_ke: 3,
    bulan: 'September',
    tahun: 2026,
    tanggal_mulai: '2026-09-14',
    tanggal_selesai: '2026-09-20',
    penanggung_jawab: 'Ust. M. Syukron Katsir, Lc., M.H',
    ringkasan_kegiatan: 'Pelaksanaan bimbingan tarbiyah pekanan, penertiban disiplin salat subuh, dan verifikasi izin pulang santri.',
    kegiatan_selesai: [
      'Pemeriksaan kamar asrama serentak (Tanfidz Nadhafah) hari Jumat sore.',
      'Ronda gabungan penertiban subuh berjamaah blok C dan D.',
      'Penyelenggaraan kajian usbu’iyah kitab Akhlaq lil Banin bagi santri baru.'
    ],
    kegiatan_belum_selesai: [
      'Pemberian surat peringatan bagi 5 santri yang melanggar jam malam berulang kali.'
    ],
    kendala: 'Kapasitas ruang pembinaan khusus konseling masih terbatas saat jam puncak setelah isya.',
    tindak_lanjut: 'Memanfaatkan ruang tamu transit asrama untuk sesi konseling santri bermasalah.',
    rencana_minggu_depan: [
      'Penyusunan laporan rekapitulasi poin pelanggaran tengah semester.',
      'Sosialisasi jadwal pembinaan karakter jelang ujian tengah semester.'
    ],
    rekomendasi_ids: ['rec-001'],
    rekomendasi_details: [
      {
        id: 'rec-001',
        nomor: 'REK/LBN/2026/09/001',
        ringkasan: 'Penertiban jam malam dan subuh di blok C & D',
        tindakan: 'Ronda rutin jam 03:45 WIB dan absensi gerbang',
        progress: 65
      }
    ],
    status: 'Menunggu Validasi',
    version: 1,
    submitted_at: '2026-09-20T17:00:00Z',
    submitted_by: 'usr-unit-pembinaan-banin',
    created_at: '2026-09-19T14:00:00Z',
    updated_at: '2026-09-20T17:00:00Z'
  },
  {
    id: 'rep-w37-sekre-banin',
    reporting_unit_id: 'unit-sekre-banin',
    reporting_unit_name: "Sekretariat Ma'had Putra",
    mahad_id: 'mahad-banin',
    period_id: 'per-w37-2026',
    minggu_ke: 3,
    bulan: 'September',
    tahun: 2026,
    tanggal_mulai: '2026-09-14',
    tanggal_selesai: '2026-09-20',
    penanggung_jawab: 'Ust. Ahmad Zarkasyi, S.Pd',
    ringkasan_kegiatan: 'Pelayanan persuratan masuk dan keluar, penyelenggaraan rapat evaluasi dinas, monitoring rekomendasi unit, dan digitalisasi arsip SK.',
    kegiatan_selesai: [
      'Pencatatan dan disposisi 14 surat masuk ke pimpinan dan unit terkait.',
      'Penerbitan 8 surat tugas dan edaran resmi Ma’had Putra.',
      'Penyusunan notulensi dan penerbitan 3 rekomendasi rapat evaluasi tanggal 14 September 2026.',
      'Pengarsipan digital 24 dokumen resmi ke cloud arsip IDARAH.'
    ],
    kegiatan_belum_selesai: [
      'Finalisasi rekapitulasi draf Laporan Bulanan September 2026.'
    ],
    kendala: 'Keterlambatan input tindak lanjut dari sebagian staf unit yang sedang mengawal ujian.',
    tindak_lanjut: 'Pengiriman reminder otomatis melalui sistem notifikasi IDARAH kepada unit terkait.',
    rencana_minggu_depan: [
      'Kompilasi draft awal Laporan Bulanan September.',
      'Persiapan administrasi penyambutan tim asesor Kemenag.'
    ],
    rekomendasi_ids: [],
    status: 'Disetujui',
    version: 1,
    submitted_at: '2026-09-20T16:00:00Z',
    submitted_by: 'usr-sekre-banin',
    validated_at: '2026-09-20T19:00:00Z',
    validated_by: 'usr-mudir-banin',
    catatan_mudir: 'Alhamdulillah kerja administrasi rapi dan terukur. Lanjutkan persiapan akreditasi.',
    created_at: '2026-09-20T15:00:00Z',
    updated_at: '2026-09-20T19:00:00Z'
  },
  {
    id: 'rep-w37-bahasa-banat',
    reporting_unit_id: 'unit-bahasa-banat',
    reporting_unit_name: 'Bagian Penggerak Bahasa (CLI) Putri',
    mahad_id: 'mahad-banat',
    period_id: 'per-w37-2026',
    minggu_ke: 3,
    bulan: 'September',
    tahun: 2026,
    tanggal_mulai: '2026-09-14',
    tanggal_selesai: '2026-09-20',
    penanggung_jawab: 'Ustzh. Fatimatuz Zahro, S.Hum',
    ringkasan_kegiatan: 'Sosialisasi mufradat harian tematik kesehatan dan fiqih wanita, pemantauan ilqoul mufrodat setelah subuh, dan persiapan gebyar muhadhoroh.',
    kegiatan_selesai: [
      'Pemberian 21 kosakata baru bahasa Arab dan Inggris.',
      'Seleksi peserta debat bahasa Arab antar-angkatan mahasantriwati.',
      'Pendistribusian panduan pidato 3 bahasa ke 12 kelompok halaqah.'
    ],
    kegiatan_belum_selesai: [
      'Pencetakan banner panggung Gebyar Bahasa (sedang proses vendor).'
    ],
    kendala: 'Jadwal kuliah sore beberapa mahasantriwati berbenturan dengan waktu muhadatsah ba’da ashar.',
    tindak_lanjut: 'Menggeser jadwal percakapan sore khusus mahasantriwati tingkat akhir ke ba’da maghrib.',
    rencana_minggu_depan: [
      'Pelaksanaan puncak Gebyar Bahasa tanggal 24 September 2026.',
      'Pemberian penghargaan santriwati teladan berbahasa resmi bulan September.'
    ],
    rekomendasi_ids: ['rec-004'],
    status: 'Menunggu Validasi',
    version: 1,
    submitted_at: '2026-09-20T18:00:00Z',
    submitted_by: 'usr-unit-bahasa-banat',
    created_at: '2026-09-20T16:30:00Z',
    updated_at: '2026-09-20T18:00:00Z'
  }
];

export const INITIAL_MONTHLY_REPORTS: MonthlyReport[] = [
  {
    id: 'rep-m08-banin',
    mahad_id: 'mahad-banin',
    period_id: 'per-m08-2026',
    bulan: 'Agustus',
    tahun: 2026,
    judul: 'Laporan Bulanan Administrasi & Kepesantrenan Ma’had Lil Banin UNIA - Periode Agustus 2026',
    pendahuluan: 'Puji syukur kehadirat Allah SWT atas rahmat dan karunia-Nya, Ma’had Lil Banin Universitas Al-Amien Prenduan telah menyelesaikan agenda kegiatan bulan Agustus 2026 dengan lancar dan tertib. Laporan ini merupakan wujud pertanggungjawaban administratif atas dinamika pengasuhan, pelayanan persuratan, dan penegakan tata tertib mahasantri.',
    ringkasan_kegiatan: 'Bulan Agustus 2026 diwarnai dengan rangkaian penerimaan mahasantri baru, apel tahunan kepesantrenan, dan penataan struktur organisasi kepengurusan asrama baru.',
    rekap_kegiatan_unit: 'Seluruh unit kerja (Sekretariat, Pembinaan, Ibadah, Bahasa, dan Keamanan) telah menyampaikan laporan mingguan secara konsisten dengan tingkat kepatuhan pelaporan 92%.',
    administrasi_rekap: {
      surat_masuk_count: 42,
      surat_keluar_count: 36,
      sk_count: 8,
      disposisi_count: 29,
      agenda_count: 18
    },
    rapat_rekap: {
      total_rapat: 6,
      total_rekomendasi: 14,
      rekomendasi_selesai: 11,
      rekomendasi_berjalan: 3,
      rekomendasi_terlambat: 0
    },
    kegiatan_selesai_narasi: 'Pengesahan kalender kegiatan semester ganjil, pembaharuan SOP izin keluar kampus, serta perbaikan sistem sirkulasi air asrama putra.',
    kegiatan_belum_selesai_narasi: 'Digitalisasi kartu pelanggaran disiplin santri yang masih menunggu sinkronisasi modul akademik.',
    kendala_evaluasi: 'Kepadatan jadwal asatidz pembina dengan tugas tridharma perguruan tinggi di UNIA sehingga membutuhkan pengaturan jadwal musyawarah malam hari.',
    tindak_lanjut: 'Memaksimalkan komunikasi koordinasi terstruktur via aplikasi IDARAH untuk memangkas waktu rapat teknis.',
    rencana_bulan_depan: 'Persiapan audit kepatuhan mutu, pelaksanaan dauroh fiqih ibadah, dan penguatan bi’ah lughawiyyah.',
    penutup: 'Demikian laporan bulanan ini disusun untuk menjadi bahan evaluasi dan rujukan kebijakan Direktorat Kepesantrenan UNIA.',
    status: 'Disetujui',
    version: 2,
    disusun_oleh: 'Ust. Ahmad Zarkasyi, S.Pd',
    disetujui_oleh: "K.H. Moh. Khoirul Umam, M.Pd.I",
    created_at: '2026-08-31T10:00:00Z',
    updated_at: '2026-09-02T15:00:00Z'
  }
];

export const INITIAL_ANNUAL_REPORTS: AnnualReport[] = [
  {
    id: 'rep-y2025-banin',
    mahad_id: 'mahad-banin',
    tahun: 2025,
    judul: 'Laporan Tahunan Kinerja Pengasuhan & Administrasi Ma’had Lil Banin UNIA Tahun 2025',
    pendahuluan: 'Laporan tahunan ini menyajikan rekapitulasi menyeluruh atas seluruh kegiatan kepesantrenan, persuratan dinas, rekomendasi rapat pimpinan, dan evaluasi capaian visi pengasuhan Ma’had Lil Banin Universitas Al-Amien Prenduan sepanjang tahun 2025.',
    gambaran_umum: 'Ma’had Lil Banin membina lebih dari 850 mahasantri putra dari fakultas Tarbiyah, Ushuluddin, Dakwah, dan Ekonomi Bisnis Islam dengan komitmen integritas akhlaqul karimah dan kemandirian.',
    rekap_kegiatan_tahunan: 'Telah diselenggarakan 48 kali rapat koordinasi mingguan, 8 rapat pleno pengasuhan, serta 12 kegiatan tabligh akbar dan perlombaan kebahasaan tahunan.',
    rekap_administrasi_tahunan: {
      total_surat_masuk: 384,
      total_surat_keluar: 312,
      total_sk: 46,
      total_disposisi: 245,
      total_agenda: 156
    },
    rekap_rapat_tahunan: {
      total_rapat: 56,
      total_notulensi: 56,
      total_rekomendasi: 128,
      persentase_selesai: 94.5
    },
    capaian_kinerja_per_unit: 'Bidang Pembinaan berhasil menekan tingkat pelanggaran berat hingga 0%. Bidang Bahasa sukses menyelenggarakan Fasholatul Lughoh dengan tingkat kelulusan ujian bahasa Arab 91%.',
    evaluasi_kendala_tahunan: 'Kebutuhan modernisasi pengarsipan persuratan berbasis web terpusat yang aman dan terstruktur.',
    rekomendasi_pengembangan: 'Implementasi aplikasi administrasi terpadu IDARAH lintas Ma’had Putra dan Putri untuk efisiensi birokrasi dan auditabilitas dokumen.',
    rencana_strategis_tahun_depan: 'Penguatan sistem manajemen mutu ISO pesantren, perluasan program bilingual, dan standarisasi tata kelola notulensi rapat.',
    penutup: 'Semoga ikhtiar pengabdian ini senantiasa diridhai Allah SWT dalam mencetak kader ulama mu’allim, muballigh, dan mujahid.',
    status: 'Disahkan',
    version: 1,
    disusun_oleh: 'Ust. Ahmad Zarkasyi, S.Pd',
    disahkan_oleh: "K.H. Moh. Khoirul Umam, M.Pd.I",
    created_at: '2025-12-30T10:00:00Z',
    updated_at: '2026-01-05T14:00:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    user_id: 'usr-unit-pembinaan-banin',
    mahad_id: 'mahad-banin',
    type: 'rekomendasi_baru',
    title: 'Rekomendasi Rapat Baru',
    message: 'Anda mendapatkan rekomendasi tindak lanjut dari: “Rapat Evaluasi Penegakan Disiplin Asrama & Bahasa Putra”. Deadline: 22 September 2026.',
    related_entity: 'recommendation',
    related_entity_id: 'rec-001',
    read: false,
    created_at: '2026-09-14T23:30:00Z'
  },
  {
    id: 'notif-002',
    user_id: 'usr-mudir-banin',
    mahad_id: 'mahad-banin',
    type: 'laporan_menunggu_validasi',
    title: 'Laporan Mingguan Menunggu Validasi',
    message: 'Bidang Pembinaan & Tarbiyah Putra telah mengajukan Laporan Mingguan W37. Silakan lakukan pemeriksaan dan validasi.',
    related_entity: 'weekly_report',
    related_entity_id: 'rep-w37-pembinaan-banin',
    read: false,
    created_at: '2026-09-20T17:00:00Z'
  },
  {
    id: 'notif-003',
    user_id: 'usr-sekre-banin',
    mahad_id: 'mahad-banin',
    type: 'disposisi_baru',
    title: 'Disposisi Surat Masuk',
    message: 'Mudir Ma’had telah memberikan disposisi atas Surat Rektorat UNIA No. 012/REK/UNIA/IX/2026 perihal Orientasi Mahasantri.',
    related_entity: 'disposition',
    related_entity_id: 'disp-001',
    read: true,
    created_at: '2026-09-16T09:35:00Z',
    read_at: '2026-09-16T10:00:00Z'
  },
  {
    id: 'notif-004',
    user_id: 'usr-unit-bahasa-banat',
    mahad_id: 'mahad-banat',
    type: 'rekomendasi_baru',
    title: 'Rekomendasi Rapat Baru',
    message: 'Rekomendasi dari “Rapat Koordinasi Persiapan Gebyar Muhadhoroh”: Distribusi modul dakwah 3 bahasa. Deadline: 21 September 2026.',
    related_entity: 'recommendation',
    related_entity_id: 'rec-004',
    read: false,
    created_at: '2026-09-15T22:30:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    user_id: 'usr-sekre-banin',
    user_name: 'Ust. Ahmad Zarkasyi, S.Pd',
    user_role: 'Admin Sekretariat Ma’had',
    mahad_id: 'mahad-banin',
    action: 'CREATE',
    entity: 'Surat Masuk',
    entity_id: 'let-in-001',
    description: 'Mencatat surat masuk baru dari Rektorat UNIA No. 012/REK/UNIA/IX/2026',
    timestamp: '2026-09-16T08:30:00Z'
  },
  {
    id: 'log-002',
    user_id: 'usr-mudir-banin',
    user_name: 'K.H. Moh. Khoirul Umam, M.Pd.I',
    user_role: 'Validator Mudir Ma’had',
    mahad_id: 'mahad-banin',
    action: 'CREATE',
    entity: 'Disposisi',
    entity_id: 'disp-001',
    description: 'Menerbitkan disposisi kepada Bidang Pembinaan & Tarbiyah Putra',
    timestamp: '2026-09-16T09:30:00Z'
  },
  {
    id: 'log-003',
    user_id: 'usr-unit-pembinaan-banin',
    user_name: 'Ust. M. Syukron Katsir, Lc., M.H',
    user_role: 'Pelapor Unit',
    mahad_id: 'mahad-banin',
    action: 'SUBMIT',
    entity: 'Laporan Mingguan',
    entity_id: 'rep-w37-pembinaan-banin',
    description: 'Mengajukan Laporan Mingguan W37 periode 14-20 September 2026 kepada Mudir Ma’had Putra',
    timestamp: '2026-09-20T17:00:00Z'
  },
  {
    id: 'log-004',
    user_id: 'usr-mudir-banin',
    user_name: 'K.H. Moh. Khoirul Umam, M.Pd.I',
    user_role: 'Validator Mudir Ma’had',
    mahad_id: 'mahad-banin',
    action: 'APPROVE',
    entity: 'Laporan Mingguan',
    entity_id: 'rep-w37-sekre-banin',
    description: 'Menyetujui dan memvalidasi Laporan Mingguan W37 Sekretariat Ma’had Putra dengan catatan evaluasi',
    timestamp: '2026-09-20T19:00:00Z'
  }
];

export const INITIAL_VERSION_HISTORIES: VersionHistory[] = [
  {
    id: 'ver-min-001-v1',
    entity_type: 'minute',
    entity_id: 'min-001',
    version_number: 1,
    author_id: 'usr-sekre-banin',
    author_name: 'Ust. Ahmad Zarkasyi, S.Pd',
    timestamp: '2026-09-14T23:00:00Z',
    change_summary: 'Draf awal notulensi rapat evaluasi penegakan disiplin dan bahasa putra.',
    snapshot: {}
  },
  {
    id: 'ver-rep-m08-v1',
    entity_type: 'monthly_report',
    entity_id: 'rep-m08-banin',
    version_number: 1,
    author_id: 'usr-sekre-banin',
    author_name: 'Ust. Ahmad Zarkasyi, S.Pd',
    timestamp: '2026-08-31T10:00:00Z',
    change_summary: 'Penyusunan awal laporan bulanan berdasarkan kompilasi rekapitulasi mingguan.',
    snapshot: {}
  },
  {
    id: 'ver-rep-m08-v2',
    entity_type: 'monthly_report',
    entity_id: 'rep-m08-banin',
    version_number: 2,
    author_id: 'usr-sekre-banin',
    author_name: 'Ust. Ahmad Zarkasyi, S.Pd',
    timestamp: '2026-09-02T15:00:00Z',
    change_summary: 'Penambahan narasi evaluasi kendala jadwal asatidz dan persetujuan Mudir.',
    snapshot: {}
  }
];
