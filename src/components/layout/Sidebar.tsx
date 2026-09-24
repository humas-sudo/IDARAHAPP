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
  ChevronRight
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
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  permission?: string;
  badge?: number | string;
  badgeColor?: string;
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
  currentUser
}) => {
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
          label: 'Dashboard',
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: 'Administrasi',
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
          label: 'Data Rapat',
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
          id: 'statistik',
          label: 'Statistik & Analitik',
          icon: BarChart3
        }
      ]
    },
    {
      title: 'Sistem & Konfigurasi',
      items: [
        {
          id: 'notifikasi',
          label: 'Pusat Notifikasi',
          icon: Bell
        },
        {
          id: 'pencarian',
          label: 'Pencarian Global',
          icon: Search
        },
        {
          id: 'organisasi',
          label: 'Struktur Organisasi & Unit',
          icon: Building,
          permission: 'system.org.manage'
        },
        {
          id: 'pengguna',
          label: 'Pengguna & Hak Akses',
          icon: ShieldCheck,
          permission: 'system.users.manage'
        },
        {
          id: 'audit_log',
          label: 'Audit Log & Riwayat',
          icon: History,
          permission: 'system.audit.view'
        }
      ]
    }
  ];

  const handleSelect = (id: string) => {
    onSelectModule(id);
    onCloseMobile();
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
        } lg:static lg:z-auto`}
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

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuGroups.map((group, groupIdx) => {
            // Filter items by permission
            const visibleItems = group.items.filter(item => {
              if (!item.permission) return true;
              return auth.hasPermission(item.permission as any);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
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

        {/* Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-300 bg-slate-950/50">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="font-semibold text-white">IDARAH v1.0</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
              UNIA Terpusat
            </span>
          </div>
          <p className="line-clamp-1 text-slate-400 text-[10px]">
            Universitas Al-Amien Prenduan
          </p>
        </div>
      </aside>
    </>
  );
};
