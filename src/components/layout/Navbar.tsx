import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  UserCheck,
  Shield,
  Building2,
  Menu,
  CheckCircle2,
  ExternalLink,
  Layers,
  Database,
  LogOut
} from 'lucide-react';
import { User, MahadId, Notification } from '../../types';
import { db } from '../../services/db';
import { auth } from '../../services/auth';
import { isSupabaseConfigured } from '../../services/supabase';
import { SupabaseStatusModal } from '../common/SupabaseStatusModal';

interface NavbarProps {
  currentUser: User;
  activeMahadId: MahadId;
  onSelectMahad: (id: MahadId) => void;
  onOpenSearch: () => void;
  onToggleSidebar: () => void;
  onNavigate: (module: string, subId?: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeMahadId,
  onSelectMahad,
  onOpenSearch,
  onToggleSidebar,
  onNavigate,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const users = db.getUsers();
  const mahads = db.getMahads();
  const canCrossMahad = auth.hasPermission('system.cross_mahad') || currentUser.mahad_id === 'all';

  useEffect(() => {
    const updateNotifs = () => {
      const allNotifs = db.getState().notifications;
      // Filter notifications relevant to current user
      const userNotifs = allNotifs.filter(
        n => n.user_id === currentUser.id || (n.mahad_id === currentUser.mahad_id && n.user_id === 'all')
      );
      setNotifications(userNotifs);
    };

    updateNotifs();
    const unsub = db.subscribe(updateNotifs);
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif: Notification) => {
    db.markNotificationAsRead(notif.id);
    setShowNotifications(false);

    // Route to entity
    if (notif.related_entity === 'recommendation') {
      onNavigate('monitoring_rekomendasi');
    } else if (notif.related_entity === 'weekly_report') {
      if (currentUser.role_id === 'validator_mudir') {
        onNavigate('validasi_laporan');
      } else {
        onNavigate('laporan_mingguan');
      }
    } else if (notif.related_entity === 'disposition') {
      onNavigate('disposisi');
    } else if (notif.related_entity === 'letter') {
      onNavigate('surat_masuk');
    } else {
      onNavigate('notifikasi');
    }
  };

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead(currentUser.id);
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0d5c3a] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#b48c36]">
              <span>U</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-[#0d5c3a] font-sans">
                  IDARAH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                  UNIA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Informasi & Administrasi Ma'had Al-Amien Prenduan
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Mahad Context Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <span className="text-slate-400 pl-2 pr-1 hidden md:inline flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Lingkup:
            </span>

            {canCrossMahad && (
              <button
                type="button"
                onClick={() => onSelectMahad('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  activeMahadId === 'all'
                    ? 'bg-white text-[#0d5c3a] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Ma'had
              </button>
            )}

            <button
              type="button"
              onClick={() => onSelectMahad('mahad-banin')}
              disabled={!canCrossMahad && currentUser.mahad_id !== 'mahad-banin'}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMahadId === 'mahad-banin'
                  ? 'bg-[#0d5c3a] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              Lil Banin (Putra)
            </button>

            <button
              type="button"
              onClick={() => onSelectMahad('mahad-banat')}
              disabled={!canCrossMahad && currentUser.mahad_id !== 'mahad-banat'}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeMahadId === 'mahad-banat'
                  ? 'bg-[#0d5c3a] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              Lil Banat (Putri)
            </button>
          </div>
        </div>

        {/* Right: Search, Notification Bell, User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Connection Status Pill */}
          <button
            type="button"
            onClick={() => setShowSupabaseModal(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isSupabaseConfigured()
                ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            title="Pengaturan & Status Supabase"
          >
            <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {isSupabaseConfigured() ? 'Supabase' : 'Database'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSupabaseConfigured() ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Global Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 text-xs transition-colors"
            title="Pencarian Global (Ctrl/Cmd + K)"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Cari Dokumen...</span>
            <kbd className="hidden lg:inline px-1.5 py-0.5 text-[10px] font-mono bg-white rounded border border-slate-300 text-slate-400">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">Notifikasi Masuk</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#0d5c3a] hover:underline font-medium"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi saat ini
                    </div>
                  ) : (
                    notifications.slice(0, 6).map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.read ? 'bg-emerald-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(n.created_at).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 p-2 text-center bg-slate-50">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('notifikasi');
                    }}
                    className="text-xs font-medium text-[#0d5c3a] hover:underline"
                  >
                    Buka Pusat Notifikasi Lengkap →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account & Quick Demo Switcher */}
          <div className="relative" ref={userRef}>
            <button
              type="button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.name
                  .split(' ')
                  .map(s => s[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden xl:block text-left text-xs">
                <div className="font-bold text-slate-800 line-clamp-1 max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.position_title}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Active User Card */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#0d5c3a]" />
                    <span className="text-xs font-bold text-slate-800">{currentUser.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 font-medium">{currentUser.position_title}</p>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                      Role: {currentUser.role_id}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                      {currentUser.mahad_id === 'all'
                        ? 'Multi-Ma’had'
                        : currentUser.mahad_id === 'mahad-banin'
                        ? 'Putra (LBN)'
                        : 'Putri (LBT)'}
                    </span>
                  </div>
                </div>

                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Ganti Akun Demo (Uji Role)
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        auth.switchUser(u.id);
                        if (u.mahad_id !== 'all') {
                          onSelectMahad(u.mahad_id);
                        }
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        u.id === currentUser.id
                          ? 'bg-emerald-50 text-emerald-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.position_title}</div>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2 px-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onLogout) {
                        onLogout();
                      } else {
                        auth.logout();
                      }
                    }}
                    className="w-full py-2 px-3 text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Keluar Akun (Logout)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Kembalikan database ke data awal demo Universitas Al-Amien Prenduan?')) {
                        db.resetToDefault();
                        setShowUserMenu(false);
                      }
                    }}
                    className="w-full py-1 text-center text-[11px] text-slate-400 hover:text-slate-600 hover:underline"
                  >
                    Reset Data Demo ke Default
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SupabaseStatusModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </header>
  );
};
