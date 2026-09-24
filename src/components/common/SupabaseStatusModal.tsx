import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  Key,
  ExternalLink,
  Server,
  ArrowUpRight,
  ListChecks,
  Copy,
  Check
} from 'lucide-react';
import { Modal } from './Modal';
import { db } from '../../services/db';
import {
  isSupabaseConfigured,
  getSupabaseCredentials,
  saveSupabaseCredentials,
  testSupabaseConnection,
  diagnoseSupabaseTables,
  TableDiagnosticResult,
  SUPABASE_QUICK_FIX_SQL
} from '../../services/supabase';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [diagnostics, setDiagnostics] = useState<TableDiagnosticResult[] | null>(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [syncStatus, setSyncStatus] = useState(db.getSupabaseSyncStatus());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSqlHelp, setCopiedSqlHelp] = useState(false);
  const [showQuickSql, setShowQuickSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setUrl(creds.url);
      setAnonKey(creds.key);
      setSyncStatus(db.getSupabaseSyncStatus());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setSyncStatus(db.getSupabaseSyncStatus());
    });
    return () => unsub();
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message
      });
      // Also run diagnostics for tables
      const diagResults = await diagnoseSupabaseTables();
      setDiagnostics(diagResults);
      if (!res.success) {
        setShowDiagnostics(true);
      }
    } catch (e: any) {
      setTestResult({
        tested: true,
        success: false,
        message: e?.message || 'Gagal menghubungi server Supabase.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(url.trim(), anonKey.trim());
    setSaveSuccess(true);
    setTestResult(null);
    setTimeout(() => setSaveSuccess(false), 3000);
    // Run test connection immediately after saving
    handleTestConnection();
  };

  const handleSyncNow = async () => {
    const res = await db.syncWithSupabase(false);
    setTestResult({
      tested: true,
      success: res.success,
      message: res.message
    });
    if (res.success) {
      const diag = await diagnoseSupabaseTables();
      setDiagnostics(diag);
    }
  };

  const handlePushAllData = async () => {
    setIsPushing(true);
    try {
      const res = await db.pushAllToSupabase();
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message
      });
      const diag = await diagnoseSupabaseTables();
      setDiagnostics(diag);
      setShowDiagnostics(true);
    } finally {
      setIsPushing(false);
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Integrasi Supabase & Cloud Database"
      subtitle="Koneksi basis data PostgreSQL terkelola untuk IDARAH UNIA"
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3.5 transition-colors ${
            isConnected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              isConnected
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-bold text-sm tracking-tight">
                {isConnected
                  ? 'Supabase Terhubung & Aktif'
                  : 'Mode Cache Lokal (Kredensial Belum Lengkap)'}
              </h4>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isConnected ? 'PostgreSQL Cloud Ready' : 'Local Storage Cache'}
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {isConnected
                ? `Koneksi aktif ke ${syncStatus.url || 'Supabase'}. Data lokal dan cloud disinkronkan secara aman.`
                : 'Aplikasi saat ini berjalan menggunakan data lokal offline. Masukkan URL dan Anon Key Supabase di bawah untuk mengaktifkan sinkronisasi.'}
            </p>

            {syncStatus.lastSyncTime && (
              <div className="mt-2 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Terakhir sinkronisasi:{' '}
                {new Date(syncStatus.lastSyncTime).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            )}

            {syncStatus.error && (
              <div className="mt-2 p-2 bg-rose-100/80 text-rose-900 rounded-lg text-[11px] flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                <span>{syncStatus.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !url || !anonKey}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-emerald-600' : ''}`} />
            {isTesting ? 'Menguji...' : 'Uji Koneksi'}
          </button>

          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncStatus.isSyncing || !isConnected}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            {syncStatus.isSyncing ? 'Menyinkronkan...' : 'Tarik Data Cloud'}
          </button>

          <button
            type="button"
            onClick={handlePushAllData}
            disabled={isPushing || syncStatus.isSyncing || !isConnected}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Kirim seluruh data demo & lokal ke tabel Supabase"
          >
            <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
            {isPushing ? 'Mengunggah...' : 'Unggah Data ke Cloud'}
          </button>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border animate-in fade-in duration-200 ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            )}
            <div className="flex-1 space-y-1">
              <div className="font-bold">
                {testResult.success ? 'Koneksi Berhasil!' : 'Perhatian Sinkronisasi:'}
              </div>
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}

        {/* Critical SQL Notice Banner */}
        <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Server className="w-4 h-4 text-amber-700" />
              Perbaikan Skema: monthly_reports & annual_reports
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_QUICK_FIX_SQL);
                  setCopiedSqlHelp(true);
                  setTimeout(() => setCopiedSqlHelp(false), 3000);
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
              >
                {copiedSqlHelp ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedSqlHelp ? 'SQL Tersalin!' : 'Salin SQL Perbaikan'}
              </button>
              <button
                type="button"
                onClick={() => setShowQuickSql(!showQuickSql)}
                className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-[11px] font-medium transition-colors"
              >
                {showQuickSql ? 'Tutup Kode' : 'Lihat SQL'}
              </button>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed text-amber-900">
            Kendala <em>"Could not find the 'created_at' column of 'monthly_reports'"</em> terjadi karena kolom <code>created_at</code> pada tabel laporan bulanan dan tahunan belum ada di database Supabase Anda. Anda dapat menyelesaikannya dengan dua cara:
          </p>

          <div className="space-y-1.5 text-[11px] text-amber-950 bg-amber-100/60 p-2.5 rounded-lg">
            <div>
              <strong>Cara Cepat (Tanpa Hapus Data Lain):</strong>
              <div className="text-amber-900">
                Klik tombol <strong>"Salin SQL Perbaikan"</strong> di atas, lalu tempel (*paste*) dan klik <strong>Run</strong> di SQL Editor Supabase.
              </div>
            </div>
            <div className="pt-1 border-t border-amber-200/70">
              <strong>Cara Menyeluruh:</strong>
              <div className="text-amber-900">
                Salin seluruh file <strong>supabase-schema.sql</strong> versi terbaru ke SQL Editor Supabase, lalu klik <strong>Run</strong>.
              </div>
            </div>
          </div>

          {showQuickSql && (
            <div className="mt-2 relative">
              <pre className="p-3 bg-slate-900 text-emerald-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-48 whitespace-pre leading-relaxed">
                {SUPABASE_QUICK_FIX_SQL}
              </pre>
            </div>
          )}
        </div>

        {/* Diagnostics Toggle */}
        {diagnostics && diagnostics.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
            >
              <span className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-600" />
                Status Pemeriksaan 24 Tabel Database Supabase
              </span>
              <span className="text-[11px] text-slate-500">
                {showDiagnostics ? 'Sembunyikan' : 'Tampilkan Rincian'}
              </span>
            </button>

            {showDiagnostics && (
              <div className="p-3 max-h-60 overflow-y-auto space-y-1 bg-white border-t border-slate-200 divide-y divide-slate-100 text-[11px]">
                {diagnostics.map(diag => (
                  <div
                    key={diag.table}
                    className="py-1.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {diag.status === 'ok' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      )}
                      <span className="font-mono text-slate-700 truncate">{diag.table}</span>
                      <span className="text-slate-400 text-[10px]">({diag.label})</span>
                    </div>

                    <div className="shrink-0 text-right">
                      {diag.status === 'ok' ? (
                        <span className="text-emerald-700 font-medium">
                          OK ({diag.rowCount} baris)
                        </span>
                      ) : (
                        <span className="text-rose-600 font-medium" title={diag.error}>
                          Error ({diag.error || 'Tabel belum ada'})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Configuration Form */}
        <form onSubmit={handleSaveCredentials} className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              Kredensial Supabase (URL & Anon Key)
            </h5>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer noopener"
              className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium hover:underline"
            >
              Buka Dashboard Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://xyzabcdefghijklm.supabase.co"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Anon / Public Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              required
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {saveSuccess ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Kredensial Berhasil Disimpan & Diuji!
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">
                Tersimpan di browser lokal & otomatis digunakan untuk transaksi
              </span>
            )}

            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Simpan & Hubungkan
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
