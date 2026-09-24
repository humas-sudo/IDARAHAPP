// IDARAH Authentication & Permission Control Service
// Role-Based and Permission-Based Access Control (RBAC & PBAC)

import { User, PermissionCode, RoleId } from '../types';
import { db } from './db';

const AUTH_USER_KEY = 'idarah_current_user_id';

class AuthService {
  private currentUser: User;
  private listeners: Set<(user: User) => void> = new Set();

  constructor() {
    this.currentUser = this.loadInitialUser();
  }

  private loadInitialUser(): User {
    const users = db.getUsers();
    try {
      const storedId = localStorage.getItem(AUTH_USER_KEY);
      if (storedId) {
        const found = users.find(u => u.id === storedId);
        if (found) return found;
      }
    } catch (e) {
      console.warn('Auth user load failed', e);
    }
    // Default to Super Admin for complete exploration, but with easy switcher
    return users.find(u => u.role_id === 'super_admin') || users[0];
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public switchUser(userId: string) {
    const users = db.getUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      this.currentUser = target;
      try {
        localStorage.setItem(AUTH_USER_KEY, userId);
      } catch (e) {}

      db.logAudit({
        user_id: target.id,
        user_name: target.name,
        user_role: target.role_id,
        mahad_id: target.mahad_id === 'all' ? 'mahad-banin' : target.mahad_id,
        action: 'LOGIN',
        entity: 'Autentikasi',
        entity_id: target.id,
        description: `User beralih ke profil: ${target.name} (${target.position_title} - Role: ${target.role_id})`
      });

      this.notify();
    }
  }

  public subscribe(listener: (user: User) => void): () => void {
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
    const roles = db.getRoles();
    const role = roles.find(r => r.id === this.currentUser.role_id);
    if (!role) return false;
    return role.permissions.includes(permission);
  }

  // Mahad Scope Isolation Check
  public canAccessMahad(targetMahadId: 'mahad-banin' | 'mahad-banat' | 'all'): boolean {
    if (!this.currentUser) return false;
    if (targetMahadId === 'all') return true;

    // If user has cross-mahad permission or their mahad is 'all'
    if (this.currentUser.mahad_id === 'all' || this.hasPermission('system.cross_mahad')) {
      return true;
    }

    return this.currentUser.mahad_id === targetMahadId;
  }

  // Unit Scope Isolation Check
  public canAccessUnit(targetUnitId: string): boolean {
    if (!this.currentUser) return false;

    // Super admin and sekretariat can access units within their allowed Mahad
    if (this.currentUser.role_id === 'super_admin' || this.currentUser.role_id === 'admin_sekretariat' || this.currentUser.role_id === 'validator_mudir') {
      const targetUnit = db.getUnitById(targetUnitId);
      if (!targetUnit) return true;
      return this.canAccessMahad(targetUnit.mahad_id);
    }

    // Regular unit reporter only accesses their assigned unit
    return this.currentUser.unit_id === targetUnitId;
  }

  // Check if current user is Mudir for a specific Mahad
  public isMudirForMahad(mahadId: 'mahad-banin' | 'mahad-banat'): boolean {
    if (this.currentUser.role_id === 'super_admin') return true;
    if (this.currentUser.role_id !== 'validator_mudir') return false;
    return this.currentUser.mahad_id === mahadId || this.currentUser.mahad_id === 'all';
  }
}

export const auth = new AuthService();
