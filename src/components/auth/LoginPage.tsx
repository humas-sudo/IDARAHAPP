import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Users,
  KeyRound,
  FileSpreadsheet,
  Layers,
  Database
} from 'lucide-react';
import { auth } from '../../services/auth';
import { db } from '../../services/db';
import { User, RoleId } from '../../types';
import { isSupabaseConfigured } from '../../services/supabase';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('superadmin@unia.ac.id');
  const [password, setPassword] = useState('unia2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'form' | 'quick_roles'>('form');

  const users = db.getUsers();
  const isCloudConnected = isSupabaseConfigured();

  // Curated demo roles
  const demoRoleAccounts = [
    {
      id: 'usr-super-admin',
      roleTitle: 'Super Administrator',
      desc: 'Akses penuh seluruh 24 modul, Ma’had Putra & Putri, serta audit log sistem.',
      badge: 'Full Access',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
    },
    {
      id: 'usr-mudir-banin',
      roleTitle: 'Mudir Ma’had Lil Banin',
      desc: 'Pimpinan Ma’had Putra, persetujuan SK, dan validasi laporan unit mingguan.',
      badge: 'Validator Banin',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      id: 'usr-mudir-banat',
      roleTitle: 'Mudir Ma’had Lil Banat',
      desc: 'Pimpinan Ma’had Putri, persetujuan disposisi, dan evaluasi berkala santriwati.',
      badge: 'Validator Banat',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
    },
    {
      id: 'usr-sekre-banin',
      roleTitle: 'Admin Sekretariat Putra',
      desc: 'Pengelola surat masuk/keluar, agenda, arsip, notulensi rapat, dan buku ekspedisi.',
      badge: 'Sekretariat',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'usr-unit-pembinaan-banin',
      roleTitle: 'Pelapor Unit Kerja',
      desc: 'Penyusun laporan mingguan kegiatan pembinaan & pelaksana tindak lanjut rekomendasi.',
      badge: 'Unit Reporter',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
    },
    {
      id: 'usr-viewer',
      roleTitle: 'Auditor & Penjaminan Mutu',
      desc: 'Akses peninjauan dokumen, rekap statistik, evaluasi kinerja, dan audit kepatuhan.',
      badge: 'Auditor / Viewer',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-300'
    }
  ];

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await auth.login(identifier, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat proses masuk.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (userId: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      const result = auth.quickLogin(userId);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message);
      }
      setIsLoading(false);
    }, 250);
  };

  const handleFillCredentials = (email: string) => {
    setIdentifier(email);
    setPassword('unia2026');
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#062417] to-slate-950 flex flex-col justify-between text-slate-100 font-sans selection:bg-[#b48c36] selection:text-white">
      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-emerald-900/40 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0d5c3a] text-white flex items-center justify-center font-bold text-lg shadow-lg border border-[#b48c36]">
            <span>U</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-emerald-400">
                IDARAH UNIA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
                Official Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Tata Kelola Kepesantrenan Universitas Al-Amien Prenduan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {isCloudConnected ? 'Supabase Cloud Terhubung' : 'Mode Offline / Local DB Ready'}
          </span>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-slate-900/90 border border-emerald-800/40 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Left Hero Panel (Islamic Ornament & Institution Intro) */}
          <div className="lg:col-span-5 p-8 bg-gradient-to-br from-[#0d5c3a] to-[#062417] text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-700/40 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#b48c36]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-block px-3 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px] font-medium tracking-wide text-amber-300">
                إِدَارَةُ المَعْهَدِ – جَامِعَةُ الأَمِيْنِ الإِسْلَامِيَّةِ
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight font-serif">
                  Portal IDARAH Ma'had UNIA
                </h1>
                <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                  Sistem informasi terintegrasi tata kelola kepesantrenan Ma'had Lil Banin (Putra) dan Ma'had Lil Banat (Putri) Universitas Al-Amien Prenduan Sumenep Madura.
                </p>
              </div>

              <div className="pt-4 space-y-2.5 text-xs text-emerald-100/80">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Tata kelola persuratan, disposisi, & SK pimpinan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Notulensi rapat & pemantauan rekomendasi</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Pelaporan unit kerja mingguan, bulanan, & tahunan</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Sinkronisasi data multi-perangkat via Supabase</span>
                </div>
              </div>
            </div>

            {/* Quote / Footer Banner */}
            <div className="relative z-10 mt-8 pt-6 border-t border-emerald-600/30">
              <p className="text-[11px] italic text-emerald-200/90 leading-snug">
                "Tertib administrasi, amanah kepemimpinan, dan keberkahan pengabdian di lingkungan Ma'had UNIA."
              </p>
              <span className="block mt-2 text-[10px] font-semibold tracking-wider text-amber-300 uppercase">
                Biro Kepesantrenan & Sekretariat
              </span>
            </div>
          </div>

          {/* Right Form & Quick Access Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-slate-900/60">
            <div>
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Masuk ke Sistem</h2>
                  <p className="text-xs text-slate-400">Silakan otentikasi untuk membuka dasbor kerja</p>
                </div>

                <div className="flex rounded-lg bg-slate-800/80 p-0.5 border border-slate-700/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                      activeTab === 'form'
                        ? 'bg-[#0d5c3a] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Form Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quick_roles')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                      activeTab === 'quick_roles'
                        ? 'bg-[#0d5c3a] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    Pilih Peran Demo
                  </button>
                </div>
              </div>

              {/* Alert Notification */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* Tab 1: Standard Credential Form */}
              {activeTab === 'form' ? (
                <form onSubmit={handleFormLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Resmi UNIA / Username / ID Pengguna
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="superadmin@unia.ac.id"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Kata Sandi (Password)
                      </label>
                      <span className="text-[11px] text-amber-400/90 font-mono">
                        Default: unia2026
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-0"
                      />
                      <span>Ingat sesi masuk di peramban ini</span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Untuk keamanan, pemulihan kata sandi dapat dilakukan melalui Biro Administrasi UNIA (email: humas@unia.ac.id) atau gunakan akun demo default "unia2026".'
                        )
                      }
                      className="text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                      Bantuan Masuk?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-[#0d5c3a] hover:bg-[#0a472d] active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-600/50"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Memverifikasi Kredensial...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk ke Dasbor IDARAH</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Tab 2: Quick Demo Roles */
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  <div className="text-[11px] text-slate-400 mb-2">
                    Pilih salah satu profil di bawah ini untuk menguji hak akses dan antarmuka peran terkait secara langsung:
                  </div>

                  {demoRoleAccounts.map(demo => {
                    const matchedUser = users.find(u => u.id === demo.id);
                    if (!matchedUser) return null;

                    return (
                      <div
                        key={demo.id}
                        className="p-3 bg-slate-950/70 border border-slate-800 hover:border-emerald-600/60 rounded-xl flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                              {matchedUser.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${demo.badgeColor}`}
                            >
                              {demo.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            {matchedUser.position_title}
                          </div>
                          <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                            {demo.desc}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleFillCredentials(matchedUser.email)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                            title="Salin ke form login"
                          >
                            Isi Form
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin(matchedUser.id)}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-lg bg-[#0d5c3a] hover:bg-[#0a472d] text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <span>Masuk</span>
                            <ArrowRight className="w-3 h-3 text-amber-300" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card Footer Security Assurance */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Otentikasi Aman & Audit Trail UNIA Aktif</span>
              </div>
              <span className="font-mono text-slate-500 text-[10px]">IDARAH Core v1.0</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-emerald-950 bg-slate-950/80 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span>© {new Date().getFullYear()} Universitas Al-Amien Prenduan (UNIA).</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Ma'had Lil Banin & Ma'had Lil Banat</span>
      </footer>
    </div>
  );
};
