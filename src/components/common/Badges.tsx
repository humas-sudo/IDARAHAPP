import React from 'react';
import { LetterPriority, RecommendationPriority, RecommendationStatus, WeeklyReportStatus } from '../../types';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Draft':
    case 'Direncanakan':
    case 'Disusun':
      colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'Diajukan':
    case 'Diproses':
    case 'Diperiksa':
    case 'Sedang Ditindaklanjuti':
    case 'Berlangsung':
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'Menunggu Validasi':
    case 'Menunggu Tanda Tangan':
    case 'Menunggu':
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'Perlu Revisi':
      colorClass = 'bg-orange-50 text-orange-800 border-orange-200';
      break;
    case 'Disetujui':
    case 'Disahkan':
    case 'Selesai':
    case 'Final':
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'Ditolak':
    case 'Terlambat':
    case 'Dibatalkan':
      colorClass = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
    case 'Didisposisi':
      colorClass = 'bg-purple-50 text-purple-800 border-purple-200';
      break;
    case 'Diarsipkan':
    case 'Ditutup':
      colorClass = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
    default:
      colorClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center rounded-full border ${px} ${colorClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {status}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: LetterPriority | RecommendationPriority }> = ({ priority }) => {
  let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (priority === 'Mendesak' || priority === 'Rahasia') {
    badgeClass = 'bg-rose-100 text-rose-800 border-rose-300 font-semibold';
  } else if (priority === 'Tinggi' || priority === 'Segera') {
    badgeClass = 'bg-amber-100 text-amber-800 border-amber-300 font-medium';
  } else if (priority === 'Sedang' || priority === 'Penting') {
    badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
  } else {
    badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${badgeClass}`}>
      {priority}
    </span>
  );
};

export const DeadlineIndicator: React.FC<{ deadline: string; status: string }> = ({ deadline, status }) => {
  if (status === 'Selesai' || status === 'Ditutup' || status === 'Disetujui') {
    return (
      <span className="inline-flex items-center text-xs text-emerald-700 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
        Selesai ({deadline})
      </span>
    );
  }

  const now = new Date();
  const deadDate = new Date(deadline);
  const diffDays = Math.ceil((deadDate.getTime() - now.getTime()) / (1000 * 3600 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center text-xs text-rose-700 font-semibold">
        <span className="w-2 h-2 rounded-full bg-rose-600 mr-1.5 animate-ping"></span>
        Terlambat {Math.abs(diffDays)} hari ({deadline})
      </span>
    );
  } else if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center text-xs text-amber-700 font-medium">
        <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
        Mendekati Deadline ({diffDays} hari lagi - {deadline})
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center text-xs text-slate-600">
        <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5"></span>
        Aman ({diffDays} hari lagi - {deadline})
      </span>
    );
  }
};
