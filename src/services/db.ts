// IDARAH Centralized Database Service
// Single Database, Multi-Mahad, Multi-Unit, Multi-User, Audit Trail & Reactive Listeners

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

import {
  INITIAL_MAHADS,
  INITIAL_UNITS,
  INITIAL_POSITIONS,
  INITIAL_ROLES,
  DEMO_USERS,
  INITIAL_REPORT_PERIODS,
  INITIAL_LETTERS_IN,
  INITIAL_LETTERS_OUT,
  INITIAL_DECISIONS,
  INITIAL_DISPOSITIONS,
  INITIAL_AGENDAS,
  INITIAL_ARCHIVES,
  INITIAL_TEMPLATES,
  INITIAL_REQUESTS,
  INITIAL_MEETINGS,
  INITIAL_MEETING_MINUTES,
  INITIAL_RECOMMENDATIONS,
  INITIAL_FOLLOW_UPS,
  INITIAL_WEEKLY_REPORTS,
  INITIAL_MONTHLY_REPORTS,
  INITIAL_ANNUAL_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_VERSION_HISTORIES
} from '../data/seedData';

import {
  getSupabaseClient,
  isSupabaseConfigured,
  getSupabaseCredentials
} from './supabase';

export interface DatabaseState {
  mahads: Mahad[];
  units: Unit[];
  positions: Position[];
  roles: Role[];
  users: User[];
  reportPeriods: ReportPeriod[];
  lettersIn: LetterIn[];
  lettersOut: LetterOut[];
  decisions: Decision[];
  dispositions: Disposition[];
  agendas: Agenda[];
  archives: Archive[];
  templates: DocumentTemplate[];
  requests: AdministrativeRequest[];
  meetings: Meeting[];
  meetingMinutes: MeetingMinute[];
  recommendations: MeetingRecommendation[];
  followUps: RecommendationFollowUp[];
  weeklyReports: WeeklyReport[];
  monthlyReports: MonthlyReport[];
  annualReports: AnnualReport[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  versionHistories: VersionHistory[];
}

const STORAGE_KEY = 'idarah_unia_central_db_v1';

class DatabaseService {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();
  private isSyncing = false;
  private lastSyncTime: string | null = null;
  private syncError: string | null = null;

  constructor() {
    this.state = this.loadState();
    if (typeof window !== 'undefined' && isSupabaseConfigured()) {
      setTimeout(() => {
        this.syncWithSupabase();
      }, 1200);
    }
  }

  private loadState(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all arrays exist
        return {
          mahads: parsed.mahads || INITIAL_MAHADS,
          units: parsed.units || INITIAL_UNITS,
          positions: parsed.positions || INITIAL_POSITIONS,
          roles: parsed.roles || INITIAL_ROLES,
          users: parsed.users || DEMO_USERS,
          reportPeriods: parsed.reportPeriods || INITIAL_REPORT_PERIODS,
          lettersIn: parsed.lettersIn || INITIAL_LETTERS_IN,
          lettersOut: parsed.lettersOut || INITIAL_LETTERS_OUT,
          decisions: parsed.decisions || INITIAL_DECISIONS,
          dispositions: parsed.dispositions || INITIAL_DISPOSITIONS,
          agendas: parsed.agendas || INITIAL_AGENDAS,
          archives: parsed.archives || INITIAL_ARCHIVES,
          templates: parsed.templates || INITIAL_TEMPLATES,
          requests: parsed.requests || INITIAL_REQUESTS,
          meetings: parsed.meetings || INITIAL_MEETINGS,
          meetingMinutes: parsed.meetingMinutes || INITIAL_MEETING_MINUTES,
          recommendations: parsed.recommendations || INITIAL_RECOMMENDATIONS,
          followUps: parsed.followUps || INITIAL_FOLLOW_UPS,
          weeklyReports: parsed.weeklyReports || INITIAL_WEEKLY_REPORTS,
          monthlyReports: parsed.monthlyReports || INITIAL_MONTHLY_REPORTS,
          annualReports: parsed.annualReports || INITIAL_ANNUAL_REPORTS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          auditLogs: parsed.auditLogs || INITIAL_AUDIT_LOGS,
          versionHistories: parsed.versionHistories || INITIAL_VERSION_HISTORIES
        };
      }
    } catch (e) {
      console.warn('Failed to load storage, using seed defaults', e);
    }

    return this.getInitialState();
  }

  private getInitialState(): DatabaseState {
    return {
      mahads: [...INITIAL_MAHADS],
      units: [...INITIAL_UNITS],
      positions: [...INITIAL_POSITIONS],
      roles: [...INITIAL_ROLES],
      users: [...DEMO_USERS],
      reportPeriods: [...INITIAL_REPORT_PERIODS],
      lettersIn: [...INITIAL_LETTERS_IN],
      lettersOut: [...INITIAL_LETTERS_OUT],
      decisions: [...INITIAL_DECISIONS],
      dispositions: [...INITIAL_DISPOSITIONS],
      agendas: [...INITIAL_AGENDAS],
      archives: [...INITIAL_ARCHIVES],
      templates: [...INITIAL_TEMPLATES],
      requests: [...INITIAL_REQUESTS],
      meetings: [...INITIAL_MEETINGS],
      meetingMinutes: [...INITIAL_MEETING_MINUTES],
      recommendations: [...INITIAL_RECOMMENDATIONS],
      followUps: [...INITIAL_FOLLOW_UPS],
      weeklyReports: [...INITIAL_WEEKLY_REPORTS],
      monthlyReports: [...INITIAL_MONTHLY_REPORTS],
      annualReports: [...INITIAL_ANNUAL_REPORTS],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      versionHistories: [...INITIAL_VERSION_HISTORIES]
    };
  }

  private persist(syncTable?: string, syncPayload?: any, action: 'upsert' | 'delete' = 'upsert') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to persist database state', e);
    }
    this.notify();
    if (syncTable && syncPayload) {
      this.syncEntityToSupabase(syncTable, syncPayload, action);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  public resetToDefault() {
    this.state = this.getInitialState();
    this.persist();
  }

  // --- SUPABASE SYNCHRONIZATION ---
  public getSupabaseSyncStatus() {
    const creds = getSupabaseCredentials();
    return {
      isConfigured: isSupabaseConfigured(),
      url: creds.url,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      error: this.syncError
    };
  }

  public async syncEntityToSupabase(
    table: string,
    payload: any,
    action: 'upsert' | 'delete' = 'upsert'
  ) {
    if (!isSupabaseConfigured()) return;
    const client = getSupabaseClient();
    if (!client) return;
    try {
      if (action === 'delete') {
        const { error } = await client.from(table).delete().eq('id', payload.id);
        if (error) {
          console.warn(`Supabase delete error on ${table}:`, error.message);
          this.syncError = `Gagal menghapus di ${table}: ${error.message}`;
          this.notify();
        }
      } else {
        const { error } = await client.from(table).upsert(payload);
        if (error) {
          console.warn(`Supabase upsert error on ${table}:`, error.message);
          this.syncError = `Gagal menyimpan di ${table}: ${error.message}`;
          this.notify();
        }
      }
    } catch (e: any) {
      console.warn(`Supabase background sync exception for ${table}:`, e?.message || e);
    }
  }

  public async pushAllToSupabase(): Promise<{
    success: boolean;
    message: string;
    details: { table: string; count: number; error?: string }[];
  }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Kredensial Supabase (URL / Anon Key) belum dikonfigurasi.',
        details: []
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Gagal menginisialisasi client Supabase.', details: [] };
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    const collections: { table: string; data: any[] }[] = [
      { table: 'mahads', data: this.state.mahads },
      { table: 'units', data: this.state.units },
      { table: 'positions', data: this.state.positions },
      { table: 'roles', data: this.state.roles },
      { table: 'users', data: this.state.users },
      { table: 'report_periods', data: this.state.reportPeriods },
      { table: 'letters_in', data: this.state.lettersIn },
      { table: 'letters_out', data: this.state.lettersOut },
      { table: 'decisions', data: this.state.decisions },
      { table: 'dispositions', data: this.state.dispositions },
      { table: 'agendas', data: this.state.agendas },
      { table: 'archives', data: this.state.archives },
      { table: 'templates', data: this.state.templates },
      { table: 'administrative_requests', data: this.state.requests },
      { table: 'meetings', data: this.state.meetings },
      { table: 'meeting_minutes', data: this.state.meetingMinutes },
      { table: 'meeting_recommendations', data: this.state.recommendations },
      { table: 'recommendation_follow_ups', data: this.state.followUps },
      { table: 'weekly_reports', data: this.state.weeklyReports },
      { table: 'monthly_reports', data: this.state.monthlyReports },
      { table: 'annual_reports', data: this.state.annualReports },
      { table: 'notifications', data: this.state.notifications }
    ];

    const details: { table: string; count: number; error?: string }[] = [];
    let firstError = '';

    for (const item of collections) {
      if (!item.data || item.data.length === 0) {
        details.push({ table: item.table, count: 0 });
        continue;
      }

      try {
        const { error } = await client.from(item.table).upsert(item.data);
        if (error) {
          if (!firstError) firstError = `${item.table}: ${error.message}`;
          details.push({ table: item.table, count: item.data.length, error: error.message });
        } else {
          details.push({ table: item.table, count: item.data.length });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!firstError) firstError = `${item.table}: ${msg}`;
        details.push({ table: item.table, count: item.data.length, error: msg });
      }
    }

    this.isSyncing = false;
    if (firstError) {
      this.syncError = `Gagal mengunggah beberapa tabel: ${firstError}`;
      this.notify();
      return {
        success: false,
        message: `Terjadi kendala saat mengunggah ke Supabase (${firstError}). Pastikan skrip supabase-schema.sql terbaru telah dijalankan di Supabase SQL Editor.`,
        details
      };
    }

    this.lastSyncTime = new Date().toISOString();
    this.syncError = null;
    this.notify();

    return {
      success: true,
      message: 'Seluruh data lokal berhasil diunggah dan disinkronkan ke basis data Supabase!',
      details
    };
  }

  public async syncWithSupabase(forcePush = false): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return {
        success: false,
        message: 'Kredensial Supabase (URL / Anon Key) belum dikonfigurasi. Menggunakan penyimpanan lokal offline.'
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Gagal menginisialisasi client Supabase.' };
    }

    this.isSyncing = true;
    this.syncError = null;
    this.notify();

    try {
      const syncTable = async <T>(
        table: string,
        localData: T[],
        updateState: (remote: T[]) => void
      ) => {
        const { data: remote, error: errSelect } = await client.from(table).select('*');
        if (errSelect) {
          throw new Error(`Tabel ${table}: ${errSelect.message}`);
        }
        if (!forcePush && remote && remote.length > 0) {
          updateState(remote as T[]);
        } else if (localData && localData.length > 0) {
          const { error: errUpsert } = await client.from(table).upsert(localData as any);
          if (errUpsert) {
            throw new Error(`Tabel ${table} (unggah): ${errUpsert.message}`);
          }
        }
      };

      // 1. Core Master Data
      await syncTable('mahads', this.state.mahads, r => { this.state.mahads = r; });
      await syncTable('units', this.state.units, r => { this.state.units = r; });
      await syncTable('positions', this.state.positions, r => { this.state.positions = r; });
      await syncTable('roles', this.state.roles, r => { this.state.roles = r; });
      await syncTable('users', this.state.users, r => { this.state.users = r; });
      await syncTable('report_periods', this.state.reportPeriods, r => { this.state.reportPeriods = r; });

      // 2. Persuratan & SK
      await syncTable('letters_in', this.state.lettersIn, r => { this.state.lettersIn = r; });
      await syncTable('letters_out', this.state.lettersOut, r => { this.state.lettersOut = r; });
      await syncTable('decisions', this.state.decisions, r => { this.state.decisions = r; });
      await syncTable('dispositions', this.state.dispositions, r => { this.state.dispositions = r; });

      // 3. Agenda, Arsip, Template, Permohonan
      await syncTable('agendas', this.state.agendas, r => { this.state.agendas = r; });
      await syncTable('archives', this.state.archives, r => { this.state.archives = r; });
      await syncTable('templates', this.state.templates, r => { this.state.templates = r; });
      await syncTable('administrative_requests', this.state.requests, r => { this.state.requests = r; });

      // 4. Rapat, Notulensi & Rekomendasi
      await syncTable('meetings', this.state.meetings, r => { this.state.meetings = r; });
      await syncTable('meeting_minutes', this.state.meetingMinutes, r => { this.state.meetingMinutes = r; });
      await syncTable('meeting_recommendations', this.state.recommendations, r => { this.state.recommendations = r; });
      await syncTable('recommendation_follow_ups', this.state.followUps, r => { this.state.followUps = r; });

      // 5. Laporan Berkala
      await syncTable('weekly_reports', this.state.weeklyReports, r => { this.state.weeklyReports = r; });
      await syncTable('monthly_reports', this.state.monthlyReports, r => { this.state.monthlyReports = r; });
      await syncTable('annual_reports', this.state.annualReports, r => { this.state.annualReports = r; });

      this.lastSyncTime = new Date().toISOString();
      this.isSyncing = false;
      this.persist();
      this.notify();

      return {
        success: true,
        message: 'Data berhasil disinkronisasi dua arah dengan Supabase!'
      };
    } catch (e: any) {
      const errorMsg = e?.message || 'Terjadi kesalahan saat sinkronisasi Supabase.';
      this.syncError = errorMsg;
      this.isSyncing = false;
      this.notify();
      return {
        success: false,
        message: errorMsg
      };
    }
  }

  // Getters
  public getState(): DatabaseState {
    return this.state;
  }

  public getMahads(): Mahad[] {
    return this.state.mahads;
  }

  public getMahadById(id: string): Mahad | undefined {
    return this.state.mahads.find(m => m.id === id);
  }

  public getUnits(mahadId?: string): Unit[] {
    if (!mahadId || mahadId === 'all') return this.state.units;
    return this.state.units.filter(u => u.mahad_id === mahadId);
  }

  public getUnitById(id: string): Unit | undefined {
    return this.state.units.find(u => u.id === id);
  }

  public getReportingUnits(mahadId?: string): Unit[] {
    return this.getUnits(mahadId).filter(u => u.is_reporting_unit && u.is_active);
  }

  public getUsers(): User[] {
    return this.state.users;
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find(u => u.id === id);
  }

  public getRoles(): Role[] {
    return this.state.roles;
  }

  public getPositions(): Position[] {
    return this.state.positions;
  }

  public getReportPeriods(): ReportPeriod[] {
    return this.state.reportPeriods;
  }

  // Audit Logging
  public getAuditLogs(): AuditLog[] {
    return this.state.auditLogs;
  }

  public logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>) {
    const newLog: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.state.auditLogs = [newLog, ...this.state.auditLogs];
    this.persist();
  }

  // Notifications
  public sendNotification(notif: Omit<Notification, 'id' | 'read' | 'created_at'>) {
    const newNotif: Notification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      read: false,
      created_at: new Date().toISOString(),
      ...notif
    };
    this.state.notifications = [newNotif, ...this.state.notifications];
    this.persist();
  }

  public markNotificationAsRead(id: string) {
    this.state.notifications = this.state.notifications.map(n =>
      n.id === id ? { ...n, read: true, read_at: new Date().toISOString() } : n
    );
    this.persist();
  }

  public markAllNotificationsAsRead(userId: string) {
    this.state.notifications = this.state.notifications.map(n =>
      n.user_id === userId ? { ...n, read: true, read_at: new Date().toISOString() } : n
    );
    this.persist();
  }

  // Version History
  public addVersionHistory(entry: Omit<VersionHistory, 'id' | 'timestamp'>) {
    const newVer: VersionHistory = {
      id: 'ver-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.state.versionHistories = [newVer, ...this.state.versionHistories];
    this.persist();
  }

  // --- CRUD: Surat Masuk ---
  public getLettersIn(mahadId?: string): LetterIn[] {
    if (!mahadId || mahadId === 'all') return this.state.lettersIn;
    return this.state.lettersIn.filter(l => l.mahad_id === mahadId);
  }

  public createLetterIn(data: Omit<LetterIn, 'id' | 'created_at' | 'updated_at'>, actorUser: User): LetterIn {
    const id = 'let-in-' + Date.now();
    const newLetter: LetterIn = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.lettersIn = [newLetter, ...this.state.lettersIn];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newLetter.mahad_id,
      action: 'CREATE',
      entity: 'Surat Masuk',
      entity_id: newLetter.id,
      description: `Mencatat Surat Masuk No. ${newLetter.nomor_surat} (${newLetter.perihal})`
    });

    this.persist();
    return newLetter;
  }

  public updateLetterIn(id: string, data: Partial<LetterIn>, actorUser: User): LetterIn | undefined {
    const existing = this.state.lettersIn.find(l => l.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.state.lettersIn = this.state.lettersIn.map(l => (l.id === id ? updated : l));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Surat Masuk',
      entity_id: updated.id,
      description: `Memperbarui Surat Masuk No. ${updated.nomor_surat} (Status: ${updated.status})`
    });

    this.persist();
    return updated;
  }

  public deleteLetterIn(id: string, actorUser: User): boolean {
    const existing = this.state.lettersIn.find(l => l.id === id);
    if (!existing) return false;

    this.state.lettersIn = this.state.lettersIn.filter(l => l.id !== id);

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: existing.mahad_id,
      action: 'DELETE',
      entity: 'Surat Masuk',
      entity_id: id,
      description: `Menghapus Surat Masuk No. ${existing.nomor_surat}`
    });

    this.persist();
    return true;
  }

  // --- CRUD: Surat Keluar ---
  public getLettersOut(mahadId?: string): LetterOut[] {
    if (!mahadId || mahadId === 'all') return this.state.lettersOut;
    return this.state.lettersOut.filter(l => l.mahad_id === mahadId);
  }

  public createLetterOut(data: Omit<LetterOut, 'id' | 'created_at' | 'updated_at'>, actorUser: User): LetterOut {
    const id = 'let-out-' + Date.now();
    const newLetter: LetterOut = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.lettersOut = [newLetter, ...this.state.lettersOut];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newLetter.mahad_id,
      action: 'CREATE',
      entity: 'Surat Keluar',
      entity_id: newLetter.id,
      description: `Menerbitkan Surat Keluar No. ${newLetter.nomor_surat} kepada ${newLetter.tujuan}`
    });

    this.persist();
    return newLetter;
  }

  public updateLetterOut(id: string, data: Partial<LetterOut>, actorUser: User): LetterOut | undefined {
    const existing = this.state.lettersOut.find(l => l.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.state.lettersOut = this.state.lettersOut.map(l => (l.id === id ? updated : l));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Surat Keluar',
      entity_id: updated.id,
      description: `Memperbarui Surat Keluar No. ${updated.nomor_surat} (${updated.status})`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: SK / Keputusan ---
  public getDecisions(mahadId?: string): Decision[] {
    if (!mahadId || mahadId === 'all') return this.state.decisions;
    return this.state.decisions.filter(d => d.mahad_id === mahadId);
  }

  public createDecision(data: Omit<Decision, 'id' | 'created_at' | 'updated_at'>, actorUser: User): Decision {
    const id = 'sk-' + Date.now();
    const newSK: Decision = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.decisions = [newSK, ...this.state.decisions];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newSK.mahad_id,
      action: 'CREATE',
      entity: 'SK / Keputusan',
      entity_id: newSK.id,
      description: `Menyusun Surat Keputusan No. ${newSK.nomor_sk}: ${newSK.judul}`
    });

    this.persist();
    return newSK;
  }

  public updateDecision(id: string, data: Partial<Decision>, actorUser: User): Decision | undefined {
    const existing = this.state.decisions.find(d => d.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.state.decisions = this.state.decisions.map(d => (d.id === id ? updated : d));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'SK / Keputusan',
      entity_id: updated.id,
      description: `Memperbarui SK No. ${updated.nomor_sk} (${updated.status})`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Disposisi ---
  public getDispositions(mahadId?: string): Disposition[] {
    if (!mahadId || mahadId === 'all') return this.state.dispositions;
    return this.state.dispositions.filter(d => d.mahad_id === mahadId);
  }

  public createDisposition(data: Omit<Disposition, 'id' | 'created_at'>, actorUser: User): Disposition {
    const id = 'disp-' + Date.now();
    const newDisp: Disposition = {
      id,
      ...data,
      created_at: new Date().toISOString()
    };
    this.state.dispositions = [newDisp, ...this.state.dispositions];

    // Update the corresponding letter status to 'Didisposisi'
    const letter = this.state.lettersIn.find(l => l.id === newDisp.letter_in_id);
    if (letter) {
      this.state.lettersIn = this.state.lettersIn.map(l =>
        l.id === letter.id ? { ...l, status: 'Didisposisi', updated_at: new Date().toISOString() } : l
      );
    }

    // Find recipient users in target unit to send notification
    const targetUnitUsers = this.state.users.filter(u => u.unit_id === newDisp.target_unit_id);
    for (const u of targetUnitUsers) {
      this.sendNotification({
        user_id: u.id,
        mahad_id: newDisp.mahad_id,
        type: 'disposisi_baru',
        title: 'Disposisi Surat Masuk Baru',
        message: `Instruksi dari ${newDisp.pemberi_disposisi}: "${newDisp.instruksi.substring(0, 80)}...". Deadline: ${newDisp.deadline}`,
        related_entity: 'disposition',
        related_entity_id: newDisp.id
      });
    }

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newDisp.mahad_id,
      action: 'CREATE',
      entity: 'Disposisi',
      entity_id: newDisp.id,
      description: `Menerbitkan Disposisi Surat No. ${newDisp.letter_nomor} kepada ${newDisp.target_unit_name}`
    });

    this.persist();
    return newDisp;
  }

  public updateDisposition(id: string, data: Partial<Disposition>, actorUser: User): Disposition | undefined {
    const existing = this.state.dispositions.find(d => d.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data };
    this.state.dispositions = this.state.dispositions.map(d => (d.id === id ? updated : d));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Disposisi',
      entity_id: updated.id,
      description: `Update Disposisi (${updated.status}) - Target: ${updated.target_unit_name}`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Agenda ---
  public getAgendas(mahadId?: string): Agenda[] {
    if (!mahadId || mahadId === 'all') return this.state.agendas;
    return this.state.agendas.filter(a => a.mahad_id === mahadId);
  }

  public createAgenda(data: Omit<Agenda, 'id' | 'created_at'>, actorUser: User): Agenda {
    const id = 'agd-' + Date.now();
    const newAgenda: Agenda = {
      id,
      ...data,
      created_at: new Date().toISOString()
    };
    this.state.agendas = [newAgenda, ...this.state.agendas];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newAgenda.mahad_id,
      action: 'CREATE',
      entity: 'Agenda',
      entity_id: newAgenda.id,
      description: `Menambahkan agenda baru: ${newAgenda.judul} (${newAgenda.tanggal} ${newAgenda.waktu_mulai})`
    });

    this.persist();
    return newAgenda;
  }

  public updateAgenda(id: string, data: Partial<Agenda>, actorUser: User): Agenda | undefined {
    const existing = this.state.agendas.find(a => a.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data };
    this.state.agendas = this.state.agendas.map(a => (a.id === id ? updated : a));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Agenda',
      entity_id: updated.id,
      description: `Memperbarui agenda: ${updated.judul} (${updated.status})`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Arsip Digital ---
  public getArchives(mahadId?: string): Archive[] {
    if (!mahadId || mahadId === 'all') return this.state.archives;
    return this.state.archives.filter(a => a.mahad_id === mahadId);
  }

  public createArchive(data: Omit<Archive, 'id' | 'created_at'>, actorUser: User): Archive {
    const id = 'arc-' + Date.now();
    const newArchive: Archive = {
      id,
      ...data,
      created_at: new Date().toISOString()
    };
    this.state.archives = [newArchive, ...this.state.archives];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newArchive.mahad_id,
      action: 'ARCHIVE',
      entity: 'Arsip Digital',
      entity_id: newArchive.id,
      description: `Menyimpan arsip digital: ${newArchive.judul} [${newArchive.kategori}]`
    });

    this.persist();
    return newArchive;
  }

  // --- CRUD: Templates ---
  public getTemplates(mahadId?: string): DocumentTemplate[] {
    if (!mahadId || mahadId === 'all') return this.state.templates;
    return this.state.templates.filter(t => t.mahad_id === 'all' || t.mahad_id === mahadId);
  }

  public createTemplate(data: Omit<DocumentTemplate, 'id' | 'updated_at'>, actorUser: User): DocumentTemplate {
    const id = 'tpl-' + Date.now();
    const newTemplate: DocumentTemplate = {
      id,
      ...data,
      updated_at: new Date().toISOString().split('T')[0]
    };
    this.state.templates = [newTemplate, ...this.state.templates];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newTemplate.mahad_id === 'all' ? 'mahad-banin' : newTemplate.mahad_id,
      action: 'CREATE',
      entity: 'Template Dokumen',
      entity_id: newTemplate.id,
      description: `Membuat template dokumen baru: ${newTemplate.nama}`
    });

    this.persist();
    return newTemplate;
  }

  public updateTemplate(id: string, data: Partial<DocumentTemplate>, actorUser: User): DocumentTemplate | undefined {
    const existing = this.state.templates.find(t => t.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data, updated_at: new Date().toISOString().split('T')[0] };
    this.state.templates = this.state.templates.map(t => (t.id === id ? updated : t));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id === 'all' ? 'mahad-banin' : updated.mahad_id,
      action: 'UPDATE',
      entity: 'Template Dokumen',
      entity_id: updated.id,
      description: `Memperbarui template dokumen: ${updated.nama}`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Permohonan Administrasi ---
  public getRequests(mahadId?: string): AdministrativeRequest[] {
    if (!mahadId || mahadId === 'all') return this.state.requests;
    return this.state.requests.filter(r => r.mahad_id === mahadId);
  }

  public createRequest(data: Omit<AdministrativeRequest, 'id' | 'created_at' | 'updated_at'>, actorUser: User): AdministrativeRequest {
    const id = 'req-' + Date.now();
    const newReq: AdministrativeRequest = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.requests = [newReq, ...this.state.requests];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newReq.mahad_id,
      action: 'CREATE',
      entity: 'Permohonan Administrasi',
      entity_id: newReq.id,
      description: `Pengajuan permohonan baru dari ${newReq.pemohon_name} (${newReq.jenis_permohonan})`
    });

    this.persist();
    return newReq;
  }

  public updateRequest(id: string, data: Partial<AdministrativeRequest>, actorUser: User): AdministrativeRequest | undefined {
    const existing = this.state.requests.find(r => r.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.state.requests = this.state.requests.map(r => (r.id === id ? updated : r));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Permohonan Administrasi',
      entity_id: updated.id,
      description: `Update status permohonan No. ${updated.id} -> ${updated.status}`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Rapat & Notulensi ---
  public getMeetings(mahadId?: string): Meeting[] {
    if (!mahadId || mahadId === 'all') return this.state.meetings;
    return this.state.meetings.filter(m => m.mahad_id === mahadId);
  }

  public getMeetingById(id: string): Meeting | undefined {
    return this.state.meetings.find(m => m.id === id);
  }

  public createMeeting(data: Omit<Meeting, 'id' | 'created_at'>, actorUser: User): Meeting {
    const id = 'mtg-' + Date.now();
    const newMeeting: Meeting = {
      id,
      ...data,
      created_at: new Date().toISOString()
    };
    this.state.meetings = [newMeeting, ...this.state.meetings];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newMeeting.mahad_id,
      action: 'CREATE',
      entity: 'Rapat',
      entity_id: newMeeting.id,
      description: `Menjadwalkan agenda rapat: ${newMeeting.judul_rapat} (${newMeeting.tanggal})`
    });

    this.persist();
    return newMeeting;
  }

  public getMinutes(mahadId?: string): MeetingMinute[] {
    if (!mahadId || mahadId === 'all') return this.state.meetingMinutes;
    return this.state.meetingMinutes.filter(m => m.mahad_id === mahadId);
  }

  public getMinuteByMeetingId(meetingId: string): MeetingMinute | undefined {
    return this.state.meetingMinutes.find(m => m.meeting_id === meetingId);
  }

  public createMinute(
    data: Omit<MeetingMinute, 'id' | 'version' | 'created_at' | 'updated_at'>,
    actorUser: User
  ): MeetingMinute {
    const id = 'min-' + Date.now();
    const newMinute: MeetingMinute = {
      id,
      ...data,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.meetingMinutes = [newMinute, ...this.state.meetingMinutes];

    // Mark meeting as having minute
    this.state.meetings = this.state.meetings.map(m =>
      m.id === newMinute.meeting_id ? { ...m, has_minute: true, minute_id: newMinute.id } : m
    );

    this.addVersionHistory({
      entity_type: 'minute',
      entity_id: newMinute.id,
      version_number: 1,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: 'Penyusunan notulensi rapat pertama.',
      snapshot: newMinute
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newMinute.mahad_id,
      action: 'CREATE',
      entity: 'Notulensi Rapat',
      entity_id: newMinute.id,
      description: `Mencatat notulensi rapat: ${newMinute.judul_rapat}`
    });

    this.persist();
    return newMinute;
  }

  public updateMinute(id: string, data: Partial<MeetingMinute>, changeSummary: string, actorUser: User): MeetingMinute | undefined {
    const existing = this.state.meetingMinutes.find(m => m.id === id);
    if (!existing) return undefined;

    const newVersion = existing.version + 1;
    const updated = {
      ...existing,
      ...data,
      version: newVersion,
      updated_at: new Date().toISOString()
    };

    this.state.meetingMinutes = this.state.meetingMinutes.map(m => (m.id === id ? updated : m));

    this.addVersionHistory({
      entity_type: 'minute',
      entity_id: id,
      version_number: newVersion,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: changeSummary || `Pembaruan notulensi rapat ke versi ${newVersion}`,
      snapshot: updated
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Notulensi Rapat',
      entity_id: updated.id,
      description: `Memperbarui notulensi rapat: ${updated.judul_rapat} (v${newVersion})`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Rekomendasi Rapat ---
  public getRecommendations(mahadId?: string): MeetingRecommendation[] {
    if (!mahadId || mahadId === 'all') return this.state.recommendations;
    return this.state.recommendations.filter(r => r.mahad_id === mahadId);
  }

  public getRecommendationById(id: string): MeetingRecommendation | undefined {
    return this.state.recommendations.find(r => r.id === id);
  }

  public createRecommendation(
    data: Omit<MeetingRecommendation, 'id' | 'created_at' | 'updated_at'>,
    actorUser: User
  ): MeetingRecommendation {
    const id = 'rec-' + Date.now();
    const newRec: MeetingRecommendation = {
      id,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.recommendations = [newRec, ...this.state.recommendations];

    // Notification automatically dispatched to target unit users!
    const targetUsers = this.state.users.filter(u => u.unit_id === newRec.target_unit_id);
    for (const u of targetUsers) {
      this.sendNotification({
        user_id: u.id,
        mahad_id: newRec.mahad_id,
        type: 'rekomendasi_baru',
        title: 'Rekomendasi Rapat Baru',
        message: `Anda mendapatkan rekomendasi tindak lanjut dari "${newRec.meeting_title}": "${newRec.isi_rekomendasi.substring(0, 90)}...". Deadline: ${newRec.deadline}`,
        related_entity: 'recommendation',
        related_entity_id: newRec.id
      });
    }

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newRec.mahad_id,
      action: 'CREATE',
      entity: 'Rekomendasi Rapat',
      entity_id: newRec.id,
      description: `Menerbitkan rekomendasi No. ${newRec.nomor_rekomendasi} untuk unit ${newRec.target_unit_name}`
    });

    this.persist();
    return newRec;
  }

  public updateRecommendation(
    id: string,
    data: Partial<MeetingRecommendation>,
    actorUser: User
  ): MeetingRecommendation | undefined {
    const existing = this.state.recommendations.find(r => r.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data, updated_at: new Date().toISOString() };
    this.state.recommendations = this.state.recommendations.map(r => (r.id === id ? updated : r));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Rekomendasi Rapat',
      entity_id: updated.id,
      description: `Update rekomendasi No. ${updated.nomor_rekomendasi} (Status: ${updated.status}, Progress: ${updated.progress_percent}%)`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Tindak Lanjut Rekomendasi (Follow-Up) ---
  public getFollowUps(recommendationId?: string): RecommendationFollowUp[] {
    if (!recommendationId) return this.state.followUps;
    return this.state.followUps.filter(f => f.recommendation_id === recommendationId);
  }

  public submitFollowUp(
    data: Omit<RecommendationFollowUp, 'id' | 'submitted_at'>,
    actorUser: User
  ): RecommendationFollowUp {
    const id = 'flw-' + Date.now();
    const newFollowUp: RecommendationFollowUp = {
      id,
      ...data,
      submitted_at: new Date().toISOString()
    };
    this.state.followUps = [newFollowUp, ...this.state.followUps];

    // Automatically update the recommendation status and progress
    const rec = this.state.recommendations.find(r => r.id === newFollowUp.recommendation_id);
    if (rec) {
      const isCompleted = newFollowUp.status_update === 'Selesai' || newFollowUp.progress_percent >= 100;
      this.updateRecommendation(
        rec.id,
        {
          status: newFollowUp.status_update,
          progress_percent: newFollowUp.progress_percent,
          tanggal_selesai: isCompleted ? newFollowUp.tanggal_pelaksanaan : rec.tanggal_selesai
        },
        actorUser
      );

      // Notify Sekretariat and Mudir
      const sekreUsers = this.state.users.filter(
        u => (u.role_id === 'admin_sekretariat' || u.role_id === 'validator_mudir') &&
             (u.mahad_id === rec.mahad_id || u.mahad_id === 'all')
      );
      for (const s of sekreUsers) {
        this.sendNotification({
          user_id: s.id,
          mahad_id: rec.mahad_id,
          type: 'tindak_lanjut_masuk',
          title: 'Tindak Lanjut Rekomendasi Masuk',
          message: `Unit ${rec.target_unit_name} melaporkan tindak lanjut untuk rekomendasi No. ${rec.nomor_rekomendasi}. Progres: ${newFollowUp.progress_percent}%.`,
          related_entity: 'recommendation',
          related_entity_id: rec.id
        });
      }
    }

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: rec ? rec.mahad_id : 'mahad-banin',
      action: 'SUBMIT',
      entity: 'Tindak Lanjut Rekomendasi',
      entity_id: newFollowUp.id,
      description: `Mengirim laporan tindak lanjut rekomendasi No. ${rec?.nomor_rekomendasi || newFollowUp.recommendation_id}`
    });

    this.persist();
    return newFollowUp;
  }

  // --- CRUD: Laporan Mingguan ---
  public getWeeklyReports(mahadId?: string): WeeklyReport[] {
    if (!mahadId || mahadId === 'all') return this.state.weeklyReports;
    return this.state.weeklyReports.filter(r => r.mahad_id === mahadId);
  }

  public getWeeklyReportById(id: string): WeeklyReport | undefined {
    return this.state.weeklyReports.find(r => r.id === id);
  }

  public createWeeklyReport(
    data: Omit<WeeklyReport, 'id' | 'version' | 'created_at' | 'updated_at'>,
    actorUser: User
  ): WeeklyReport {
    const id = 'rep-' + Date.now();
    const newReport: WeeklyReport = {
      id,
      ...data,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.weeklyReports = [newReport, ...this.state.weeklyReports];

    this.addVersionHistory({
      entity_type: 'weekly_report',
      entity_id: newReport.id,
      version_number: 1,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: 'Pembuatan draf laporan mingguan unit.',
      snapshot: newReport
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newReport.mahad_id,
      action: 'CREATE',
      entity: 'Laporan Mingguan',
      entity_id: newReport.id,
      description: `Membuat Laporan Mingguan ke-${newReport.minggu_ke} (${newReport.reporting_unit_name})`
    });

    this.persist();
    return newReport;
  }

  public updateWeeklyReport(
    id: string,
    data: Partial<WeeklyReport>,
    changeSummary: string,
    actorUser: User
  ): WeeklyReport | undefined {
    const existing = this.state.weeklyReports.find(r => r.id === id);
    if (!existing) return undefined;

    const newVersion = existing.version + 1;
    const updated = {
      ...existing,
      ...data,
      version: newVersion,
      updated_at: new Date().toISOString()
    };
    this.state.weeklyReports = this.state.weeklyReports.map(r => (r.id === id ? updated : r));

    this.addVersionHistory({
      entity_type: 'weekly_report',
      entity_id: id,
      version_number: newVersion,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: changeSummary || `Revisi laporan mingguan ke versi ${newVersion}`,
      snapshot: updated
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Laporan Mingguan',
      entity_id: updated.id,
      description: `Memperbarui Laporan Mingguan ${updated.reporting_unit_name} (Status: ${updated.status})`
    });

    this.persist();
    return updated;
  }

  public submitWeeklyReport(id: string, actorUser: User): WeeklyReport | undefined {
    const report = this.state.weeklyReports.find(r => r.id === id);
    if (!report) return undefined;

    const updated = {
      ...report,
      status: 'Menunggu Validasi' as const,
      submitted_at: new Date().toISOString(),
      submitted_by: actorUser.id,
      updated_at: new Date().toISOString()
    };
    this.state.weeklyReports = this.state.weeklyReports.map(r => (r.id === id ? updated : r));

    // Send notification to Mudir of this specific Mahad
    const mudirs = this.state.users.filter(
      u => u.role_id === 'validator_mudir' && (u.mahad_id === report.mahad_id || u.mahad_id === 'all')
    );
    for (const mudir of mudirs) {
      this.sendNotification({
        user_id: mudir.id,
        mahad_id: report.mahad_id,
        type: 'laporan_menunggu_validasi',
        title: 'Laporan Mingguan Menunggu Validasi',
        message: `${report.reporting_unit_name} telah mengajukan Laporan Mingguan ke-${report.minggu_ke} (${report.bulan} ${report.tahun}) untuk diperiksa.`,
        related_entity: 'weekly_report',
        related_entity_id: report.id
      });
    }

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: report.mahad_id,
      action: 'SUBMIT',
      entity: 'Laporan Mingguan',
      entity_id: report.id,
      description: `Mengajukan Laporan Mingguan ke-${report.minggu_ke} kepada Mudir Ma'had`
    });

    this.persist();
    return updated;
  }

  public validateWeeklyReport(
    id: string,
    action: 'approve' | 'revision' | 'reject',
    notes: string,
    mudirUser: User
  ): WeeklyReport | undefined {
    const report = this.state.weeklyReports.find(r => r.id === id);
    if (!report) return undefined;

    let newStatus: WeeklyReport['status'] = 'Disetujui';
    let actionType: AuditLog['action'] = 'APPROVE';

    if (action === 'revision') {
      newStatus = 'Perlu Revisi';
      actionType = 'REVISE';
    } else if (action === 'reject') {
      newStatus = 'Ditolak';
      actionType = 'REJECT';
    }

    const updated = {
      ...report,
      status: newStatus,
      catatan_mudir: notes,
      validated_at: new Date().toISOString(),
      validated_by: mudirUser.id,
      updated_at: new Date().toISOString()
    };
    this.state.weeklyReports = this.state.weeklyReports.map(r => (r.id === id ? updated : r));

    // Notify the submitter/unit
    const unitUsers = this.state.users.filter(u => u.unit_id === report.reporting_unit_id);
    for (const u of unitUsers) {
      this.sendNotification({
        user_id: u.id,
        mahad_id: report.mahad_id,
        type: action === 'approve' ? 'laporan_disetujui' : 'laporan_revisi',
        title: action === 'approve' ? 'Laporan Mingguan Disetujui' : 'Laporan Mingguan Perlu Revisi',
        message: `Mudir telah memvalidasi Laporan Mingguan ke-${report.minggu_ke}: ${notes || (action === 'approve' ? 'Disetujui tanpa catatan.' : 'Silakan lakukan revisi.')}`,
        related_entity: 'weekly_report',
        related_entity_id: report.id
      });
    }

    this.logAudit({
      user_id: mudirUser.id,
      user_name: mudirUser.name,
      user_role: mudirUser.role_id,
      mahad_id: report.mahad_id,
      action: actionType,
      entity: 'Laporan Mingguan',
      entity_id: report.id,
      description: `Mudir memvalidasi Laporan Mingguan ke-${report.minggu_ke} [${newStatus}]: ${notes || '-'}`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Laporan Bulanan ---
  public getMonthlyReports(mahadId?: string): MonthlyReport[] {
    if (!mahadId || mahadId === 'all') return this.state.monthlyReports;
    return this.state.monthlyReports.filter(r => r.mahad_id === mahadId);
  }

  public createMonthlyReport(
    data: Omit<MonthlyReport, 'id' | 'version' | 'created_at' | 'updated_at'>,
    actorUser: User
  ): MonthlyReport {
    const id = 'rep-m-' + Date.now();
    const newReport: MonthlyReport = {
      id,
      ...data,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.monthlyReports = [newReport, ...this.state.monthlyReports];

    this.addVersionHistory({
      entity_type: 'monthly_report',
      entity_id: newReport.id,
      version_number: 1,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: 'Penyusunan awal laporan bulanan oleh Sekretariat.',
      snapshot: newReport
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newReport.mahad_id,
      action: 'CREATE',
      entity: 'Laporan Bulanan',
      entity_id: newReport.id,
      description: `Menyusun Laporan Bulanan Sekretariat: ${newReport.judul}`
    });

    this.persist();
    return newReport;
  }

  public updateMonthlyReport(
    id: string,
    data: Partial<MonthlyReport>,
    changeSummary: string,
    actorUser: User
  ): MonthlyReport | undefined {
    const existing = this.state.monthlyReports.find(r => r.id === id);
    if (!existing) return undefined;

    const newVersion = existing.version + 1;
    const updated = {
      ...existing,
      ...data,
      version: newVersion,
      updated_at: new Date().toISOString()
    };
    this.state.monthlyReports = this.state.monthlyReports.map(r => (r.id === id ? updated : r));

    this.addVersionHistory({
      entity_type: 'monthly_report',
      entity_id: id,
      version_number: newVersion,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: changeSummary || `Revisi laporan bulanan ke versi ${newVersion}`,
      snapshot: updated
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Laporan Bulanan',
      entity_id: updated.id,
      description: `Memperbarui Laporan Bulanan ${updated.judul} (v${newVersion})`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: Laporan Tahunan ---
  public getAnnualReports(mahadId?: string): AnnualReport[] {
    if (!mahadId || mahadId === 'all') return this.state.annualReports;
    return this.state.annualReports.filter(r => r.mahad_id === mahadId);
  }

  public createAnnualReport(
    data: Omit<AnnualReport, 'id' | 'version' | 'created_at' | 'updated_at'>,
    actorUser: User
  ): AnnualReport {
    const id = 'rep-y-' + Date.now();
    const newReport: AnnualReport = {
      id,
      ...data,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.state.annualReports = [newReport, ...this.state.annualReports];

    this.addVersionHistory({
      entity_type: 'annual_report',
      entity_id: newReport.id,
      version_number: 1,
      author_id: actorUser.id,
      author_name: actorUser.name,
      change_summary: 'Penyusunan awal laporan tahunan oleh Sekretariat.',
      snapshot: newReport
    });

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newReport.mahad_id,
      action: 'CREATE',
      entity: 'Laporan Tahunan',
      entity_id: newReport.id,
      description: `Menyusun Laporan Tahunan Sekretariat: ${newReport.judul}`
    });

    this.persist();
    return newReport;
  }

  // --- CRUD: Unit & Organisasi ---
  public createUnit(data: Omit<Unit, 'id'>, actorUser: User): Unit {
    const id = 'unit-' + Date.now();
    const newUnit: Unit = { id, ...data };
    this.state.units = [...this.state.units, newUnit];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newUnit.mahad_id,
      action: 'CREATE',
      entity: 'Unit Organisasi',
      entity_id: newUnit.id,
      description: `Menambahkan unit kerja baru: ${newUnit.name} [${newUnit.code}]`
    });

    this.persist();
    return newUnit;
  }

  public updateUnit(id: string, data: Partial<Unit>, actorUser: User): Unit | undefined {
    const existing = this.state.units.find(u => u.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data };
    this.state.units = this.state.units.map(u => (u.id === id ? updated : u));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id,
      action: 'UPDATE',
      entity: 'Unit Organisasi',
      entity_id: updated.id,
      description: `Memperbarui unit kerja: ${updated.name}`
    });

    this.persist();
    return updated;
  }

  // --- CRUD: User Management ---
  public createUser(data: Omit<User, 'id'>, actorUser: User): User {
    const id = 'usr-' + Date.now();
    const newUser: User = { id, ...data };
    this.state.users = [...this.state.users, newUser];

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: newUser.mahad_id === 'all' ? 'mahad-banin' : newUser.mahad_id,
      action: 'CREATE',
      entity: 'Pengguna (User)',
      entity_id: newUser.id,
      description: `Menambahkan pengguna baru: ${newUser.name} (${newUser.email}) - Role: ${newUser.role_id}`
    });

    this.persist();
    return newUser;
  }

  public updateUser(id: string, data: Partial<User>, actorUser: User): User | undefined {
    const existing = this.state.users.find(u => u.id === id);
    if (!existing) return undefined;

    const updated = { ...existing, ...data };
    this.state.users = this.state.users.map(u => (u.id === id ? updated : u));

    this.logAudit({
      user_id: actorUser.id,
      user_name: actorUser.name,
      user_role: actorUser.role_id,
      mahad_id: updated.mahad_id === 'all' ? 'mahad-banin' : updated.mahad_id,
      action: 'UPDATE',
      entity: 'Pengguna (User)',
      entity_id: updated.id,
      description: `Memperbarui akun pengguna: ${updated.name} (${updated.role_id})`
    });

    this.persist();
    return updated;
  }
}

export const db = new DatabaseService();
