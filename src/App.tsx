import React, { useState, useEffect } from 'react';
import { User, MahadId } from './types';
import { auth } from './services/auth';
import { db } from './services/db';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Modal } from './components/common/Modal';
import { SupabaseStatusModal } from './components/common/SupabaseStatusModal';
import { LoginPage } from './components/auth/LoginPage';

// Dashboard
import { Dashboard } from './components/dashboard/Dashboard';

// Administrasi
import { SuratMasuk } from './components/admin/SuratMasuk';
import { SuratKeluar } from './components/admin/SuratKeluar';
import { SuratKeputusan } from './components/admin/SuratKeputusan';
import { Disposisi } from './components/admin/Disposisi';
import { AgendaSekretariat } from './components/admin/AgendaSekretariat';
import { ArsipDigital } from './components/admin/ArsipDigital';
import { TemplateDokumen } from './components/admin/TemplateDokumen';
import { PermohonanAdministrasi } from './components/admin/PermohonanAdministrasi';
import { UserManagement } from './components/admin/UserManagement';

// Rapat & Rekomendasi
import { DataRapat } from './components/meetings/DataRapat';
import { NotulensiRapat } from './components/meetings/NotulensiRapat';
import { RekomendasiRapat } from './components/meetings/RekomendasiRapat';
import { MonitoringRekomendasi } from './components/meetings/MonitoringRekomendasi';

// Pelaporan
import { LaporanUnit } from './components/reports/LaporanUnit';
import { StatistikAnalitik } from './components/reports/StatistikAnalitik';
import { BukuEkspedisi } from './components/reports/BukuEkspedisi';

import { Search, Bell, CheckCircle2, FileText, ArrowRight, Shield } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => auth.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User | null>(() => (auth.isAuthenticated() ? auth.getCurrentUser() : null));
  const [activeMahadId, setActiveMahadId] = useState<MahadId>(() => {
    const user = auth.isAuthenticated() ? auth.getCurrentUser() : null;
    return user && user.mahad_id !== 'all' ? user.mahad_id : 'mahad-banin';
  });

  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);

  // Workflow tracking states
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | undefined>();
  const [selectedRecId, setSelectedRecId] = useState<string | undefined>();

  // Global Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to Auth & DB updates
  useEffect(() => {
    const unsubAuth = auth.subscribe(user => {
      const authed = auth.isAuthenticated();
      setIsAuthenticated(authed);
      if (authed && user) {
        setCurrentUser(user);
        if (user.mahad_id !== 'all') {
          setActiveMahadId(user.mahad_id);
        }
      } else {
        setCurrentUser(null);
      }
    });

    const unsubDb = db.subscribe(() => {
      if (auth.isAuthenticated()) {
        const u = auth.getCurrentUser();
        setCurrentUser(u);
      }
    });

    return () => {
      unsubAuth();
      unsubDb();
    };
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    if (user.mahad_id !== 'all') {
      setActiveMahadId(user.mahad_id);
    }
    setCurrentModule('dashboard');
  };

  const handleLogout = () => {
    auth.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleSelectMahad = (mahadId: MahadId) => {
    setActiveMahadId(mahadId);
  };

  const handleNavigate = (module: string, subId?: string) => {
    if (module === 'database_sync') {
      setIsSupabaseModalOpen(true);
      setIsSidebarMobileOpen(false);
      return;
    }

    if (module === 'pencarian') {
      setIsSearchOpen(true);
      setIsSidebarMobileOpen(false);
      return;
    }

    setCurrentModule(module);
    if (module === 'notulensi' && subId) {
      setSelectedMeetingId(subId);
    } else if (module === 'rekomendasi' && subId) {
      setSelectedMeetingId(subId);
    } else if (module === 'monitoring_rekomendasi' && subId) {
      setSelectedRecId(subId);
    }
    setIsSidebarMobileOpen(false);
  };

  // Search results
  const searchResults = searchQuery.trim()
    ? {
        letters: db
          .getLettersIn(activeMahadId)
          .filter(l =>
            l.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.nomor_surat.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        lettersOut: db
          .getLettersOut(activeMahadId)
          .filter(l =>
            l.perihal.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.nomor_surat.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        meetings: db
          .getMeetings(activeMahadId)
          .filter(m =>
            m.judul_rapat.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.agenda.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        decisions: db
          .getDecisions(activeMahadId)
          .filter(d =>
            d.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.nomor_sk.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        recommendations: db
          .getRecommendations(activeMahadId)
          .filter(r =>
            r.isi_rekomendasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.target_unit_name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      }
    : null;

  // Unauthenticated: Render Login Page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeMahadId={activeMahadId}
        onSelectMahad={handleSelectMahad}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleSidebar={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={mod => handleNavigate(mod)}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Workspace Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentModule === 'dashboard' && (
              <Dashboard
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                onNavigate={handleNavigate}
              />
            )}

            {currentModule === 'surat_masuk' && (
              <SuratMasuk
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                onNavigateToDisposisi={() => handleNavigate('disposisi')}
              />
            )}

            {currentModule === 'surat_keluar' && (
              <SuratKeluar
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'sk' && (
              <SuratKeputusan
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'disposisi' && (
              <Disposisi
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'agenda' && (
              <AgendaSekretariat
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'arsip' && (
              <ArsipDigital
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'template' && (
              <TemplateDokumen
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'permohonan' && (
              <PermohonanAdministrasi
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {/* Rapat & Notulensi & Rekomendasi Workflow */}
            {currentModule === 'rapat' && (
              <DataRapat
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                onNavigateToNotulensi={id => {
                  setSelectedMeetingId(id);
                  setCurrentModule('notulensi');
                }}
                onNavigateToRekomendasi={id => {
                  setSelectedMeetingId(id);
                  setCurrentModule('rekomendasi');
                }}
              />
            )}

            {currentModule === 'notulensi' && (
              <NotulensiRapat
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'rekomendasi' && (
              <RekomendasiRapat
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                initialMeetingId={selectedMeetingId}
                onNavigateToMonitoring={() => setCurrentModule('monitoring_rekomendasi')}
              />
            )}

            {currentModule === 'monitoring_rekomendasi' && (
              <MonitoringRekomendasi
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {/* Pelaporan */}
            {(currentModule === 'laporan_mingguan' ||
              currentModule === 'validasi_laporan' ||
              currentModule === 'laporan_bulanan' ||
              currentModule === 'laporan_tahunan') && (
              <LaporanUnit
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'statistik' && (
              <StatistikAnalitik
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {currentModule === 'ekspedisi' && (
              <BukuEkspedisi
                currentUser={currentUser}
                activeMahadId={activeMahadId}
              />
            )}

            {/* Manajemen Pengguna, Organisasi, dan Audit */}
            {(currentModule === 'users' || currentModule === 'pengguna') && (
              <UserManagement
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                initialTab="users"
              />
            )}

            {currentModule === 'organisasi' && (
              <UserManagement
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                initialTab="organisasi"
              />
            )}

            {currentModule === 'audit_log' && (
              <UserManagement
                currentUser={currentUser}
                activeMahadId={activeMahadId}
                initialTab="audit"
              />
            )}

            {currentModule === 'notifikasi' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-[#0d5c3a]" />
                  Pusat Notifikasi & Informasi Terpadu
                </h2>
                <div className="divide-y divide-slate-100">
                  {db
                    .getState()
                    .notifications.filter(
                      n =>
                        n.user_id === currentUser.id ||
                        n.user_id === 'all' ||
                        (n.mahad_id === activeMahadId && n.user_id === 'all')
                    )
                    .map(notif => (
                      <div
                        key={notif.id}
                        className={`p-4 rounded-lg flex items-start justify-between gap-4 transition-colors ${
                          notif.read ? 'bg-white' : 'bg-emerald-50/40 border border-emerald-100'
                        }`}
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                          <p className="text-xs text-slate-600">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(notif.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        {!notif.read && (
                          <button
                            type="button"
                            onClick={() => db.markNotificationAsRead(notif.id)}
                            className="text-[11px] font-semibold text-[#0d5c3a] hover:underline shrink-0"
                          >
                            Tandai Dibaca
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SUPABASE STATUS MODAL */}
      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* GLOBAL SEARCH MODAL */}
      <Modal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        title="Pencarian Cepat IDARAH"
        subtitle="Cari dokumen, surat, rapat, SK, dan rekomendasi dalam satu tempat"
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Ketik kata kunci pencarian (cth: rapat, perizinan, mudir)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0d5c3a]/20"
            />
          </div>

          {searchResults && (
            <div className="max-h-80 overflow-y-auto space-y-4 divide-y divide-slate-100 pr-1">
              {searchResults.letters.length > 0 && (
                <div className="pt-2">
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                    Surat Masuk ({searchResults.letters.length})
                  </h5>
                  <div className="space-y-1.5">
                    {searchResults.letters.map(l => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentModule('surat_masuk');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{l.perihal}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{l.nomor_surat}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.meetings.length > 0 && (
                <div className="pt-2">
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                    Data Rapat ({searchResults.meetings.length})
                  </h5>
                  <div className="space-y-1.5">
                    {searchResults.meetings.map(m => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentModule('rapat');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{m.judul_rapat}</div>
                          <div className="text-[10px] text-slate-500">{m.tanggal} ({m.tempat})</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.decisions.length > 0 && (
                <div className="pt-2">
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                    Surat Keputusan ({searchResults.decisions.length})
                  </h5>
                  <div className="space-y-1.5">
                    {searchResults.decisions.map(d => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentModule('sk');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{d.judul}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{d.nomor_sk}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.recommendations.length > 0 && (
                <div className="pt-2">
                  <h5 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-2">
                    Rekomendasi Rapat ({searchResults.recommendations.length})
                  </h5>
                  <div className="space-y-1.5">
                    {searchResults.recommendations.map(r => (
                      <div
                        key={r.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setCurrentModule('monitoring_rekomendasi');
                        }}
                        className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-slate-800">{r.isi_rekomendasi}</div>
                          <div className="text-[10px] text-slate-500">Unit: {r.target_unit_name}</div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
