import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read Supabase credentials from environment variables or custom localStorage override
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// LocalStorage key for runtime configuration fallback if user wants to test without re-deploying
const OVERRIDE_URL_KEY = 'idarah_supabase_url_override';
const OVERRIDE_KEY_KEY = 'idarah_supabase_key_override';

export function getSupabaseCredentials(): { url: string; key: string; isOverride: boolean } {
  const overrideUrl = (typeof window !== 'undefined' ? localStorage.getItem(OVERRIDE_URL_KEY) || '' : '').trim();
  const overrideKey = (typeof window !== 'undefined' ? localStorage.getItem(OVERRIDE_KEY_KEY) || '' : '').trim();

  if (overrideUrl && overrideKey) {
    return {
      url: overrideUrl.replace(/\/+$/, ''),
      key: overrideKey,
      isOverride: true
    };
  }

  return {
    url: envUrl.replace(/\/+$/, ''),
    key: envKey,
    isOverride: false
  };
}

export function saveSupabaseCredentialsOverride(url: string, key: string) {
  if (typeof window !== 'undefined') {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const cleanKey = key.trim();
    if (cleanUrl && cleanKey) {
      localStorage.setItem(OVERRIDE_URL_KEY, cleanUrl);
      localStorage.setItem(OVERRIDE_KEY_KEY, cleanKey);
    } else {
      localStorage.removeItem(OVERRIDE_URL_KEY);
      localStorage.removeItem(OVERRIDE_KEY_KEY);
    }
  }
}

export const saveSupabaseCredentials = saveSupabaseCredentialsOverride;

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  const cleanUrl = url.trim().replace(/\/+$/, '');
  const cleanKey = key.trim();

  return (
    Boolean(cleanUrl) &&
    Boolean(cleanKey) &&
    (cleanUrl.startsWith('https://') || cleanUrl.startsWith('http://')) &&
    cleanKey.length > 20 &&
    !cleanUrl.includes('your-project-ref') &&
    !cleanKey.includes('your-anon-public-key')
  );
}

// Singleton Supabase Client
let clientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  const configKey = `${url}::${key}`;

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!clientInstance || currentConfigKey !== configKey) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      currentConfigKey = configKey;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      clientInstance = null;
    }
  }

  return clientInstance;
}

export interface TableDiagnosticResult {
  table: string;
  label: string;
  status: 'ok' | 'error';
  rowCount?: number;
  error?: string;
}

export const MONITORED_TABLES = [
  { table: 'mahads', label: "Data Ma'had" },
  { table: 'units', label: 'Unit & Bagian' },
  { table: 'users', label: 'Pengguna' },
  { table: 'roles', label: 'Peran & Hak Akses' },
  { table: 'positions', label: 'Struktur Jabatan' },
  { table: 'report_periods', label: 'Periode Laporan' },
  { table: 'letters_in', label: 'Surat Masuk' },
  { table: 'letters_out', label: 'Surat Keluar' },
  { table: 'decisions', label: 'Surat Keputusan (SK)' },
  { table: 'dispositions', label: 'Disposisi' },
  { table: 'agendas', label: 'Agenda & Kalender' },
  { table: 'archives', label: 'Arsip Dokumen' },
  { table: 'templates', label: 'Template Surat' },
  { table: 'administrative_requests', label: 'Permohonan Administrasi' },
  { table: 'meetings', label: 'Data Rapat' },
  { table: 'meeting_minutes', label: 'Notulensi Rapat' },
  { table: 'meeting_recommendations', label: 'Rekomendasi Rapat' },
  { table: 'recommendation_follow_ups', label: 'Tindak Lanjut Rekomendasi' },
  { table: 'weekly_reports', label: 'Laporan Mingguan' },
  { table: 'monthly_reports', label: 'Laporan Bulanan' },
  { table: 'annual_reports', label: 'Laporan Tahunan' },
  { table: 'notifications', label: 'Notifikasi' },
  { table: 'audit_logs', label: 'Audit Log' },
  { table: 'version_histories', label: 'Riwayat Versi' }
];

export async function diagnoseSupabaseTables(): Promise<TableDiagnosticResult[]> {
  const client = getSupabaseClient();
  if (!client) {
    return MONITORED_TABLES.map(t => ({
      ...t,
      status: 'error',
      error: 'Client Supabase belum siap.'
    }));
  }

  const results: TableDiagnosticResult[] = [];

  for (const item of MONITORED_TABLES) {
    try {
      const { count, error } = await client
        .from(item.table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        results.push({
          table: item.table,
          label: item.label,
          status: 'error',
          error: error.message
        });
      } else {
        results.push({
          table: item.table,
          label: item.label,
          status: 'ok',
          rowCount: count ?? 0
        });
      }
    } catch (err: unknown) {
      results.push({
        table: item.table,
        label: item.label,
        status: 'error',
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  return results;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL atau Anon Key belum dikonfigurasi secara valid.'
    };
  }

  try {
    // Check 1: Check mahads table
    const { error: errMahads } = await client.from('mahads').select('id').limit(1);
    if (errMahads) {
      if (errMahads.code === '42P01') {
        return {
          success: false,
          message: 'Terhubung ke Supabase, namun tabel belum dibuat. Harap jalankan script supabase-schema.sql di Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Koneksi Supabase gagal pada tabel mahads: ${errMahads.message}`
      };
    }

    // Check 2: Check letters_in table to verify schema columns (like pengirim, nomor_surat)
    const { error: errLetters } = await client.from('letters_in').select('id, pengirim, nomor_surat').limit(1);
    if (errLetters) {
      if (errLetters.message.includes('pengirim') || errLetters.code === '42703' || errLetters.code === 'PGRST204') {
        return {
          success: false,
          message: 'Tabel lama terdeteksi dengan nama kolom belum cocok (contoh: kolom pengirim belum ada). Harap jalankan skrip supabase-schema.sql terbaru di Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Verifikasi tabel letters_in: ${errLetters.message}`
      };
    }

    // Check 3: Check monthly_reports for created_at
    const { error: errMonthly } = await client.from('monthly_reports').select('id, created_at, kegiatan_selesai_narasi').limit(1);
    if (errMonthly) {
      if (errMonthly.message.includes('created_at') || errMonthly.code === '42703' || errMonthly.code === 'PGRST204') {
        return {
          success: false,
          message: "Tabel monthly_reports memerlukan pembaruan kolom (termasuk 'created_at'). Jalankan skrip pembaruan SQL di Supabase SQL Editor."
        };
      }
      return {
        success: false,
        message: `Verifikasi tabel monthly_reports: ${errMonthly.message}`
      };
    }

    // Check 4: Check annual_reports for created_at & tahun
    const { error: errAnnual } = await client.from('annual_reports').select('id, created_at, tahun').limit(1);
    if (errAnnual) {
      if (errAnnual.message.includes('created_at') || errAnnual.code === '42703' || errAnnual.code === 'PGRST204') {
        return {
          success: false,
          message: "Tabel annual_reports memerlukan pembaruan kolom (termasuk 'created_at' dan 'tahun'). Jalankan skrip pembaruan SQL di Supabase SQL Editor."
        };
      }
      return {
        success: false,
        message: `Verifikasi tabel annual_reports: ${errAnnual.message}`
      };
    }

    return {
      success: true,
      message: 'Koneksi ke Supabase berhasil! Seluruh tabel & kolom terverifikasi siap disinkronisasi.'
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal menghubungi server Supabase: ${errorMsg}`
    };
  }
}

export const SUPABASE_QUICK_FIX_SQL = `-- Quick Fix untuk tabel monthly_reports dan annual_reports:
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS kegiatan_selesai_narasi TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS kegiatan_belum_selesai_narasi TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS kendala_evaluasi TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS tindak_lanjut TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS rencana_bulan_depan TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS penutup TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS disusun_oleh TEXT;
ALTER TABLE IF EXISTS monthly_reports ADD COLUMN IF NOT EXISTS disetujui_oleh TEXT;

ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS tahun INT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS gambaran_umum TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS rekap_kegiatan_tahunan TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS rekap_administrasi_tahunan JSONB DEFAULT '{}'::JSONB;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS rekap_rapat_tahunan JSONB DEFAULT '{}'::JSONB;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS capaian_kinerja_per_unit TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS evaluasi_kendala_tahunan TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS rekomendasi_pengembangan TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS rencana_strategis_tahun_depan TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS penutup TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS version INT DEFAULT 1;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS disusun_oleh TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS disahkan_oleh TEXT;
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE IF EXISTS annual_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
`;
