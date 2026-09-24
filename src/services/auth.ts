// IDARAH Authentication & Permission Control Service
// Role-Based and Permission-Based Access Control (RBAC & PBAC)

import { User, PermissionCode, RoleId } from '../types';
import { db } from './db';

const AUTH_USER_KEY = 'idarah_current_user_id';
const AUTH_LOGGED_IN_KEY = 'idarah_is_authenticated';

export interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
}

class AuthService {
  private currentUser: User | null = null;
  private authenticated: boolean = false;
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    this.initSession();
  }

  private initSession() {
    try {
      const isAuthStored = localStorage.getItem(AUTH_LOGGED_IN_KEY);
      const storedId = localStorage.getItem(AUTH_USER_KEY);
      const users = db.getUsers();

      if (isAuthStored === 'true' && storedId) {
        const found = users.find(u => u.id === storedId && u.is_active);
        if (found) {
          this.currentUser = found;
          this.authenticated = true;
          return;
        }
      }
      
      // If no valid session exists, start unauthenticated to show LoginPage
      this.currentUser = null;
      this.authenticated = false;
    } catch (e) {
      console.warn('Auth session init failed', e);
      this.currentUser = null;
      this.authenticated = false;
    }
  }

  public isAuthenticated(): boolean {
    return this.authenticated && this.currentUser !== null;
  }

  public getCurrentUser(): User {
    if (this.currentUser) {
      return this.currentUser;
    }
    // Fallback safe default user if called during transition
    const users = db.getUsers();
    return users.find(u => u.role_id === 'super_admin') || users[0];
  }

  /**
   * Login with email, username, or ID + optional password
   */
  public async login(identifier: string, password?: string): Promise<LoginResult> {
    const cleanId = identifier.trim().toLowerCase();
    const users = db.getUsers();

    if (!cleanId) {
      return {
        success: false,
        message: 'Masukkan email atau ID pengguna Anda.'
      };
    }

    // Match by email, id, or first name
    const target = users.find(u => {
      const email = (u.email || '').toLowerCase();
      const id = (u.id || '').toLowerCase();
      const name = (u.name || '').toLowerCase();
      return (
        email === cleanId ||
        id === cleanId ||
        email.split('@')[0] === cleanId ||
        name.includes(cleanId)
      );
    });

    if (!target) {
      return {
        success: false,
        message: 'Kredensial tidak ditemukan. Pastikan email atau username terdaftar di IDARAH UNIA.'
      };
    }

    if (!target.is_active) {
      return {
        success: false,
        message: 'Akun Anda dinonaktifkan oleh administrator. Silakan hubungi Sekretariat UNIA.'
      };
    }

    // Password validation (Accepts standard demo passwords or any non-empty password in demo environment)
    if (password !== undefined) {
      const cleanPass = password.trim();
      // Allow demo default passwords: admin123, unia2026, password, or matching user id prefix
      const validDemoPasswords = ['admin123', 'unia2026', 'unia123', 'idarah2026', '123456'];
      const isKnownPass = validDemoPasswords.includes(cleanPass.toLowerCase());
      
      if (cleanPass.length > 0 && !isKnownPass && cleanPass !== 'admin') {
        // Still allow for flexibility, but warn if too short
        if (cleanPass.length < 4) {
          return {
            success: false,
            message: 'Kata sandi minimal 4 karakter (Gunakan "unia2026" atau "admin123" untuk demo).'
          };
        }
      }
    }

    // Set authenticated state
    this.currentUser = target;
    this.authenticated = true;

    try {
      localStorage.setItem(AUTH_USER_KEY, target.id);
      localStorage.setItem(AUTH_LOGGED_IN_KEY, 'true');
    } catch (e) {
      console.warn('Storage save failed', e);
    }

    db.logAudit({
      user_id: target.id,
      user_name: target.name,
      user_role: target.role_id,
      mahad_id: target.mahad_id === 'all' ? 'mahad-banin' : target.mahad_id,
      action: 'LOGIN',
      entity: 'Autentikasi',
      entity_id: target.id,
      description: `Pengguna berhasil login ke IDARAH UNIA: ${target.name} (${target.position_title})`
    });

    this.notify();

    return {
      success: true,
      message: `Selamat datang, ${target.name}!`,
      user: target
    };
  }

  /**
   * Fast one-click login for demonstration roles
   */
  public quickLogin(userId: string): LoginResult {
    const users = db.getUsers();
    const target = users.find(u => u.id === userId);

    if (!target) {
      return { success: false, message: 'Akun percontohan tidak ditemukan.' };
    }

    this.currentUser = target;
    this.authenticated = true;

    try {
      localStorage.setItem(AUTH_USER_KEY, target.id);
      localStorage.setItem(AUTH_LOGGED_IN_KEY, 'true');
    } catch (e) {}

    db.logAudit({
      user_id: target.id,
      user_name: target.name,
      user_role: target.role_id,
      mahad_id: target.mahad_id === 'all' ? 'mahad-banin' : target.mahad_id,
      action: 'LOGIN',
      entity: 'Autentikasi',
      entity_id: target.id,
      description: `Masuk cepat peran: ${target.name} (${target.position_title})`
    });

    this.notify();
    return { success: true, message: `Masuk sebagai ${target.name}`, user: target };
  }

  /**
   * Logout user and clear session
   */
  public logout(): void {
    if (this.currentUser) {
      db.logAudit({
        user_id: this.currentUser.id,
        user_name: this.currentUser.name,
        user_role: this.currentUser.role_id,
        mahad_id: this.currentUser.mahad_id === 'all' ? 'mahad-banin' : this.currentUser.mahad_id,
        action: 'LOGOUT',
        entity: 'Autentikasi',
        entity_id: this.currentUser.id,
        description: `Pengguna keluar (logout) dari sistem: ${this.currentUser.name}`
      });
    }

    this.currentUser = null;
    this.authenticated = false;

    try {
      localStorage.removeItem(AUTH_LOGGED_IN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {}

    this.notify();
  }

  /**
   * Switch active user while authenticated
   */
  public switchUser(userId: string) {
    const users = db.getUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      this.currentUser = target;
      this.authenticated = true;
      try {
        localStorage.setItem(AUTH_USER_KEY, userId);
        localStorage.setItem(AUTH_LOGGED_IN_KEY, 'true');
      } catch (e) {}

      db.logAudit({
        user_id: target.id,
        user_name: target.name,
        user_role: target.role_id,
        mahad_id: target.mahad_id === 'all' ? 'mahad-banin' : target.mahad_id,
        action: 'LOGIN',
        entity: 'Autentikasi',
        entity_id: target.id,
        description: `Beralih ke profil: ${target.name} (${target.position_title} - Role: ${target.role_id})`
      });

      this.notify();
    }
  }

  public subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }

  // Permission Check
  public hasPermission(permission: PermissionCode): boolean {
    if (!this.currentUser) return false;
    // Super admin has unrestricted, complete permission across all modules
    if (this.currentUser.role_id === 'super_admin') return true;

    const roles = db.getRoles();
    const role = roles.find(r => r.id === this.currentUser?.role_id);
    if (!role) return false;
    return role.permissions.includes(permission);
  }

  // Mahad Scope Isolation Check
  public canAccessMahad(targetMahadId: 'mahad-banin' | 'mahad-banat' | 'all'): boolean {
    if (!this.currentUser) return false;
    if (targetMahadId === 'all') return true;

    // Super admin or cross-mahad authority
    if (this.currentUser.role_id === 'super_admin') return true;
    if (this.currentUser.mahad_id === 'all' || this.hasPermission('system.cross_mahad')) {
      return true;
    }

    return this.currentUser.mahad_id === targetMahadId;
  }

  // Unit Scope Isolation Check
  public canAccessUnit(targetUnitId: string): boolean {
    if (!this.currentUser) return false;

    // Super admin, sekretariat, and mudir can access units within their allowed Mahad
    if (
      this.currentUser.role_id === 'super_admin' ||
      this.currentUser.role_id === 'admin_sekretariat' ||
      this.currentUser.role_id === 'validator_mudir'
    ) {
      const targetUnit = db.getUnitById(targetUnitId);
      if (!targetUnit) return true;
      return this.canAccessMahad(targetUnit.mahad_id);
    }

    // Regular unit reporter only accesses their assigned unit
    return this.currentUser.unit_id === targetUnitId;
  }

  // Check if current user is Mudir for a specific Mahad
  public isMudirForMahad(mahadId: 'mahad-banin' | 'mahad-banat'): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role_id === 'super_admin') return true;
    if (this.currentUser.role_id !== 'validator_mudir') return false;
    return this.currentUser.mahad_id === mahadId || this.currentUser.mahad_id === 'all';
  }
}

export const auth = new AuthService();
