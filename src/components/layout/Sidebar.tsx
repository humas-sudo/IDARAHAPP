import React from 'react';
import {
  LayoutDashboard,
  Mail,
  Send,
  FileCheck2,
  Workflow,
  Calendar,
  Archive,
  FileCode2,
  FileQuestion,
  Users,
  FileText,
  ListTodo,
  TrendingUp,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  Bell,
  Search,
  Settings,
  ShieldCheck,
  History,
  Building,
  ChevronRight,
  Database,
  BookOpen,
  LogOut,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { User } from '../../types';
import { auth } from '../../services/auth';
import { db } from '../../services/db';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (module: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  currentUser: User;
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  badge?: number | string;
  badgeColor?: string;
  superAdminOnly?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpenMobile,
  onCloseMobile,
  currentUser,
  onLogout
}) => {
  const isSuperAdmin = currentUser.role_id === 'super_admin';

  const pendingReportsCount = db
    .getState()
    .weeklyReports.filter(
      r => r.status === 'Menunggu Validasi' && (currentUser.mahad_id === 'all' || r.mahad_id === currentUser.mahad_id)
    ).length;

  const activeRecCount = db
    .getState()
    .recommendations.filter(
      r =>
        (r.status === 'Baru' || r.status === 'Sedang Ditindaklanjuti') &&
        (currentUser.role_id === 'unit_reporter'
          ? r.target_unit_id === currentUser.unit_id
          : currentUser.mahad_id === 'all' || r.mahad_id === currentUser.mahad_id)
    ).length;

  const menuGroups: MenuGroup[] = [
    {
      title: 'Utama',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard Terpadu',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'Administrasi & Persuratan',
      items: [
        {
          id: 'surat_masuk',
          label: 'Surat Masuk',
          icon: Mail,
          permission: 'letters.in.view'
        },
        {
          id: 'surat_keluar',
          label: 'Surat Keluar',
          icon: Send,
          permission: 'letters.out.view'
        },
        {
          id: 'sk',
          label: 'Surat Keputusan (SK)',
          icon: FileCheck2,
          permission: 'decisions.view'
        },
        {
          id: 'disposisi',
          label: 'Disposisi Surat',
          icon: Workflow,
          permission: 'dispositions.view'
        },
        {
          id: 'agenda',
          label: 'Agenda Sekretariat',
          icon: Calendar,
          permission: 'agendas.view'
        },
        {
          id: 'arsip',
          label: 'Arsip Digital',
          icon: Archive,
          permission: 'archives.view'
        },
        {
          id: 'template',
          label: 'Template Dokumen',
          icon: FileCode2,
          permission: 'templates.view'
        },
        {
          id: 'permohonan',
          label: 'Permohonan Administrasi',
          icon: FileQuestion,
          permission: 'requests.view'
        }
      ]
    },
    {
      title: 'Rapat & Rekomendasi',
      items: [
        {
          id: 'rapat',
          label: 'Data Agenda Rapat',
          icon: Users,
          permission: 'meetings.view'
        },
        {
          id: 'notulensi',
          label: 'Notulensi Rapat',
          icon: FileText,
          permission: 'meetings.view'
        },
        {
          id: 'rekomendasi',
          label: 'Rekomendasi Rapat',
          icon: ListTodo,
          permission: 'meeting_recommendations.monitor',
          badge: activeRecCount > 0 ? activeRecCount : undefined,
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        {
          id: 'monitoring_rekomendasi',
          label: 'Monitoring & Tindak Lanjut',
          icon: TrendingUp,
          permission: 'meeting_recommendations.monitor'
        }
      ]
    },
    {
      title: 'Pelaporan Ma’had',
      items: [
        {
          id: 'laporan_mingguan',
          label: 'Laporan Mingguan Unit',
          icon: FileSpreadsheet,
          permission: 'weekly_reports.view'
        },
        {
          id: 'validasi_laporan',
          label: 'Validasi Laporan Mudir',
          icon: CheckSquare,
          permission: 'weekly_reports.validate',
          badge: pendingReportsCount > 0 ? `${pendingReportsCount}` : undefined,
          badgeColor: 'bg-rose-100 text-rose-800'
        },
        {
          id: 'laporan_bulanan',
          label: 'Laporan Bulanan',
          icon: FileText,
          permission: 'monthly_reports.view'
        },
        {
          id: 'laporan_tahunan',
          label: 'Laporan Tahunan',
          icon: FileCheck2,
          permission: 'annual_reports.view'
        },
        {
          id: 'ekspedisi',
          label: 'Buku Ekspedisi Surat',
          icon: BookOpen,
          permission: 'letters.out.view'
        },
        {
          id: 'statistik',
          label: 'Statistik & Analitik',
          icon: BarChart3
        }
      ]
    },
    {
      title: isSuperAdmin ? 'Manajemen & Sistem (Super Admin)' : 'Sistem & Konfigurasi',
      items: [
        {
          id: 'users',
          label: 'Pengguna & Hak Akses',
          icon: ShieldCheck,
          permission: 'system.users.manage'
        },
        {
          id: 'organisasi',
          label: 'Struktur Organisasi & Unit',
          icon: Building,
          permission: 'system.org.manage'
        },
        {
          id: 'audit_log',
          label: 'Audit Log & Riwayat Sistem',
          icon: History,
          permission: 'system.audit.view'
        },
        {
          id: 'database_sync',
          label: 'Database & Sinkronisasi Cloud',
          icon: Database,
          permission: 'system.users.manage'
        },
        {
          id: 'notifikasi',
          label: 'Pusat Notifikasi',
          icon: Bell
        },
        {
          id: 'pencarian',
          label: 'Pencarian Global',
          icon: Search
        }
      ]
    }
  ];

  const handleSelect = (id: string) => {
    onSelectModule(id);
    onCloseMobile();
  };

  const handleLogoutClick = () => {
    if (confirm(`Apakah Anda yakin ingin keluar dari akun ${currentUser.name}?`)) {
      if (onLogout) {
        onLogout();
      } else {
        auth.logout();
      }
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto border-r border-slate-800`}
      >
        {/* Brand in Sidebar (Mobile view) */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0d5c3a] text-white flex items-center justify-center font-bold text-sm border border-[#b48c36]">
              U
            </div>
            <span className="font-extrabold text-white text-base tracking-wider">
              IDARAH UNIA
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {/* Super Admin Status Banner */}
        {isSuperAdmin && (
          <div className="mx-3 mt-3 p-2.5 bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-600/40 rounded-xl flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                <span>Mode Super Admin</span>
                <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-extrabold">24 MODUL</span>
              </div>
              <p className="text-[10px] text-amber-200/70 truncate">
                Seluruh menu & otoritas terbuka penuh
              </p>
            </div>
          </div>
        )}

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {menuGroups.map((group, groupIdx) => {
            // Filter items by permission, but Super Admin sees ALL items
            const visibleItems = group.items.filter(item => {
              if (isSuperAdmin) return true;
              if (!item.permission) return true;
              return auth.hasPermission(item.permission as any);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.title}
                </div>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentModule === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-[#0d5c3a] text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.badgeColor || 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium truncate">
                {currentUser.position_title}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/70 text-slate-400 hover:text-rose-200 transition-colors shrink-0"
              title="Keluar dari sistem (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Universitas Al-Amien</span>
            <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
              UNIA v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
