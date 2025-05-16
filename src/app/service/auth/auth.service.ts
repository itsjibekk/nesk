import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private payload?: JwtPayload;

  constructor() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) this.decode(token);
  }

  login(token: string) {
    localStorage.setItem(this.tokenKey, token);
    this.decode(token);
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.payload = undefined;
  }

  private decode(token: string) {
    try {
      this.payload = jwtDecode<JwtPayload>(token);
    } catch {
      this.payload = undefined;
    }
  }

  get roles(): string[] {
    return this.payload?.roles ?? [];
  }

  get isLoggedIn(): boolean {
    return !!this.payload;
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }
}
